import axios from 'axios';
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}` : "http://localhost:5000";

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

export const apiConnector = axiosInstance;

// Request Interceptor: Attach Token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token") || Cookies.get("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Multi-Company Support: Attach active company context
        const activeCompanyId = localStorage.getItem("active_company_id");
        if (activeCompanyId) {
            config.headers["x-company-id"] = activeCompanyId;
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 (Token Expired)
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 403 Forbidden - Access Denied (Do NOT log out)
        if (error.response?.status === 403) {
            alert("Access Denied: You don't have permission to perform this action.");
            return Promise.reject(error);
        }

        // If 401 Unauthorized and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Get current token to send as refresh token
                const currentToken = localStorage.getItem("token") || Cookies.get("token");

                // Call your refresh token endpoint
                const { data } = await axios.post(`${BASE_URL}/api/auth/refresh-token`, { refreshToken: currentToken }, { withCredentials: true });

                // Save new token (backend returns { success: true, token, user })
                const newToken = data.token;
                localStorage.setItem("token", newToken);
                Cookies.set("token", newToken, { expires: 7 });

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // If refresh fails, notify user via Modal
                console.error("Refresh Token failed:", refreshError);

                // Clear session data instantly
                localStorage.removeItem("token");
                localStorage.removeItem("kriyona_user");
                Cookies.remove("token");

                // Trigger Global Modal
                window.dispatchEvent(new Event("session-expired"));

                return Promise.reject(refreshError);
            }
        }

        // Fallback for unhandled 401
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("kriyona_user");
            Cookies.remove("token");

            // Trigger Global Modal
            window.dispatchEvent(new Event("session-expired"));
        }

        return Promise.reject(error);
    }
);