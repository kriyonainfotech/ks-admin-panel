export type TeamRole = "Designer" | "Video Editor" | "Content Writer" | "Marketer" | "Developer";

export interface Team {
    // User model
    _id: string;
    name: string;
    email: string;
    phone?: string;
    profilePic?: {
        public_id: string;
        url: string;
    };
    ringColor?: string;

    role: string;
    status: "Active" | "Suspended" | "On Leave" | "Pending";
    isActive: boolean;

    customPermissions: string[];

    profileId: string;

    createdAt: string;
    updatedAt: string;

    // Team Profile (Merged)
    profile: {
        _id: string;
        user: string;
        specialization: string;
        skills: string[];
        salary?: {
            amount: number;
            currency: string;
        };
        address: {
            street: string;
            city: string;
            state: string;
            country: string;
        };
        emergencyContact1: {
            name?: string;
            phone?: string;
        }
        emergencyContact2: {
            name?: string;
            phone?: string;
        }
        experience?: string;
        joinedDate?: string;
        notes: {
            type: string
        };
        timing?: {
            start: string;
            end: string;
        };
        bankInfo?: {
            bankName: string;
            accountNumber: string;
            ifscCode: string;
        };
    };
    performance?: {
        daily: { total: number; done: number; percentage: number };
        monthly: { total: number; done: number; percentage: number };
        attendance: { present: number; fullDays: number; halfDays: number; leaves: number; totalDays: number };
    };
}

export interface TeamResponse {
    success: boolean;
    message: string;
    data: Team;
}

export interface DeleteTeamResponse {
    success: boolean;
    id: string;
}

export interface TeamsResponse {
    success: boolean;
    message: string;
    data: Team[];
}