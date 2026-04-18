// services/subscriptionService.ts
import { axiosInstance } from "./apiConnector";
import { AssignPackagePayload, UpdateSubscriptionPayload } from "@/lib/subscriptionData";

const API_URL = "/api/subscriptions";

const assignPackage = async (payload: AssignPackagePayload) => {
    const response = await axiosInstance.post(`${API_URL}/assign`, payload);
    return response.data;
};

const getClientSubscriptions = async (clientId: string) => {
    const response = await axiosInstance.get(`${API_URL}/client/${clientId}`);
    return response.data;
};

const updateSubscription = async (payload: UpdateSubscriptionPayload) => {
    const { id, ...data } = payload;
    const response = await axiosInstance.patch(`${API_URL}/${id}`, data);
    return response.data;
};

const getDeletionPreview = async (id: string) => {
    const response = await axiosInstance.get(`${API_URL}/${id}/deletion-preview`);
    return response.data;
};

const deleteSubscription = async (id: string, options: any) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`, { data: options });
    return response.data;
};

export const subscriptionAPI = {
    assignPackage,
    getClientSubscriptions,
    updateSubscription,
    getDeletionPreview,
    deleteSubscription,
};
