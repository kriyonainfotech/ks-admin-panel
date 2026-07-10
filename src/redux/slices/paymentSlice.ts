import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentService } from "../../services/paymentService";
import { RootState } from "../store";
import { toast } from "sonner";

interface PaymentState {
    stats: {
        totalSalesValue: number;
        totalSalesCollected: number;
        totalSalesLoss: number;
        totalCollected: number;
        totalIncome: number;
        totalExpense: number;
        totalPending: number;
        totalOperational: number;
        totalSalary: number;
        byAccount: { personal: number; company: number; cash: number };
    } | null;
    sales: any[];        // List of Invoices
    collections: any[];  // List of Transactions (History)
    selectedCompany: string;
    selectedMonth: number;
    selectedYear: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: PaymentState = {
    stats: null,
    sales: [],
    collections: [],
    selectedCompany: "Kriyona Studio",
    selectedMonth: new Date().getMonth() + 1,
    selectedYear: new Date().getFullYear(),
    isLoading: false,
    error: null,
};

// --- Thunks ---

export const fetchPaymentStats = createAsyncThunk("payments/fetchStats", async (params: { company?: string, month?: number, year?: number }, { rejectWithValue }) => {
    try {
        return await paymentService.getStats(params.company, params.month, params.year);
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
    }
});

export const fetchSales = createAsyncThunk("payments/fetchSales", async (params: { company?: string, month?: number, year?: number }, { rejectWithValue }) => {
    try {
        return await paymentService.getSales(params.company, params.month, params.year);
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch sales");
    }
});

export const fetchCollections = createAsyncThunk("payments/fetchCollections", async (params: { company?: string, month?: number, year?: number }, { rejectWithValue }) => {
    try {
        return await paymentService.getCollections(params.company, params.month, params.year);
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch history");
    }
});

const getCompanyParam = (company: string) => company;

export const createSale = createAsyncThunk("payments/createSale", async (data: any, { dispatch, getState, rejectWithValue }) => {
    try {
        const result = await paymentService.createSale(data);
        toast.success("Sale created successfully!");

        const { payment } = getState() as { payment: PaymentState };
        const params = {
            company: getCompanyParam(payment.selectedCompany),
            month: payment.selectedMonth,
            year: payment.selectedYear
        };

        dispatch(fetchSales(params));
        dispatch(fetchPaymentStats(params));
        return result;
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to create sale");
        return rejectWithValue(error.response?.data?.message);
    }
});

export const collectPayment = createAsyncThunk("payments/collectPayment", async (data: any, { dispatch, getState, rejectWithValue }) => {
    try {
        const result = await paymentService.collectPayment(data);
        toast.success("Payment recorded!");

        const { payment } = getState() as { payment: PaymentState };
        const params = {
            company: getCompanyParam(payment.selectedCompany),
            month: payment.selectedMonth,
            year: payment.selectedYear
        };

        dispatch(fetchSales(params));
        dispatch(fetchCollections(params));
        dispatch(fetchPaymentStats(params));
        return result;
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to record payment");
        return rejectWithValue(error.response?.data?.message);
    }
});

export const createDirectCollection = createAsyncThunk("payments/createDirectCollection", async (data: any, { dispatch, getState, rejectWithValue }) => {
    try {
        const result = await paymentService.createDirectCollection(data);
        toast.success("Direct collection recorded!");

        const { payment } = getState() as { payment: PaymentState };
        const params = {
            company: getCompanyParam(payment.selectedCompany),
            month: payment.selectedMonth,
            year: payment.selectedYear
        };

        dispatch(fetchCollections(params));
        dispatch(fetchPaymentStats(params));
        return result;
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to record direct collection");
        return rejectWithValue(error.response?.data?.message);
    }
});

export const updateDirectCollection = createAsyncThunk("payments/updateDirectCollection", async ({ id, data }: { id: string, data: any }, { dispatch, getState, rejectWithValue }) => {
    try {
        const result = await paymentService.updateDirectCollection(id, data);
        toast.success("Direct collection updated successfully!");

        const { payment } = getState() as { payment: PaymentState };
        const params = {
            company: getCompanyParam(payment.selectedCompany),
            month: payment.selectedMonth,
            year: payment.selectedYear
        };

        dispatch(fetchCollections(params));
        dispatch(fetchPaymentStats(params));
        return result;
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to update direct collection");
        return rejectWithValue(error.response?.data?.message);
    }
});

export const recordExpense = createAsyncThunk("payments/recordExpense", async (data: any, { dispatch, getState, rejectWithValue }) => {
    try {
        const result = await paymentService.recordExpense(data);
        toast.success("Expense recorded!");

        const { payment } = getState() as { payment: PaymentState };
        const params = {
            company: getCompanyParam(payment.selectedCompany),
            month: payment.selectedMonth,
            year: payment.selectedYear
        };

        dispatch(fetchCollections(params));
        dispatch(fetchPaymentStats(params));
        return result;
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to record expense");
        return rejectWithValue(error.response?.data?.message);
    }
});

export const updateSale = createAsyncThunk("payments/updateSale", async ({ id, data }: { id: string, data: any }, { dispatch, getState, rejectWithValue }) => {
    try {
        const result = await paymentService.updateSale(id, data);
        toast.success("Sale updated successfully!");

        const { payment } = getState() as { payment: PaymentState };
        const params = {
            company: getCompanyParam(payment.selectedCompany),
            month: payment.selectedMonth,
            year: payment.selectedYear
        };

        dispatch(fetchSales(params));
        dispatch(fetchPaymentStats(params));
        return result;
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to update sale");
        return rejectWithValue(error.response?.data?.message);
    }
});

export const deleteSale = createAsyncThunk("payments/deleteSale", async (id: string, { dispatch, getState, rejectWithValue }) => {
    try {
        const result = await paymentService.deleteSale(id);
        toast.success("Sale deleted successfully!");

        const { payment } = getState() as { payment: PaymentState };
        const params = {
            company: getCompanyParam(payment.selectedCompany),
            month: payment.selectedMonth,
            year: payment.selectedYear
        };

        dispatch(fetchSales(params));
        dispatch(fetchPaymentStats(params));
        return result;
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete sale");
        return rejectWithValue(error.response?.data?.message);
    }
});

export const updateExpense = createAsyncThunk("payments/updateExpense", async ({ id, data }: { id: string, data: any }, { dispatch, getState, rejectWithValue }) => {
    try {
        const result = await paymentService.updateExpense(id, data);
        toast.success("Expense updated successfully!");

        const { payment } = getState() as { payment: PaymentState };
        const params = {
            company: getCompanyParam(payment.selectedCompany),
            month: payment.selectedMonth,
            year: payment.selectedYear
        };

        dispatch(fetchCollections(params));
        dispatch(fetchPaymentStats(params));
        return result;
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to update expense");
        return rejectWithValue(error.response?.data?.message);
    }
});

export const deleteExpense = createAsyncThunk("payments/deleteExpense", async (id: string, { dispatch, getState, rejectWithValue }) => {
    try {
        const result = await paymentService.deleteExpense(id);
        toast.success("Expense deleted successfully!");

        const { payment } = getState() as { payment: PaymentState };
        const params = {
            company: getCompanyParam(payment.selectedCompany),
            month: payment.selectedMonth,
            year: payment.selectedYear
        };

        dispatch(fetchCollections(params));
        dispatch(fetchPaymentStats(params));
        return result;
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete expense");
        return rejectWithValue(error.response?.data?.message);
    }
});

export const deleteCollection = createAsyncThunk(
    "payments/deleteCollection",
    async (id: string, { dispatch, getState, rejectWithValue }) => {
        try {
            const result = await paymentService.deleteCollection(id);
            toast.success("Collection deleted successfully!");

            // Refetch all relevant data to update balances and lists
            const { selectedCompany, selectedMonth, selectedYear } = (getState() as RootState).payment;
            const company = selectedCompany;
            const params = { company, month: selectedMonth, year: selectedYear };

            dispatch(fetchPaymentStats(params));
            dispatch(fetchSales(params));
            dispatch(fetchCollections(params));

            return result;
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to delete collection";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// --- Slice ---

export const updateCollectionAccount = createAsyncThunk(
    "payments/updateCollectionAccount",
    async ({ id, destinationAccount }: { id: string, destinationAccount: string }, { dispatch, getState, rejectWithValue }) => {
        try {
            const result = await paymentService.updateCollectionAccount(id, destinationAccount);
            toast.success("Account type updated!");

            const { selectedCompany, selectedMonth, selectedYear } = (getState() as RootState).payment;
            const params = { company: selectedCompany, month: selectedMonth, year: selectedYear };

            dispatch(fetchPaymentStats(params));
            dispatch(fetchCollections(params));

            return result;
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to update account type";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// --- Slice ---

const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {
        setSelectedCompany: (state, action) => {
            state.selectedCompany = action.payload;
        },
        setSelectedDate: (state, action: { payload: { month: number, year: number } }) => {
            state.selectedMonth = action.payload.month;
            state.selectedYear = action.payload.year;
        }
    },
    extraReducers: (builder) => {
        // Stats
        builder.addCase(fetchPaymentStats.pending, (state) => {
            state.isLoading = true;
            state.stats = null; // Clear old stats while loading
        });
        builder.addCase(fetchPaymentStats.fulfilled, (state, action) => {
            state.isLoading = false;
            state.stats = action.payload;
        });
        builder.addCase(fetchPaymentStats.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Sales
        builder.addCase(fetchSales.pending, (state) => {
            state.isLoading = true;
            state.sales = []; // Clear old sales while loading
        });
        builder.addCase(fetchSales.fulfilled, (state, action) => {
            state.isLoading = false;
            state.sales = action.payload;
        });
        builder.addCase(fetchSales.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Collections
        builder.addCase(fetchCollections.pending, (state) => {
            state.isLoading = true;
            state.collections = []; // Clear old collections while loading
        });
        builder.addCase(fetchCollections.fulfilled, (state, action) => {
            state.isLoading = false;
            state.collections = action.payload;
        });
        builder.addCase(fetchCollections.rejected, (state, action) => {
            state.isLoading = false;
        });

        // Mutations - Universal Handling
        const mutationThunks = [createSale, collectPayment, recordExpense, updateSale, deleteSale, updateExpense, deleteExpense, deleteCollection, updateCollectionAccount, createDirectCollection, updateDirectCollection];
        mutationThunks.forEach(thunk => {
            builder.addCase(thunk.pending, (state) => { state.isLoading = true; });
            builder.addCase(thunk.fulfilled, (state) => { state.isLoading = false; });
            builder.addCase(thunk.rejected, (state) => { state.isLoading = false; });
        });
    },
});

export const { setSelectedCompany, setSelectedDate } = paymentSlice.actions;
export default paymentSlice.reducer;