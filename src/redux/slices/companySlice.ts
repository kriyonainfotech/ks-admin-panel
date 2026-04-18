import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "@/src/services/apiConnector";
import { toast } from "sonner";

export interface Company {
    _id: string;
    name: string;
    owner?: {
        _id: string;
        name: string;
        email: string;
    };
    admins?: string[];
    createdAt: string;
}

interface CompanyState {
    companies: Company[];
    isLoading: boolean;
    error: string | null;
}

const initialState: CompanyState = {
    companies: [],
    isLoading: false,
    error: null,
};

// 1. Fetch Companies
export const fetchCompanies = createAsyncThunk(
    "companies/fetchCompanies",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/api/companies");
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch companies");
        }
    }
);

// 2. Create Company
export const createCompany = createAsyncThunk(
    "companies/createCompany",
    async (data: { name: string; ownerId?: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/api/companies", data);
            toast.success("Company created successfully");
            return response.data.data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create company");
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

// 3. Update Company
export const updateCompany = createAsyncThunk(
    "companies/updateCompany",
    async ({ id, data }: { id: string; data: Partial<Company> }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/api/companies/${id}`, data);
            toast.success("Company updated successfully");
            return response.data.data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update company");
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

// 4. Delete Company
export const deleteCompany = createAsyncThunk(
    "companies/deleteCompany",
    async (id: string, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/api/companies/${id}`);
            toast.success("Company deleted successfully");
            return id;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete company");
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

const companySlice = createSlice({
    name: "companies",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchCompanies.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCompanies.fulfilled, (state, action) => {
                state.isLoading = false;
                state.companies = action.payload;
            })
            .addCase(fetchCompanies.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createCompany.fulfilled, (state, action) => {
                state.companies.push(action.payload);
            })
            // Update
            .addCase(updateCompany.fulfilled, (state, action) => {
                const index = state.companies.findIndex((c) => c._id === action.payload._id);
                if (index !== -1) {
                    state.companies[index] = action.payload;
                }
            })
            // Delete
            .addCase(deleteCompany.fulfilled, (state, action) => {
                state.companies = state.companies.filter((c) => c._id !== action.payload);
            });
    },
});

export default companySlice.reducer;
