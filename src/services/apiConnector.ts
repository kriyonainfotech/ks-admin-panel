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
        // Get token from localStorage or cookie
        const token = localStorage.getItem("token") || Cookies.get("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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

        // Handle 403 Forbidden - Access Denied (Sign in again as Admin)
        if (error.response?.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("kriyona_user");
            Cookies.remove("token");
            
            window.dispatchEvent(new CustomEvent("session-expired", { 
                detail: { 
                    title: "Access Denied", 
                    message: "You don't have permission to perform this action. Please sign in with an administrative account." 
                } 
            }));
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

                // Save new token
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
            window.dispatchEvent(new CustomEvent("session-expired", { 
                detail: { 
                    title: "Session Expired", 
                    message: "Your session has timed out or is invalid. Please sign in again to continue." 
                } 
            }));
        }

        return Promise.reject(error);
    }
);