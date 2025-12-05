import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().toLowerCase().email(),  
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().toLowerCase().email(),
  password: z.string(),
});

export const createFolderSchema = z.object({
  name: z.string().min(1).max(255),
  parentId: z.string().uuid().optional(),
});

export const renameFileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  folderId: z.string().uuid().nullable().optional(),
});
