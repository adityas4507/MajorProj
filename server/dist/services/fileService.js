"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = require("../config");
const index_1 = require("../index");
require("multer");
class FileService {
    static async uploadFile(userId, file, folderId) {
        const user = await index_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.isDeleted)
            throw { status: 403, message: "User not allowed" };
        const size = BigInt(file.size);
        const newUsed = user.usedBytes + size;
        if (newUsed > user.totalQuotaBytes) {
            // cleanup tmp file
            fs.unlink(file.path, () => { });
            throw { status: 413, message: "Quota exceeded" };
        }
        // create a deterministic path
        const fileId = crypto_1.default.randomBytes(16).toString("hex");
        const userDir = path.join(config_1.config.storage.root, "users", userId);
        const destPath = path.join(userDir, fileId);
        await fs.promises.mkdir(userDir, { recursive: true });
        await fs.promises.rename(file.path, destPath);
        const saved = await index_1.prisma.$transaction(async (tx) => {
            const savedFile = await tx.file.create({
                data: {
                    id: fileId,
                    name: file.originalname,
                    mimeType: file.mimetype,
                    sizeBytes: size,
                    path: path.relative(config_1.config.storage.root, destPath),
                    ownerId: userId,
                    folderId: folderId || null
                }
            });
            await tx.user.update({
                where: { id: userId },
                data: { usedBytes: newUsed }
            });
            return savedFile;
        });
        return {
            ...saved,
            sizeBytes: saved.sizeBytes.toString()
        };
    }
    static async getDownloadStream(userId, fileId) {
        const file = await index_1.prisma.file.findUnique({ where: { id: fileId } });
        if (!file || file.ownerId !== userId || file.isDeleted) {
            throw { status: 404, message: "File not found" };
        }
        const fullPath = path.join(config_1.config.storage.root, file.path);
        if (!fs.existsSync(fullPath))
            throw { status: 404, message: "File on disk not found" };
        return {
            stream: fs.createReadStream(fullPath),
            name: file.name,
            mimeType: file.mimeType,
            size: file.sizeBytes
        };
    }
    static async deleteFile(userId, fileId) {
        // Soft delete
        const file = await index_1.prisma.file.findUnique({ where: { id: fileId } });
        if (!file || file.ownerId !== userId)
            throw { status: 404, message: "File not found" };
        await index_1.prisma.file.update({
            where: { id: fileId },
            data: { isDeleted: true, deletedAt: new Date() }
        });
    }
    static async getTrash(userId) {
        const files = await index_1.prisma.file.findMany({
            where: { ownerId: userId, isDeleted: true }
        });
        return files.map((f) => ({ ...f, sizeBytes: f.sizeBytes.toString() }));
    }
    static async restoreFile(userId, fileId) {
        const file = await index_1.prisma.file.findUnique({ where: { id: fileId } });
        if (!file || file.ownerId !== userId)
            throw { status: 404, message: "File not found" };
        await index_1.prisma.file.update({
            where: { id: fileId },
            data: { isDeleted: false, deletedAt: null }
        });
    }
    static async hardDeleteFile(userId, fileId) {
        const file = await index_1.prisma.file.findUnique({ where: { id: fileId } });
        if (!file || file.ownerId !== userId)
            throw { status: 404, message: "File not found" };
        const fullPath = path.join(config_1.config.storage.root, file.path);
        try {
            await fs.promises.unlink(fullPath);
        }
        catch (e) {
            console.error("Failed to delete file from disk", e);
        }
        await index_1.prisma.$transaction(async (tx) => {
            await tx.file.delete({ where: { id: fileId } });
            await tx.user.update({
                where: { id: userId },
                data: { usedBytes: { decrement: file.sizeBytes } }
            });
        });
    }
}
exports.FileService = FileService;
