"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const authService_1 = require("../services/authService");
const userService_1 = require("../services/userService");
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
router.post("/register", async (req, res, next) => {
    try {
        const { email, password } = validation_1.registerSchema.parse(req.body);
        const result = await authService_1.AuthService.register(email, password);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = validation_1.loginSchema.parse(req.body);
        const result = await authService_1.AuthService.login(email, password);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
router.post("/refresh", async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(400).json({ error: "Missing refresh token" });
        const result = await authService_1.AuthService.refresh(refreshToken);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
router.post("/logout", async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        await authService_1.AuthService.logout(refreshToken);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
router.post("/request-account-deletion", auth_1.requireAuth, async (req, res, next) => {
    try {
        const result = await userService_1.UserService.requestDeletion(req.userId);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
router.post("/restore-account", auth_1.requireAuth, async (req, res, next) => {
    try {
        const result = await userService_1.UserService.restoreAccount(req.userId);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
router.get("/me", auth_1.requireAuth, async (req, res) => {
    res.json(req.user);
});
exports.default = router;
