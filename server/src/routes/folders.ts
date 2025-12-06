import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { createFolderSchema } from "../utils/validation";

const router = Router();

router.post("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { name, parentId } = createFolderSchema.parse(req.body);
    
    // Check if parent exists and belongs to user
    if (parentId) {
      const parent = await prisma.folder.findUnique({ where: { id: parentId } });
      if (!parent || parent.ownerId !== req.userId) {
        return res.status(404).json({ error: "Parent folder not found" });
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        parentId,
        ownerId: req.userId!,
      },
    });

    res.json(folder);
  } catch (err) {
    if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors });
    }
    next(err);
  }
});

router.get("/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: req.params.id },
    });

    if (!folder || folder.ownerId !== req.userId) {
      return res.status(404).json({ error: "Folder not found" });
    }

    res.json(folder);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/list", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const folderId = req.params.id;
    
    // Verify folder ownership
    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder || folder.ownerId !== req.userId) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const folders = await prisma.folder.findMany({
      where: { parentId: folderId, ownerId: req.userId },
    });

    const files = await prisma.file.findMany({
      where: { folderId: folderId, ownerId: req.userId, isDeleted: false },
    });

    // Convert BigInt to string for JSON serialization
    const serializedFiles = files.map(f => ({
        ...f,
        sizeBytes: f.sizeBytes.toString()
    }));

    res.json({ folders, files: serializedFiles });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const folderId = req.params.id;

        // Verify folder ownership
        const folder = await prisma.folder.findUnique({ where: { id: folderId } });
        if (!folder || folder.ownerId !== req.userId) {
            return res.status(404).json({ error: "Folder not found" });
        }

        // Recursive function to find all subfolder IDs
        const getAllSubfolderIds = async (rootId: string): Promise<string[]> => {
            const children = await prisma.folder.findMany({
                where: { parentId: rootId },
                select: { id: true }
            });
            let ids = children.map(c => c.id);
            for (const childId of ids) {
                ids = [...ids, ...(await getAllSubfolderIds(childId))];
            }
            return ids;
        };

        const subfolderIds = await getAllSubfolderIds(folderId);
        const allFolderIds = [folderId, ...subfolderIds];

        // Soft delete all files in these folders
        await prisma.file.updateMany({
            where: {
                folderId: { in: allFolderIds },
                ownerId: req.userId
            },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });

        // Delete the folders
        // Due to Cascade delete on parentId, deleting the top folder should delete subfolders
        // But we want to ensure files are handled first (above)
        await prisma.folder.delete({
            where: { id: folderId }
        });

        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

router.patch("/:id", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const folderId = req.params.id;
        const { name } = req.body;

        if (!name) return res.status(400).json({ error: "Name is required" });

        const folder = await prisma.folder.findUnique({ where: { id: folderId } });
        if (!folder || folder.ownerId !== req.userId) {
            return res.status(404).json({ error: "Folder not found" });
        }

        const updated = await prisma.folder.update({
            where: { id: folderId },
            data: { name }
        });

        res.json(updated);
    } catch (err) {
        next(err);
    }
});

export default router;
