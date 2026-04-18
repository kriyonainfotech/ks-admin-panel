import { axiosInstance } from "./apiConnector";

export const sopGroupAPI = {
    getGroups: async (params: { entityType?: string, entityId?: string, teamCategory?: string, category: string }) => {
        const response = await axiosInstance.get("/api/sop-groups", { params });
        return response.data;
    },
    createGroup: async (data: any) => {
        const response = await axiosInstance.post("/api/sop-groups", data);
        return response.data;
    },
    updateGroup: async (id: string, data: any) => {
        const response = await axiosInstance.put(`/api/sop-groups/${id}`, data);
        return response.data;
    },
    deleteGroup: async (id: string) => {
        const response = await axiosInstance.delete(`/api/sop-groups/${id}`);
        return response.data;
    },
    reorderGroups: async (orders: { id: string, order: number }[]) => {
        const response = await axiosInstance.post("/api/sop-groups/reorder", { orders });
        return response.data;
    }
};
