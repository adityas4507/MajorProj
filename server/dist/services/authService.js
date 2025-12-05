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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const crypto = __importStar(require("crypto"));
const config_1 = require("../config");
const index_1 = require("../index");
const jwt_1 = require("../utils/jwt");
const password_1 = require("../utils/password");
class AuthService {
    static async register(email, password) {
        const existing = await index_1.prisma.user.findUnique({ where: { email } });
        if (existing)
            throw { status: 409, message: "Email already in use" };
        const passwordHash = await (0, password_1.hashPassword)(password);
        const user = await index_1.prisma.user.create({
            data: {
                email,
                passwordHash,
                totalQuotaBytes: BigInt(config_1.config.quota.defaultBytes)
            }
        });
        return this.generateTokens(user.id, user.email);
    }
    static async login(email, password) {
        const user = await index_1.prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash)
            throw { status: 401, message: "Invalid credentials" };
        if (user.isDeleted)
            throw { status: 403, message: "Account marked for deletion" };
        const ok = await (0, password_1.verifyPassword)(password, user.passwordHash);
        if (!ok)
            throw { status: 401, message: "Invalid credentials" };
        return this.generateTokens(user.id, user.email);
    }
    static async refresh(refreshToken) {
        let payload;
        try {
            payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        }
        catch {
            throw { status: 401, message: "Invalid refresh token" };
        }
        const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        const stored = await index_1.prisma.refreshToken.findFirst({
            where: { tokenHash, revoked: false, expiresAt: { gt: new Date() } }
        });
        if (!stored)
            throw { status: 401, message: "Refresh token not found" };
        const accessToken = (0, jwt_1.signAccessToken)(stored.userId);
        return { accessToken };
    }
    static async logout(refreshToken) {
        if (refreshToken) {
            const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
            await index_1.prisma.refreshToken.updateMany({ where: { tokenHash: hash }, data: { revoked: true } });
        }
    }
    static async generateTokens(userId, email) {
        const accessToken = (0, jwt_1.signAccessToken)(userId);
        const refreshToken = (0, jwt_1.signRefreshToken)(userId);
        const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        await index_1.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash,
                expiresAt: new Date(Date.now() + config_1.config.jwt.refreshTtlDays * 24 * 60 * 60 * 1000)
            }
        });
        return { accessToken, refreshToken, user: { id: userId, email } };
    }
}
exports.AuthService = AuthService;
