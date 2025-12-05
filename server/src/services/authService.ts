import * as crypto from "crypto";
import { config } from "../config";
import { prisma } from "../index";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/password";

export class AuthService {
  static async register(email: string, password: string) {
    email=email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw { status: 409, message: "Email already in use" };

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        totalQuotaBytes: BigInt(config.quota.defaultBytes)
      }
    });

    return this.generateTokens(user.id, user.email);
  }

  static async login(email: string, password: string) {
    email=email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw { status: 401, message: "Invalid credentials" };
    if (user.isDeleted) throw { status: 403, message: "Account marked for deletion" };

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw { status: 401, message: "Invalid credentials" };

    return this.generateTokens(user.id, user.email);
  }

  static async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw { status: 401, message: "Invalid refresh token" };
    }

    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const stored = await prisma.refreshToken.findFirst({
      where: { tokenHash, revoked: false, expiresAt: { gt: new Date() } }
    });
    if (!stored) throw { status: 401, message: "Refresh token not found" };

    const accessToken = signAccessToken(stored.userId);
    return { accessToken };
  }

  static async logout(refreshToken?: string) {
    if (refreshToken) {
      const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
      await prisma.refreshToken.updateMany({ where: { tokenHash: hash }, data: { revoked: true } });
    }
  }

  private static async generateTokens(userId: string, email: string) {
    const accessToken = signAccessToken(userId);
    const refreshToken = signRefreshToken(userId);
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + config.jwt.refreshTtlDays * 24 * 60 * 60 * 1000)
      }
    });

    return { accessToken, refreshToken, user: { id: userId, email } };
  }
}
