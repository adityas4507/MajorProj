export interface User {
  id: string;
  email: string;
  googleId?: string;
  totalQuotaBytes: string;
  usedBytes: string;
  createdAt: string;
  updatedAt: string;
}

export interface File {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: string;
  path: string;
  ownerId: string;
  folderId: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface FileListResponse {
  folders: Folder[];
  files: File[];
}

export interface TrashListResponse {
  files: File[];
}

export interface QuotaResponse {
  used: string;
  total: string;
}
