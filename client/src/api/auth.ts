import { api } from './client';
import type { AuthResponse, User } from './types';

export const authApi = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', { email, password });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  requestDeletion: async (): Promise<void> => {
    await api.post('/auth/request-account-deletion');
  },

  restoreAccount: async (): Promise<void> => {
    await api.post('/auth/restore-account');
  }
};
