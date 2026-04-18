export interface AttendanceState {
    status: {
        checkedIn: boolean;
        data?: any;
    };
    logs: any[];
    isLoading: boolean;
    error: string | null;
}

export interface MarkAttendanceResponse {
    success: boolean;
    data: any;
    message?: string;
}

export interface AttendanceStatusResponse {
    checkedIn: boolean;
    data?: any;
}

export interface QRLinkResponse {
    success: boolean;
    qrToken: string;
    url: string;
}

export interface AttendanceLog {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    date: string;
    startTime: string;
    endTime?: string;
    scanTime: string;
    status: "Full Day" | "Half Day" | "Leave";
    userModel: "Admin" | "Team" | "User";
    createdAt: string;
    updatedAt: string;
}

export interface AttendanceLogsResponse {
    success: boolean;
    count: number;
    data: AttendanceLog[];
}
