"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const index_1 = require("../index");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
router.post("/", auth_1.requireAuth, async (req, res, next) => {
    try {
        const { name, parentId } = validation_1.createFolderSchema.parse(req.body);
        // Check if parent exists and belongs to user
        if (parentId) {
            const parent = await index_1.prisma.folder.findUnique({ where: { id: parentId } });
            if (!parent || parent.ownerId !== req.userId) {
                return res.status(404).json({ error: "Parent folder not found" });
            }
        }
        const folder = await index_1.prisma.folder.create({
            data: {
                name,
                parentId,
                ownerId: req.userId,
            },
        });
        res.json(folder);
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: err.errors });
        }
        next(err);
    }
});
router.get("/:id", auth_1.requireAuth, async (req, res, next) => {
    try {
        const folder = await index_1.prisma.folder.findUnique({
            where: { id: req.params.id },
        });
        if (!folder || folder.ownerId !== req.userId) {
            return res.status(404).json({ error: "Folder not found" });
        }
        res.json(folder);
    }
    catch (err) {
        next(err);
    }
});
router.get("/:id/list", auth_1.requireAuth, async (req, res, next) => {
    try {
        const folderId = req.params.id;
        // Verify folder ownership
        const folder = await index_1.prisma.folder.findUnique({ where: { id: folderId } });
        if (!folder || folder.ownerId !== req.userId) {
            return res.status(404).json({ error: "Folder not found" });
        }
        const folders = await index_1.prisma.folder.findMany({
            where: { parentId: folderId, ownerId: req.userId },
        });
        const files = await index_1.prisma.file.findMany({
            where: { folderId: folderId, ownerId: req.userId, isDeleted: false },
        });
        // Convert BigInt to string for JSON serialization
        const serializedFiles = files.map(f => ({
            ...f,
            sizeBytes: f.sizeBytes.toString()
        }));
        res.json({ folders, files: serializedFiles });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
