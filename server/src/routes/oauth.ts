import * as crypto from "crypto";
import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "../config";
import { prisma } from "../index";
import { signAccessToken, signRefreshToken } from "../utils/jwt";

const router = Router();

passport.use(new GoogleStrategy({
    clientID: config.google.clientId,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackUrl,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0].value;
      if (!email) return done(new Error("No email from Google"));

      let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

      if (!user) {
        // Check if user exists by email
        user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          // Link Google account
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId: profile.id }
          });
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              email,
              googleId: profile.id,
              totalQuotaBytes: BigInt(config.quota.defaultBytes),
            }
          });
        }
      }
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

router.get("/", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

router.get("/callback", 
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  async (req, res) => {
    const user = (req as any).user;
    
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    // In a real app, you might redirect to frontend with tokens in URL or set cookies
    // For this API-centric request, we'll return JSON if possible, but OAuth callbacks usually redirect.
    // We will redirect to a frontend success page with tokens as query params (simple approach)
    res.redirect(`${config.cors.origin}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  }
);

export default router;
