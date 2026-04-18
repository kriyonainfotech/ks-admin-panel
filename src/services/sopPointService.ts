import { axiosInstance } from "./apiConnector";

export const sopPointAPI = {
    getPoints: async (groupId: string) => {
        const response = await axiosInstance.get("/api/sop-points", { params: { groupId } });
        return response.data;
    },
    createPoint: async (data: any) => {
        const response = await axiosInstance.post("/api/sop-points", data);
        return response.data;
    },
    updatePoint: async (id: string, data: any) => {
        const response = await axiosInstance.put(`/api/sop-points/${id}`, data);
        return response.data;
    },
    deletePoint: async (id: string) => {
        const response = await axiosInstance.delete(`/api/sop-points/${id}`);
        return response.data;
    },
    reorderPoints: async (orders: { id: string, order: number }[]) => {
        const response = await axiosInstance.post("/api/sop-points/reorder", { orders });
        return response.data;
    }
};
