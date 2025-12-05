import { api } from './client';
import type { File, FileListResponse, TrashListResponse } from './types';

export const filesApi = {
  list: async (folderId?: string): Promise<FileListResponse> => {
    const params = folderId ? { folderId } : {};
    const { data } = await api.get<FileListResponse>('/files/list', { params });
    return data;
  },

  upload: async (file: Blob, folderId?: string): Promise<File> => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folderId', folderId);
    
    const { data } = await api.post<{ file: File }>('/files/upload', formData);
    return data.file;
  },

  download: async (fileId: string): Promise<Blob> => {
    const { data } = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob'
    });
    return data;
  },

  delete: async (fileId: string): Promise<void> => {
    await api.delete(`/files/${fileId}`);
  },

  hardDelete: async (fileId: string): Promise<void> => {
    await api.delete(`/files/${fileId}/hard`);
  },

  restore: async (fileId: string): Promise<void> => {
    await api.post(`/files/${fileId}/restore`);
  },

  listTrash: async (): Promise<File[]> => {
    const { data } = await api.get<TrashListResponse>('/files/trash/list');
    return data.files;
  }
};
