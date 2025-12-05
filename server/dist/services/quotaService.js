"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotaService = void 0;
const index_1 = require("../index");
class QuotaService {
    static async checkQuota(userId, sizeBytes) {
        const user = await index_1.prisma.user.findUnique({
            where: { id: userId },
            select: { usedBytes: true, totalQuotaBytes: true },
        });
        if (!user)
            return false;
        return (user.usedBytes + sizeBytes) <= user.totalQuotaBytes;
    }
    static async getQuota(userId) {
        const user = await index_1.prisma.user.findUnique({
            where: { id: userId },
            select: { usedBytes: true, totalQuotaBytes: true },
        });
        if (!user)
            throw new Error("User not found");
        return {
            usedBytes: user.usedBytes.toString(), // Convert BigInt to string for JSON
            totalQuotaBytes: user.totalQuotaBytes.toString(),
        };
    }
}
exports.QuotaService = QuotaService;
