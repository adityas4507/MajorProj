"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameFileSchema = exports.createFolderSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
exports.createFolderSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    parentId: zod_1.z.string().uuid().optional(),
});
exports.renameFileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    folderId: zod_1.z.string().uuid().nullable().optional(),
});
