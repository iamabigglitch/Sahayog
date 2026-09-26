import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Extend Axios's config type so `_retry` is properly typed
// instead of an untyped bolt-on property.
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  config: RetryableRequestConfig;
}> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the in-flight refresh resolves —
      // and reject it too if the refresh ultimately fails, so it
      // doesn't hang forever.
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      localStorage.setItem("accessToken", data.accessToken ?? data.access_token);
      localStorage.setItem("refreshToken", data.refreshToken ?? data.refresh_token);

      pendingQueue.forEach(({ resolve, config }) => resolve(api(config)));
      pendingQueue = [];

      return api(originalRequest);
    } catch (refreshError) {
      pendingQueue.forEach(({ reject }) => reject(refreshError));
      pendingQueue = [];

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      window.location.href = "/login";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);