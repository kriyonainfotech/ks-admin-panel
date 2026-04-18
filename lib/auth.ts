export interface User {
    id: string;
    name: string;
    email: string;
    role: "Superadmin" | "Admin" | "Team" | "Client";
    avatarUrl?: string;
    token: string;
    permissions: string[];
}