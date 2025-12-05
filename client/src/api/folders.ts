import { api } from './client';
import type { FileListResponse, Folder } from './types';

export const foldersApi = {
  create: async (name: string, parentId?: string): Promise<Folder> => {
    const { data } = await api.post<Folder>('/folders', { name, parentId });
    return data;
  },

  get: async (folderId: string): Promise<Folder> => {
    const { data } = await api.get<Folder>(`/folders/${folderId}`);
    return data;
  },

  listContents: async (folderId: string): Promise<FileListResponse> => {
    const { data } = await api.get<FileListResponse>(`/folders/${folderId}/list`);
    return data;
  }
};
