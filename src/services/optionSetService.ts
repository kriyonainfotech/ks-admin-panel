import { axiosInstance } from "./apiConnector";

// Define Types
export interface OptionItem {
    _id?: string;
    label: string;
    value: string;
    color: string;
    isSystem?: boolean;
}

export interface OptionSet {
    _id: string;
    name: string;
    options: OptionItem[];
}

// Service Functions
export const optionSetService = {
    // 1. Create a new Option Set (e.g., "task_status")
    createOptionSet: async (data: { name: string; options: OptionItem[] }) => {
        const response = await axiosInstance.post("/api/optionset/create", data);
        return response.data;
    },

    // 2. Get All Option Sets (for Admin Panel)
    getAllOptionSets: async () => {
        const response = await axiosInstance.get("/api/optionset");
        return response.data;
    },

    getOptionSetByName: async (name: string) => {
        const response = await axiosInstance.get(`/api/optionset/${name}`);
        return response.data;
    },

    // 4. Add a single option to an existing set
    addOption: async (optionSetId: string, option: OptionItem) => {
        const response = await axiosInstance.post(`/api/optionset/${optionSetId}/options`, option);
        return response.data;
    },

    // 5. Update an option (color, label)
    updateOption: async (optionSetId: string, optionId: string, data: Partial<OptionItem>) => {
        const response = await axiosInstance.put(`/api/optionset/${optionSetId}/options/${optionId}`, data);
        return response.data;
    },

    // 6. Delete an option
    deleteOption: async (optionSetId: string, optionId: string) => {
        const response = await axiosInstance.delete(`/api/optionset/${optionSetId}/options/${optionId}`);
        return response.data;
    }
};