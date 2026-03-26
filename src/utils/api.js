import axios from "axios";

// ─── Axios Instance ───────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // JWT cookie (jc_token) automatically bhejega
  headers: { "Content-Type": "application/json" },
});

// ─── Response Interceptor ─────────────────────────────────────
// 401 aaye toh login pe redirect
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // 401 aaya + pehle retry nahi kiya
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        // Refresh token se naya access token lo
        await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );
        // Original request dobara karo
        return api(original);
      } catch {
        // Refresh bhi fail — logout
        localStorage.removeItem("jc_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
