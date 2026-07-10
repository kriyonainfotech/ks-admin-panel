import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const fetchSchedulesByClient = createAsyncThunk(
    "schedule/fetchByClient",
    async (clientId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/api/schedules/client/${clientId}`, { withCredentials: true });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const fetchScheduleAnalytics = createAsyncThunk(
    "schedule/fetchAnalytics",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/api/schedules/analytics`, { withCredentials: true });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const fetchScheduleSummary = createAsyncThunk(
    "schedule/fetchSummary",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/api/schedules/summary`, { withCredentials: true });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch summary");
        }
    }
);

export const createChutakItem = createAsyncThunk(
    "schedule/createChutak",
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/api/schedules/chutak`, data, { withCredentials: true });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to create chutak item");
        }
    }
);

export const updateChutakItem = createAsyncThunk(
    "schedule/updateChutak",
    async ({ id, ...data }: { id: string; [key: string]: any }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/api/schedules/${id}`, data, { withCredentials: true });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to update chutak item");
        }
    }
);

export const deleteChutakItem = createAsyncThunk(
    "schedule/deleteChutak",
    async (id: string, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_URL}/api/schedules/${id}`, { withCredentials: true });
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete chutak item");
        }
    }
);

export const fetchChutakItemsByClient = createAsyncThunk(
    "schedule/fetchChutakByClient",
    async ({ clientId, startDate, endDate }: { clientId: string, startDate?: string, endDate?: string }, { rejectWithValue }) => {
        try {
            let url = `${API_URL}/api/schedules/chutak/client/${clientId}`;
            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }
            const response = await axios.get(url, { withCredentials: true });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch chutak items");
        }
    }
);

interface ScheduleSummaryItem {
    _id: string;
    total: number;
    unscheduled: number;
    scheduled: number;
    completed: number;
}

interface ScheduleState {
    items: any[];
    analytics: {
        totalPending: number;
        totalScheduled: number;
        totalCompleted: number;
    } | null;
    summary: ScheduleSummaryItem[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ScheduleState = {
    items: [],
    analytics: null,
    summary: [],
    isLoading: false,
    error: null,
};

const scheduleSlice = createSlice({
    name: "schedule",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSchedulesByClient.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchSchedulesByClient.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchSchedulesByClient.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchScheduleAnalytics.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchScheduleAnalytics.fulfilled, (state, action) => {
                state.isLoading = false;
                state.analytics = action.payload;
            })
            .addCase(fetchScheduleAnalytics.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchScheduleSummary.fulfilled, (state, action) => {
                state.summary = action.payload;
            })
            .addCase(createChutakItem.fulfilled, (state, action) => {
                state.items = [...state.items, action.payload];
            })
            .addCase(fetchChutakItemsByClient.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchChutakItemsByClient.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.data;
            })
            .addCase(fetchChutakItemsByClient.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(updateChutakItem.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(deleteChutakItem.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item._id !== action.payload);
            });
    },
});

export default scheduleSlice.reducer;
