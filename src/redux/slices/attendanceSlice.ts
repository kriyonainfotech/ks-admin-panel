import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { attendanceService } from "../../services/attendanceService";
import { AttendanceState } from "../../types/attendanceTypes";

const initialState: AttendanceState = {
    status: {
        checkedIn: false
    },
    logs: [],
    isLoading: false,
    error: null
};

// Async Thunks

// 1. Get Status (Check if checked in today)
export const getAttendanceStatus = createAsyncThunk(
    "attendance/getStatus",
    async (_, { rejectWithValue }) => {
        try {
            return await attendanceService.getAttendanceStatusAPI();
        } catch (error: any) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            );
        }
    }
);

// 2. Get QR Link
export const getQRLink = createAsyncThunk(
    "attendance/getQRLink",
    async (_, { rejectWithValue }) => {
        try {
            return await attendanceService.getQRLinkAPI();
        } catch (error: any) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            );
        }
    }
);

// 3. Clock In
export const clockIn = createAsyncThunk(
    "attendance/clockIn",
    async (_, { rejectWithValue }) => {
        try {
            return await attendanceService.clockInAPI();
        } catch (error: any) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            );
        }
    }
);

// 4. Clock Out
export const clockOut = createAsyncThunk(
    "attendance/clockOut",
    async (_, { rejectWithValue }) => {
        try {
            return await attendanceService.clockOutAPI();
        } catch (error: any) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            );
        }
    }
);

const attendanceSlice = createSlice({
    name: "attendance",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Get Status
        builder.addCase(getAttendanceStatus.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getAttendanceStatus.fulfilled, (state, action) => {
            state.isLoading = false;
            state.status.checkedIn = action.payload.checkedIn;
            state.status.data = action.payload.data || null;
        });
        builder.addCase(getAttendanceStatus.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Get QR Link
        builder.addCase(getQRLink.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getQRLink.fulfilled, (state) => {
            state.isLoading = false;
        });
        builder.addCase(getQRLink.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Clock In
        builder.addCase(clockIn.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(clockIn.fulfilled, (state, action) => {
            state.isLoading = false;
            state.status.checkedIn = true;
            state.status.data = action.payload.data;
        });
        builder.addCase(clockIn.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Clock Out
        builder.addCase(clockOut.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(clockOut.fulfilled, (state, action) => {
            state.isLoading = false;
            state.status.checkedIn = true; // Still technically has a record for today
            state.status.data = action.payload.data;
        });
        builder.addCase(clockOut.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
    }
});

export const { clearError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
