import { Prisma } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { config } from "../config";
import { prisma } from "../index";

export async function purgeDeletedUsersJob() {
  const now = new Date();
  const usersToPurge = await prisma.user.findMany({
    where: {
      isDeleted: true,
      purgeAt: { lte: now }
    },
    include: { files: true }
  });

  for (const user of usersToPurge) {
    const userDir = path.join(config.storage.root, "users", user.id);

    try {
      await fs.promises.rm(userDir, { recursive: true, force: true });
    } catch (e) {
      console.error("Error removing dir", userDir, e);
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.file.deleteMany({ where: { ownerId: user.id } });
      await tx.refreshToken.deleteMany({ where: { userId: user.id } });
      await tx.user.delete({ where: { id: user.id } });
    });
  }
}
