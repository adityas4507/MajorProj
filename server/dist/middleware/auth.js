"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
require("multer"); // Ensure Multer types are augmented
const index_1 = require("../index");
const jwt_1 = require("../utils/jwt");
const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header required" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token required" });
    }
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.userId = payload.sub;
        // Optional: Check if user exists and is not deleted (can be cached or skipped for speed if JWT is trusted)
        // For strict security, we check DB:
        const user = await index_1.prisma.user.findUnique({ where: { id: req.userId } });
        if (!user || user.isDeleted) {
            return res.status(403).json({ error: "User not found or deleted" });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};
exports.requireAuth = requireAuth;
