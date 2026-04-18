import { axiosInstance } from "./apiConnector";

export const paymentService = {
    // 1. Get Dashboard Stats (Total Sales, Collected, Pending)
    getStats: async (company?: string, month?: number, year?: number) => {
        const response = await axiosInstance.get("/api/payments/stats", { params: { company, month, year } });
        return response.data.data;
    },

    // 2. Get All Sales (Invoices)
    getSales: async (company?: string, month?: number, year?: number) => {
        const response = await axiosInstance.get("/api/payments/sales", { params: { company, month, year } });
        return response.data.data;
    },

    // 3. Get Collection History (Audit Trail)
    getCollections: async (company?: string, month?: number, year?: number) => {
        const response = await axiosInstance.get("/api/payments/collections", { params: { company, month, year } });
        return response.data.data;
    },

    // 4. Create a New Sale (Invoice)
    createSale: async (data: any) => {
        const response = await axiosInstance.post("/api/payments/sales", data);
        return response.data.data;
    },

    // 5. Collect Money (Transaction)
    collectPayment: async (data: any) => {
        const response = await axiosInstance.post("/api/payments/collect", data);
        return response.data.data;
    },

    // 6. Record Expense
    recordExpense: async (data: any) => {
        const response = await axiosInstance.post("/api/payments/expense", data);
        return response.data.data;
    },

    // 7. Update Sale
    updateSale: async (id: string, data: any) => {
        const response = await axiosInstance.put(`/api/payments/sales/${id}`, data);
        return response.data.data;
    },

    // 8. Delete Sale
    deleteSale: async (id: string) => {
        const response = await axiosInstance.delete(`/api/payments/sales/${id}`);
        return response.data.data;
    },

    // 9. Update Expense
    updateExpense: async (id: string, data: any) => {
        const response = await axiosInstance.put(`/api/payments/expense/${id}`, data);
        return response.data.data;
    },

    // 10. Delete Expense
    deleteExpense: async (id: string) => {
        const response = await axiosInstance.delete(`/api/payments/expense/${id}`);
        return response.data;
    },

    // 11. Delete Collection (Income)
    deleteCollection: async (id: string) => {
        const response = await axiosInstance.delete(`/api/payments/collection/${id}`);
        return response.data;
    },

    // 12. Update Collection Account Type
    updateCollectionAccount: async (id: string, destinationAccount: string) => {
        const response = await axiosInstance.put(`/api/payments/collection/${id}/account`, { destinationAccount });
        return response.data.data;
    },

    // 13. Create Direct Collection
    createDirectCollection: async (data: any) => {
        const response = await axiosInstance.post("/api/payments/direct-collection", data);
        return response.data.data;
    },

    // 14. Update Direct Collection
    updateDirectCollection: async (id: string, data: any) => {
        const response = await axiosInstance.put(`/api/payments/direct-collection/${id}`, data);
        return response.data.data;
    }
};