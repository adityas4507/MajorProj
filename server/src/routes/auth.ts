import { Router } from "express";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { AuthService } from "../services/authService";
import { UserService } from "../services/userService";
import { loginSchema, registerSchema } from "../utils/validation";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = registerSchema.parse(req.body);
    const result = await AuthService.register(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Missing refresh token" });
    const result = await AuthService.refresh(refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await AuthService.logout(refreshToken);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post("/request-account-deletion", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const result = await UserService.requestDeletion(req.userId!);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/restore-account", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const result = await UserService.restoreAccount(req.userId!);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
    res.json(req.user);
});

export default router;
