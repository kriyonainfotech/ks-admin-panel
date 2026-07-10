// import axios from "axios";
import { axiosInstance } from "./apiConnector";
import { AdminUser, DeleteAdminResponse, GetAllAdminsResponse, SingleAdminResponse } from "@/lib/admindata";

export const adminAPI = {

    // GET ALL ADMINS
    getAllAdmins: async (): Promise<GetAllAdminsResponse> => {
        const res = await axiosInstance.get("/api/users/admin/all");
        return res.data; // TypeScript now knows res.data matches GetAllAdminsResponse
    },

    getAllSuperAdmins: async (): Promise<GetAllAdminsResponse> => {
        const res = await axiosInstance.get("/api/users/superadmin/all");
        return res.data; // TypeScript now knows res.data matches GetAllAdminsResponse
    },

    // CREATE ADMIN
    createAdmin: async (
        adminData: Omit<AdminUser, "_id" | "createdAt" | "lastLogin">
    ): Promise<SingleAdminResponse> => {
        const res = await axiosInstance.post("/api/users/admin/create", adminData);
        return res.data;
    },

    createSuperAdmin: async (
        adminData: any
    ): Promise<SingleAdminResponse> => {
        const res = await axiosInstance.post("/api/users/superadmin/create", adminData);
        return res.data;
    },

    // UPDATE ADMIN
    updateAdmin: async (
        id: string,
        updates: Partial<Omit<AdminUser, "_id">> // remove _id from type
    ): Promise<SingleAdminResponse> => {
        const payload = { ...updates }; // do NOT include _id or id
        const res = await axiosInstance.put(`/api/users/admin/update/${id}`, payload);
        return res.data;
    },

    // DELETE ADMIN
    deleteAdmin: async (id: string): Promise<DeleteAdminResponse> => {
        console.log(id, "THUNK PAYLOAD services");
        const res = await axiosInstance.delete("/api/users/admin/delete", { data: { id } });
        console.log(res, "resss")
        return res.data;
    },

    // UPDATE ADMIN STATUS
    updateAdminStatus: async (id: string, status: string): Promise<AdminUser> => {
        const res = await axiosInstance.put("/admin/updateStatus", { id, status });
        return res.data;
    },

    // GET ADMIN BY ID
    getAdminById: async (id: string): Promise<AdminUser> => {
        const res = await axiosInstance.post("/admin/ById", { id });
        return res.data;
    },

    // RESET PASSWORD
    resetPassword: async (
        id: string,
        password: string
    ): Promise<{ success: boolean; message: string }> => {
        console.log(id, password, "THUNK PAYLOAD services");

        const res = await axiosInstance.put(`/api/users/admin/resetPassword/${id}`, {
            password: password, // dynamic
        });

        return res.data;
    },

    // UPDATE PERMISSIONS
    updatePermissions: async (id: string, permissions: string[]): Promise<any> => {
        const res = await axiosInstance.put(`/api/users/admin/permissions/${id}`, { permissions });
        return res.data;
    },

    // GRANT CROSS-COMPANY ACCESS
    grantCompanyAccess: async (id: string, companyId: string): Promise<any> => {
        const res = await axiosInstance.put(`/api/users/admin/accessible-companies/${id}`, { companyId });
        return res.data;
    },

};



// import { axiosInstance } from "./apiConnector";

// export const adminAPI = {
//     // Superadmin creates an admin
//     createAdmin: async (adminData: any) => {
//         const response = await axiosInstance.post('/superadmin/admins', adminData);
//         return response.data;
//     },

//     // Get all admins
//     getAllAdmins: async () => {
//         const response = await axiosInstance.get('/superadmin/admins');
//         return response.data;
//     },

//     // Update admin
//     updateAdmin: async (id: string, data: any) => {
//         const response = await axiosInstance.put(`/superadmin/admins/${id}`, data);
//         return response.data;
//     },

//     // Delete admin
//     deleteAdmin: async (id: string) => {
//         const response = await axiosInstance.delete(`/superadmin/admins/${id}`);
//         return response.data;
//     }
// };