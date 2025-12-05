"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("dotenv/config");
exports.config = {
    port: process.env.PORT || 3000,
    dbUrl: process.env.DATABASE_URL,
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || "access-secret",
        refreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret",
        accessTtl: "15m",
        refreshTtlDays: 30,
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        callbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback",
    },
    storage: {
        root: process.env.STORAGE_ROOT || "/mnt/cloud-storage",
        temp: process.env.TEMP_DIR || "/tmp/uploads",
    },
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    },
    quota: {
        defaultBytes: 15 * 1024 * 1024 * 1024, // 15 GB
    },
};
