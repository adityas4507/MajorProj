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
    root: process.env.STORAGE_ROOT || (process.platform === 'win32' ? "C:\\cloud-storage" : "/mnt/cloud-storage"),
    primary: process.env.STORAGE_PRIMARY || (process.platform === 'win32' ? "D:\\DriveClone\\storage" : "/mnt/disk1/majorproj_storage"),
    mirror: process.env.STORAGE_MIRROR || (process.platform === 'win32' ? "E:\\DriveClone\\storage" : "/mnt/disk2/majorproj_storage"),
    temp: process.env.TEMP_DIR || (process.platform === 'win32' ? "C:\\temp\\uploads" : "/tmp/majorproj-uploads"),
  },
  security: {
    clamavPath: process.env.CLAMAV_PATH || (process.platform === 'win32' ? "C:\\Program Files\\ClamAV\\clamscan.exe" : "/usr/bin/clamscan"),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
  quota: {
    defaultBytes: 150 * 1024 * 1024 * 1024, // 15 GB
  },
};
