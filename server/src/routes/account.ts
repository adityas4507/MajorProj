import { Router } from "express";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { QuotaService } from "../services/quotaService";

const router = Router();

router.get("/quota", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const quota = await QuotaService.getQuota(req.userId!);
    res.json(quota);
  } catch (err) {
    next(err);
  }
});

export default router;
