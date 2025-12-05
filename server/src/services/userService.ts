import { prisma } from "../index";

export class UserService {
  static async requestDeletion(userId: string) {
    const RETENTION_DAYS = 30;
    const purgeAt = new Date(Date.now() + RETENTION_DAYS * 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        purgeAt
      }
    });

    return { success: true, purgeAt };
  }

  static async restoreAccount(userId: string) {
      await prisma.user.update({
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
