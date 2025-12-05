import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { healthMonitor } from "../storage/HealthMonitor";
import { raidManager } from "../storage/RaidManager";

const router = Router();

// In a real app, you'd want a requireAdmin middleware
router.get("/health", requireAuth, (req, res) => {
  res.json(healthMonitor.getHealth());
});

router.post("/rebuild", requireAuth, async (req, res) => {
  // Trigger background rebuild
  raidManager.rebuild();
  res.json({ message: "Rebuild started" });
});

export default router;
