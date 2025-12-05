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

export default router;
