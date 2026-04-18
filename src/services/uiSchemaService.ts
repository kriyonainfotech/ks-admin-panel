import { axiosInstance } from "./apiConnector";
import { UiField, UiSchema } from "@/lib/uiSchemaData";

export const uiSchemaAPI = {
    getSchema: async (resource: string, variant: string = 'default'): Promise<UiSchema> => {
        const response = await axiosInstance.get(`/api/ui-schema/${resource}?variant=${variant}`);
        return response.data.data || response.data; // Backend returns { success, data: schema } or just { fields: [] } for fallback
    },

    updateSchema: async (resource: string, variant: string, fields: UiField[]): Promise<UiSchema> => {
        const response = await axiosInstance.post("/api/ui-schema", { resource, variant, fields });
        console.log(response.data);
        return response.data.data;
    },
};
