"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const config_1 = require("../config");
const auth_1 = require("../middleware/auth");
const fileService_1 = require("../services/fileService");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: config_1.config.storage.temp });
router.post("/upload", auth_1.requireAuth, upload.single("file"), async (req, res, next) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: "No file uploaded" });
        const result = await fileService_1.FileService.uploadFile(req.userId, req.file, req.body.folderId);
        res.json({ file: result });
    }
    catch (err) {
        next(err);
    }
});
router.get("/:id/download", auth_1.requireAuth, async (req, res, next) => {
    try {
        const { stream, name, mimeType } = await fileService_1.FileService.getDownloadStream(req.userId, req.params.id);
        res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(name)}"`);
        res.setHeader("Content-Type", mimeType || "application/octet-stream");
        stream.on("error", () => res.status(500).end());
        stream.pipe(res);
    }
    catch (err) {
        next(err);
    }
});
router.delete("/:id", auth_1.requireAuth, async (req, res, next) => {
    try {
        await fileService_1.FileService.deleteFile(req.userId, req.params.id);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
router.get("/trash/list", auth_1.requireAuth, async (req, res, next) => {
    try {
        const files = await fileService_1.FileService.getTrash(req.userId);
        res.json({ files });
    }
    catch (err) {
        next(err);
    }
});
router.post("/:id/restore", auth_1.requireAuth, async (req, res, next) => {
    try {
        await fileService_1.FileService.restoreFile(req.userId, req.params.id);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
router.delete("/:id/hard", auth_1.requireAuth, async (req, res, next) => {
    try {
        await fileService_1.FileService.hardDeleteFile(req.userId, req.params.id);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
