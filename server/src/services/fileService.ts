import crypto from "crypto";
import * as fs from "fs";
import { prisma } from "../index";

import { Prisma, File as PrismaFile } from "@prisma/client";
import "multer";

export class FileService {
  static async uploadFile(userId: string, file: Express.Multer.File, folderId?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.isDeleted) throw { status: 403, message: "User not allowed" };

    const size = BigInt(file.size);
    const newUsed = user.usedBytes + size;
    if (newUsed > user.totalQuotaBytes) {
      fs.unlink(file.path, () => {});
      throw { status: 413, message: "Quota exceeded" };
    }

    const fileId = crypto.randomBytes(16).toString("hex");
    
    // Use the new Secure RAID Storage Service
    // This handles Scanning -> RAID Write -> Cleanup
    let relativePath: string;
    try {
        // Import dynamically to avoid circular deps if any, or just standard import
        const { FileStorageService } = await import("../storage/FileStorageService");
        relativePath = await FileStorageService.storeFile(file.path, userId, fileId);
    } catch (e: any) {
        console.error("Upload failed:", e.message);
        throw { status: 400, message: e.message || "Upload failed" };
    }

    const saved = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const savedFile = await tx.file.create({
        data: {
          id: fileId,
          name: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: size,
          path: relativePath, // Now relative to storage root (users/uid/fid)
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

  static async getDownloadStream(userId: string, fileId: string) {
    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file || file.ownerId !== userId || file.isDeleted) {
      throw { status: 404, message: "File not found" };
    }

    try {
      const { FileStorageService } = await import("../storage/FileStorageService");
      const stream = FileStorageService.getReadStream(file.path);
      
      return {
        stream,
        name: file.name,
        mimeType: file.mimeType,
        size: file.sizeBytes
      };
    } catch (e) {
      throw { status: 404, message: "File on disk not found" };
    }
  }

  static async deleteFile(userId: string, fileId: string) {
      // Soft delete
      const file = await prisma.file.findUnique({ where: { id: fileId } });
      if (!file || file.ownerId !== userId) throw { status: 404, message: "File not found" };

      await prisma.file.update({
          where: { id: fileId },
          data: { isDeleted: true, deletedAt: new Date() }
      });
  }

  static async getTrash(userId: string) {
      const files = await prisma.file.findMany({
          where: { ownerId: userId, isDeleted: true }
      });
      return files.map((f: PrismaFile) => ({ ...f, sizeBytes: f.sizeBytes.toString() }));
  }

  static async restoreFile(userId: string, fileId: string) {
      const file = await prisma.file.findUnique({ where: { id: fileId } });
      if (!file || file.ownerId !== userId) throw { status: 404, message: "File not found" };

      await prisma.file.update({
          where: { id: fileId },
          data: { isDeleted: false, deletedAt: null }
      });
  }

  static async hardDeleteFile(userId: string, fileId: string) {
      const file = await prisma.file.findUnique({ where: { id: fileId } });
      if (!file || file.ownerId !== userId) throw { status: 404, message: "File not found" };

      try {
          const { FileStorageService } = await import("../storage/FileStorageService");
          await FileStorageService.deleteFile(file.path);
      } catch (e) {
          console.error("Failed to delete file from disk", e);
      }

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          await tx.file.delete({ where: { id: fileId } });
          await tx.user.update({
              where: { id: userId },
              data: { usedBytes: { decrement: file.sizeBytes } }
          });
      });
  }
  static async listContents(userId: string, folderId?: string) {
      // If folderId is provided, verify it exists and belongs to user
      if (folderId) {
          const folder = await prisma.folder.findUnique({ where: { id: folderId } });
          if (!folder || folder.ownerId !== userId) {
              throw { status: 404, message: "Folder not found" };
          }
      }

      const folders = await prisma.folder.findMany({
          where: {
              ownerId: userId,
              parentId: folderId || null
          },
          orderBy: { name: 'asc' }
      });

      const files = await prisma.file.findMany({
          where: {
              ownerId: userId,
              folderId: folderId || null,
              isDeleted: false
          },
          orderBy: { name: 'asc' }
      });

      return {
          folders,
          files: files.map((f: PrismaFile) => ({ ...f, sizeBytes: f.sizeBytes.toString() }))
      };
  }
}
