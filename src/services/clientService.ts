// import axios from "axios";
import { axiosInstance } from "./apiConnector";
import { Client } from "@/lib/clientdata";


export const clientAPI = {
    getAllClients: async (): Promise<{ success: boolean; message: string; data: Client[] }> => {
        const res = await axiosInstance.get("/api/users/client/all");
        return res.data; // returns { success, message, data }
    },

    getClientById: async (id: string): Promise<{ success: boolean; message: string; data: Client }> => {
        const res = await axiosInstance.post("/api/users/client/ById", { id });
        return res.data;
    },

    createClient: async (data: Omit<Client, "id" | "joinedDate">): Promise<{ success: boolean; message: string; data: Client }> => {
        const res = await axiosInstance.post("/api/users/client/create", data);
        return res.data;
    },

    updateClient: async (id: string, updates: Partial<Client>): Promise<{ success: boolean; message: string; data: Client }> => {
        console.log("Updating client:", id);
        console.log("Update payload:", updates);
        const res = await axiosInstance.put(`/api/users/client/update/${id}`, updates);
        return res.data;
    },

    deleteClient: async (id: string, options?: Record<string, boolean>): Promise<{ success: boolean; message: string }> => {
        const res = await axiosInstance.delete(`/api/users/client/delete/${id}`, { data: options });
        return res.data;
    },

    getDeletionPreview: async (id: string): Promise<{ success: boolean; data: any }> => {
        const res = await axiosInstance.get(`/api/users/client/${id}/deletion-preview`);
        return res.data;
    },

    getClientsByTeamMember: async (teamId: string): Promise<{ success: boolean; message: string; data: Client[] }> => {
        const res = await axiosInstance.get(`/api/users/client/team/${teamId}`);
        return res.data;
    },

    resetClientPassword: async (id: string, password: string): Promise<{ success: boolean; message: string }> => {
        const res = await axiosInstance.put(`/api/users/client/resetPassword/${id}`, { password });
        return res.data;
    },
};
