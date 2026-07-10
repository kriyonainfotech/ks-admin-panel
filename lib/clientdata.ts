export interface Client {
    id: string;
    user: string;
    name: string;
    email: string;
    phone?: string;
    password?: string;
    avatarUrl?: string;

    // Business Info (ClientProfile)
    businessName: string;
    businessPhone?: string;
    businessEmail?: string;

    city?: string;
    state?: string;
    country?: string;
    businessAddress?: string;

    industry?: string;
    website?: string;

    socials: {
        facebookId?: string;
        facebookPassword?: string;
        instagramId?: string;
        instagramPassword?: string;
    };

    // Assignments
    assignedTeamIds: string[];
    assignedAdminId?: string | null;

    // Status from backend clientStatus
    status: "Active" | "Inactive" | "Onboarding";

    joinedDate: string;

    // Package Info (optional because it's enriched)
    servicePackage?: string;
    packageStatus?: string;
    paymentStatus?: string;

    // Subscriptions (Fetched from backend)
    subscriptions?: ClientSubscription[];
    
    // Indicates if the client has Chutak items (fetched from backend)
    hasChutakItems?: boolean;
}

export interface ClientSubscription {
    id: string;
    packageName: string;
    packagePrice: number;
    startDate: string;
    endDate: string;
    status: "Active" | "Completed" | "Cancelled";
    deliverables: any[]; // refine if needed
}

