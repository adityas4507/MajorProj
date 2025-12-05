"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const index_1 = require("../index");
class UserService {
    static async requestDeletion(userId) {
        const RETENTION_DAYS = 30;
        const purgeAt = new Date(Date.now() + RETENTION_DAYS * 24 * 60 * 60 * 1000);
        await index_1.prisma.user.update({
            where: { id: userId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                purgeAt
            }
        });
        return { success: true, purgeAt };
    }
    static async restoreAccount(userId) {
        await index_1.prisma.user.update({
            where: { id: userId },
            data: {
                isDeleted: false,
                deletedAt: null,
                purgeAt: null
            }
        });
        return { success: true };
    }
}
exports.UserService = UserService;
