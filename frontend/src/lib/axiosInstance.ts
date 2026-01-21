import axios from "axios";
import { toast } from "sonner";

export class InvalidTokenError extends Error {
  constructor(message = "Invalid or expired refresh token") {
    super(message);
  }
}

export const axiosInstance = axios.create({
  baseURL: "/api",
  timeout: 30000,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    const isInvalidTokenError = error.response?.status === 401;

    if (isInvalidTokenError && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post("/api/auth/refresh");
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        throw new InvalidTokenError();
      }
    }

    toast.error(error.response?.data?.error || "Internal Server Error");

    throw error;
  }
);
