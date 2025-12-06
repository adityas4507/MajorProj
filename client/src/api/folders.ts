import { api as client } from './client';
import type { Folder } from './types';

export const foldersApi = {
    create: async (name: string, parentId?: string) => {
        const res = await client.post<Folder>('/folders', { name, parentId });
        return res.data;
    },

    list: async (folderId?: string) => {
        // This is usually handled by filesApi.list but good to have if needed specifically
        const url = folderId ? `/folders/${folderId}/list` : '/files/list';
        const res = await client.get(url);
        return res.data;
    },

    rename: async (id: string, name: string) => {
        const res = await client.patch<Folder>(`/folders/${id}`, { name });
        return res.data;
    },

    delete: async (id: string) => {
        const res = await client.delete(`/folders/${id}`);
        return res.data;
    }
};
