import { Router } from "express";
import multer from "multer";
import { config } from "../config";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { FileService } from "../services/fileService";

const router = Router();
const upload = multer({ dest: config.storage.temp });

router.post("/upload", requireAuth, upload.single("file"), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    
    const result = await FileService.uploadFile(req.userId!, req.file, req.body.folderId);
    res.json({ file: result });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/download", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { stream, name, mimeType } = await FileService.getDownloadStream(req.userId!, req.params.id);
    
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(name)}"`);
    res.setHeader("Content-Type", mimeType || "application/octet-stream");

    stream.on("error", () => res.status(500).end());
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/view", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { stream, name, mimeType } = await FileService.getDownloadStream(req.userId!, req.params.id);
    
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(name)}"`);
    res.setHeader("Content-Type", mimeType || "application/octet-stream");

    stream.on("error", () => res.status(500).end());
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        await FileService.deleteFile(req.userId!, req.params.id);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});


router.get("/list", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const folderId = req.query.folderId as string | undefined;
        const result = await FileService.listContents(req.userId!, folderId);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.get("/trash/list", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const files = await FileService.getTrash(req.userId!);
        res.json({ files });
    } catch (err) {
        next(err);
    }
});

router.post("/:id/restore", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        await FileService.restoreFile(req.userId!, req.params.id);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

router.delete("/:id/hard", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        await FileService.hardDeleteFile(req.userId!, req.params.id);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

export default router;
