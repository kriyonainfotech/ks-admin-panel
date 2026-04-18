// src/app/(dashboard)/admins/data.ts

export type AdminRole = "SuperAdmin" | "Admin" | "TeamMember";
export type AdminStatus = "Active" | "Suspended" | "Pending";

// Admin object
export interface AdminUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    status?: string;
    createdAt?: string;
    lastLogin?: string;
}

// Response for getAllAdmins
export interface GetAllAdminsResponse {
    success: boolean;
    count: number;
    data: AdminUser[];
}

// Response for create/update single admin
export interface SingleAdminResponse {
    success: boolean;
    data: AdminUser;
}

// Response for delete
export interface DeleteAdminResponse {
    success: boolean;
    id: string;
}
