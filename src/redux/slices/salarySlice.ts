import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { salaryService } from "../../services/salaryService";

interface SalaryState {
    wallet: {
        earnedSalary: number;
        baseSalary: number;
        dailyRate: number;
        totalWorkingDaysCount: number;
        attendanceSummary: {
            present: number;
            halfDay: number;
            leave: number;
        };
    } | null;
    stats: {
        totalPayroll: number;
        accruedTillDate: number;
        disbursed: number;
    } | null;
    payrollList: any[];
    attendanceLogs: any[];
    isLoading: boolean;
    error: string | null;
    selectedMonth: number;
    selectedYear: number;
}

const now = new Date();

const initialState: SalaryState = {
    wallet: null,
    stats: null,
    payrollList: [],
    attendanceLogs: [],
    isLoading: false,
    error: null,
    selectedMonth: now.getMonth() + 1,
    selectedYear: now.getFullYear(),
};

export const fetchWalletStats = createAsyncThunk(
    "salary/fetchWallet",
    async (_, { rejectWithValue }) => {
        try {
            const res = await salaryService.getMyWalletStats();
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch wallet stats");
        }
    }
);

export const fetchPayrollStats = createAsyncThunk(
    "salary/fetchStats",
    async (params: { month: number; year: number }, { rejectWithValue }) => {
        try {
            const res = await salaryService.getPayrollStats(params);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch payroll stats");
        }
    }
);

export const fetchPayrollList = createAsyncThunk(
    "salary/fetchList",
    async (params: { month: number; year: number; tab: string }, { rejectWithValue }) => {
        try {
            const res = await salaryService.getPayrollList(params);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch payroll list");
        }
    }
);

export const recordSalaryPayment = createAsyncThunk(
    "salary/recordPayment",
    async (data: any, { rejectWithValue, dispatch, getState }) => {
        try {
            const res = await salaryService.recordSalaryPayment(data);
            // Refresh stats and list after payment
            const state = getState() as any;
            const { selectedMonth, selectedYear } = state.salary;
            dispatch(fetchPayrollStats({ month: selectedMonth, year: selectedYear }));
            // We'd need to know the active tab to refresh the list correctly, 
            // but usually the list is refreshed by the component or we can refresh default tab
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to record payment");
        }
    }
);

export const fetchAttendanceLogs = createAsyncThunk(
    "salary/fetchLogs",
    async ({ userId, params }: { userId: string; params: { month: number; year: number } }, { rejectWithValue }) => {
        try {
            const res = await salaryService.getAttendanceLogs(userId, params);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch attendance logs");
        }
    }
);

const salarySlice = createSlice({
    name: "salary",
    initialState,
    reducers: {
        setSelectedDate: (state, action) => {
            state.selectedMonth = action.payload.month;
            state.selectedYear = action.payload.year;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWalletStats.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWalletStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.wallet = action.payload;
            })
            .addCase(fetchWalletStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Payroll Stats
            .addCase(fetchPayrollStats.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPayrollStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload;
            })
            .addCase(fetchPayrollStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Payroll List
            .addCase(fetchPayrollList.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPayrollList.fulfilled, (state, action) => {
                state.isLoading = false;
                state.payrollList = action.payload;
            })
            .addCase(fetchPayrollList.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Attendance Logs
            .addCase(fetchAttendanceLogs.fulfilled, (state, action) => {
                state.attendanceLogs = action.payload;
            });
    },
});

export const { setSelectedDate } = salarySlice.actions;
export default salarySlice.reducer;
