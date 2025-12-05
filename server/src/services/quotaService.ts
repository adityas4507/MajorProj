import { prisma } from "../index";

export class QuotaService {
  static async checkQuota(userId: string, sizeBytes: bigint): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { usedBytes: true, totalQuotaBytes: true },
    });

    if (!user) return false;

    return (user.usedBytes + sizeBytes) <= user.totalQuotaBytes;
  }

  static async getQuota(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { usedBytes: true, totalQuotaBytes: true },
    });
    
    if (!user) throw new Error("User not found");
    
    return {
      usedBytes: user.usedBytes.toString(), // Convert BigInt to string for JSON
      totalQuotaBytes: user.totalQuotaBytes.toString(),
    };
  }
}
