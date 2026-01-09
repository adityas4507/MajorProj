import axios from 'axios';

// Use environment variable if available, otherwise default to localhost
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        // We need to store the refresh token somewhere. 
        // The prompt says "Store tokens in httpOnly cookies or secure storage".
        // If httpOnly cookies are used for refresh token, we just call /refresh endpoint.
        // If we need to send it manually, we need to retrieve it.
        // Let's assume the backend expects it in the body based on API.md:
        // POST /auth/refresh -> Body: { refreshToken: "..." }

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

        localStorage.setItem('accessToken', data.accessToken);
        // If backend returns new refresh token, update it too
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Logout if refresh fails
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
