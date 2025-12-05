import { PrismaClient } from "@prisma/client";
import cors from "cors";
import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import "./utils/polyfill";

import { errorHandler } from "./middleware/errorHandler";
import accountRoutes from "./routes/account";
import adminRoutes from "./routes/admin";
import authRoutes from "./routes/auth";
import fileRoutes from "./routes/files";
import folderRoutes from "./routes/folders";
import oauthRoutes from "./routes/oauth";

export const prisma = new PrismaClient();

const app = express();

app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
}));

app.use("/auth", authRoutes);
app.use("/auth/google", oauthRoutes);
app.use("/files", fileRoutes);
app.use("/folders", folderRoutes);
app.use("/account", accountRoutes);
app.use("/admin", adminRoutes);

// central error handler
app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});

