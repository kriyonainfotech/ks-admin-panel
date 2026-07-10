
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Multi-Company Support: Attach active company context
        if (typeof window !== 'undefined') {
            const activeCompanyId = localStorage.getItem("active_company_id");
            if (activeCompanyId) {
                config.headers["x-company-id"] = activeCompanyId;
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
