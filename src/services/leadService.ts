import { axiosInstance } from "./apiConnector";
import { Lead } from "@/lib/leadData";

export const leadAPI = {
    getAll: async (urlOverride?: string): Promise<Lead[]> => {
        const url = urlOverride || "/api/leads/view";
        const response = await axiosInstance.get(url);
        return response.data.map((l: any) => ({ ...l, id: l._id }));
    },
    create: async (data: Omit<Lead, "id">): Promise<Lead> => {
        const response = await axiosInstance.post("/api/leads/create", data);
        return { ...response.data, id: response.data._id };
    },
    update: async (id: string, updates: Partial<Lead>): Promise<Lead> => {
        const response = await axiosInstance.put(`/api/leads/update/${id}`, updates);
        return { ...response.data, id: response.data._id };
    },
    delete: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/api/leads/delete/${id}`);
    },
    // Configs
    getConfigs: async () => {
        const response = await axiosInstance.get("/api/leads/configs");
        return response.data;
    },
    addConfigOption: async (name: string, label: string, value: string, color?: string) => {
        const response = await axiosInstance.post("/api/leads/configs/option", { name, label, value, color });
        return response.data;
    },
    deleteConfigOption: async (name: string, optionId: string) => {
        const response = await axiosInstance.delete(`/api/leads/configs/${name}/option/${optionId}`);
        return response.data;
    }
};
