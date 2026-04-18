import { axiosInstance } from "./apiConnector";

export const salaryService = {
    getMyWalletStats: async () => {
        const response = await axiosInstance.get("/api/salary/wallet");
        return response.data;
    },
    getPayrollStats: async (params: { month: number; year: number }) => {
        const response = await axiosInstance.get("/api/salary/stats", { params });
        return response.data;
    },
    getPayrollList: async (params: { month: number; year: number; tab: string }) => {
        const response = await axiosInstance.get("/api/salary/list", { params });
        return response.data;
    },
    recordSalaryPayment: async (data: any) => {
        const response = await axiosInstance.post("/api/salary/pay", data);
        return response.data;
    },
    getAttendanceLogs: async (userId: string, params: { month: number; year: number }) => {
        const response = await axiosInstance.get(`/api/salary/logs/${userId}`, { params });
        return response.data;
    }
};
