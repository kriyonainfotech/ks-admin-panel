export interface User {
    id: string;
    _id: string;
    // Personal
    name: string;
    email: string;
    phone: string;
    avatarUrl?: string;
    profilePic?: {
        public_id: string;
        url: string;
    };
    ringColor?: string;
    password?: string; // For admin created users

    // Business (Users provide this during App Signup)
    businessName: string;
    businessPhone?: string;
    businessAddress?: string;
    industry?: string;
    website?: string;

    // System
    source: "App Signup" | "Web Signup" | "Admin Created";
    status: "Active" | "Blocked" | "Unverified";
    joinedDate: string;
    role: "Superadmin" | "Admin" | "Team" | "Client";
    permissions: string[];
    customPermissions?: string[];

    // Multi-Company
    company?: string | { _id: string; name: string };
    accessibleCompanies?: { _id: string; name: string }[];
    activeCompany?: string;
    activeCompanyName?: string;

    // Role-specific Profiles
    profile?: any;
    specialization?: string;
}

export const initialUserData: User[] = [
    {
        id: "usr_1",
        _id: "usr_1",
        name: "Aryan Gupta",
        email: "aryan@startup.com",
        phone: "9876512345",
        businessName: "TechFlow Solutions",
        businessPhone: "079-1234567",
        industry: "IT Services",
        website: "techflow.in",
        source: "App Signup",
        status: "Active",
        joinedDate: "2025-12-05",
        role: "Superadmin",
        permissions: ["all"],
    }
];