import "dotenv/config";


export const config = {
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
    root: process.env.STORAGE_ROOT || "/mnt/cloud-storage", // Legacy support
    primary: process.env.STORAGE_PRIMARY || "D:\\DriveClone\\storage",
    mirror: process.env.STORAGE_MIRROR || "E:\\DriveClone\\storage",
    temp: process.env.TEMP_DIR || "C:\\temp\\uploads",
  },
  security: {
    clamavPath: process.env.CLAMAV_PATH || "C:\\Program Files\\ClamAV\\clamscan.exe",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
  quota: {
    defaultBytes: 150 * 1024 * 1024 * 1024, // 15 GB
  },
};
