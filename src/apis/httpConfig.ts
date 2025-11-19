import { broadcastAuthEvent, getAccessToken, setAccessToken } from "@/libs/tokenMemory";
import axios from "axios"


export const originBackend = process.env.NODE_ENV === "development"
  ? "http://localhost:5000"
  : (process.env.NEXT_PUBLIC_ORIGIN_PATH_BACKEND as string)

  
const API = axios.create({
  baseURL: `${originBackend}/api`,
  withCredentials: true,
  headers: {
    "Accept-Encoding": "gzip, deflate, br",
  }
});

API.interceptors.request.use(
  (config) => {
    // Nếu có JWT token -> thêm Authorization
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  // (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};


API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Không có response hoặc đã retry rồi thì bỏ qua
    if (!error.response || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Nếu 401 vì accessToken hết hạn
    if (error.response?.status === 401 && error.response.data?.status === "Expired") {

      if (isRefreshing) {
        // Nếu đang refresh rồi → đợi xong
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((tokenFromQueue) => {
            if (tokenFromQueue && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${tokenFromQueue}`;
            }
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {

        const res = await axios.get(`${originBackend}/auth/refresh-token`, { withCredentials: true })
        
        const newAccessToken: string = res.data.accessToken;
        // Lưu token mới vào localStorage
        setAccessToken(newAccessToken);


        API.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        isRefreshing = false;
        processQueue(null, newAccessToken);

        return API(originalRequest);
      } catch (refreshErr) {

        setAccessToken(null);
        processQueue(refreshErr, null);
        broadcastAuthEvent("FORCE_LOGOUT");

        // if (typeof window !== "undefined") {
        //   window.location.href = "/auth/login";
        // }

        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Nếu 401 vì session bị revoke hoặc hết hạn từ BE
    if (
      error.response.status === 401 &&
      ["Session_Expired", "Revoked"].includes(error.response.data?.status)
    ) {
      setAccessToken(null);
      broadcastAuthEvent("FORCE_LOGOUT");
    }

    return Promise.reject(error);
  }
);

export default API

