import axios from "axios";
import { toast } from "sonner";

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const axiosInstance = axios.create({
  baseURL: apiUrl + "/api",
  timeout: 30000,
  // withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    const isInvalidTokenError =
      error.response?.status === 401 && error.message === "Invalid Token";

    if (isInvalidTokenError && !originalRequest._retry) {
      originalRequest._retry = true;
      //   TODO: add refreshtokenhook
      // await refreshToken();
      return axiosInstance(originalRequest);
    }

    toast.error(error.message || "Internal Server Error");

    throw error;
  }
);
