"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const config_1 = require("../config");
const index_1 = require("../index");
const jwt_1 = require("../utils/jwt");
const router = (0, express_1.Router)();
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: config_1.config.google.clientId,
    clientSecret: config_1.config.google.clientSecret,
    callbackURL: config_1.config.google.callbackUrl,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0].value;
        if (!email)
            return done(new Error("No email from Google"));
        let user = await index_1.prisma.user.findUnique({ where: { googleId: profile.id } });
        if (!user) {
            // Check if user exists by email
            user = await index_1.prisma.user.findUnique({ where: { email } });
            if (user) {
                // Link Google account
                user = await index_1.prisma.user.update({
                    where: { id: user.id },
                    data: { googleId: profile.id }
                });
            }
            else {
                // Create new user
                user = await index_1.prisma.user.create({
                    data: {
                        email,
                        googleId: profile.id,
                        totalQuotaBytes: BigInt(config_1.config.quota.defaultBytes),
                    }
                });
            }
        }
        return done(null, user);
    }
    catch (err) {
        return done(err);
    }
}));
router.get("/", passport_1.default.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/callback", passport_1.default.authenticate("google", { session: false, failureRedirect: "/login" }), async (req, res) => {
    const user = req.user;
    const accessToken = (0, jwt_1.signAccessToken)(user.id);
    const refreshToken = (0, jwt_1.signRefreshToken)(user.id);
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await index_1.prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    });
    // In a real app, you might redirect to frontend with tokens in URL or set cookies
    // For this API-centric request, we'll return JSON if possible, but OAuth callbacks usually redirect.
    // We will redirect to a frontend success page with tokens as query params (simple approach)
    res.redirect(`${config_1.config.cors.origin}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
});
exports.default = router;
