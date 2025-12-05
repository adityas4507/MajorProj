"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const quotaService_1 = require("../services/quotaService");
const router = (0, express_1.Router)();
router.get("/quota", auth_1.requireAuth, async (req, res, next) => {
    try {
        const quota = await quotaService_1.QuotaService.getQuota(req.userId);
        res.json(quota);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
