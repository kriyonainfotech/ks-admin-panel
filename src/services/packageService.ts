import { axiosInstance } from "./apiConnector";
import { PackageTemplate, ServiceItem } from "@/lib/packageData";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/catalog";

export const packageAPI = {
    // ------------------------------------
    // SERVICES
    // ------------------------------------
    getAllServices: async (): Promise<ServiceItem[]> => {
        const response = await axiosInstance.get(`${API_URL}/api/catalog/services/view`);
        return response.data.data;
    },

    createService: async (data: Partial<ServiceItem>): Promise<ServiceItem> => {
        const response = await axiosInstance.post(`${API_URL}/api/catalog/services/create`, data);
        return response.data.data;
    },

    updateService: async (id: string, updates: Partial<ServiceItem>): Promise<ServiceItem> => {
        const response = await axiosInstance.put(`${API_URL}/api/catalog/services/update/${id}`, updates);
        return response.data.data;
    },

    deleteService: async (id: string): Promise<void> => {
        await axiosInstance.delete(`${API_URL}/api/catalog/services/delete/${id}`);
    },

    // ------------------------------------
    // PACKAGES
    // ------------------------------------
    getAllPackages: async (): Promise<PackageTemplate[]> => {
        const response = await axiosInstance.get(`${API_URL}/api/catalog/packages/view`);
        console.log(response.data.data);
        return response.data.data;
    },

    createPackage: async (data: Partial<PackageTemplate>): Promise<PackageTemplate> => {
        const response = await axiosInstance.post(`${API_URL}/api/catalog/packages/create`, data);
        return response.data.data;
    },

    updatePackage: async (id: string, updates: Partial<PackageTemplate>): Promise<PackageTemplate> => {
        const response = await axiosInstance.put(`${API_URL}/api/catalog/packages/update/${id}`, updates);
        return response.data.data;
    },

    deletePackage: async (id: string): Promise<void> => {
        await axiosInstance.delete(`${API_URL}/api/catalog/packages/delete/${id}`);
    }
};