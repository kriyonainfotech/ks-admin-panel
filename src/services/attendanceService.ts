import { apiConnector } from "./apiConnector";
import { AttendanceStatusResponse, AttendanceLogsResponse } from "../types/attendanceTypes";

export const attendanceService = {
    // 1. Mark Attendance Manually
    markAttendanceManualAPI: async (userId: string, status: string, date?: Date, userModel?: string): Promise<any> => {
        const response = await apiConnector.post(`/api/attendance/mark-manual`, {
            userId,
            status,
            date,
            userModel
        });
        return response.data;
    },

    // 2. Get Status (Check if checked in today) - Keep for any team-side status check
    getAttendanceStatusAPI: async (): Promise<AttendanceStatusResponse> => {
        const response = await apiConnector.get(`/api/attendance/status`);
        return response.data;
    },

    // 3. Get All Attendance
    getAllAttendanceAPI: async (date?: string): Promise<AttendanceLogsResponse> => {
        const url = date ? `/api/attendance/all?date=${date}` : `/api/attendance/all`;
        const response = await apiConnector.get(url);
        return response.data;
    },

    // 4. Get QR Link
    getQRLinkAPI: async (): Promise<any> => {
        const response = await apiConnector.get(`/api/attendance/qr-link`);
        return response.data;
    },

    // 5. Calendar Exceptions
    getCalendarExceptionsAPI: async (): Promise<any> => {
        const response = await apiConnector.get(`/api/attendance/calendar-exceptions`);
        return response.data;
    },

    addCalendarExceptionAPI: async (data: { date: string | Date, type: string, description?: string }): Promise<any> => {
        const response = await apiConnector.post(`/api/attendance/calendar-exceptions`, data);
        return response.data;
    },

    deleteCalendarExceptionAPI: async (id: string): Promise<any> => {
        const response = await apiConnector.delete(`/api/attendance/calendar-exceptions/${id}`);
        return response.data;
    },

    // 6. Get Missing Dates
    getMissingDatesAPI: async (): Promise<{ success: boolean; data: string[] }> => {
        const response = await apiConnector.get(`/api/attendance/missing-dates`);
        return response.data;
    },

    // 7. Clock In/Out
    clockInAPI: async (): Promise<any> => {
        const response = await apiConnector.post(`/api/attendance/clock-in`, {});
        return response.data;
    },

    clockOutAPI: async (): Promise<any> => {
        const response = await apiConnector.post(`/api/attendance/clock-out`, {});
        return response.data;
    }
};
