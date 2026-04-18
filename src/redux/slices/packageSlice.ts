import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ServiceItem, PackageTemplate } from "@/lib/packageData";
import { packageAPI } from "@/src/services/packageService";

interface InventoryState {
    services: ServiceItem[];
    packages: PackageTemplate[];
    loading: boolean;
    error: string | null;
}

const initialState: InventoryState = {
    services: [],
    packages: [],
    loading: false,
    error: null
};

// 1. Fetch All Data
export const fetchInventory = createAsyncThunk("inventory/fetchAll", async (_, { rejectWithValue }) => {
    try {
        const [services, packages] = await Promise.all([
            packageAPI.getAllServices(),
            packageAPI.getAllPackages()
        ]);
        return { services, packages };
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch inventory");
    }
});

export const createService = createAsyncThunk("inventory/createService", async (data: Partial<ServiceItem>, { rejectWithValue }) => {
    try {
        return await packageAPI.createService(data);
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to create service");
    }
});

export const updateService = createAsyncThunk("inventory/updateService", async ({ id, data }: { id: string; data: Partial<ServiceItem> }, { rejectWithValue }) => {
    try {
        return await packageAPI.updateService(id, data);
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to update service");
    }
});

export const deleteService = createAsyncThunk("inventory/deleteService", async (id: string, { rejectWithValue }) => {
    try {
        await packageAPI.deleteService(id);
        return id;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to delete service");
    }
});

// 3. Package Thunks
export const createPackage = createAsyncThunk("inventory/createPackage", async (data: Partial<PackageTemplate>, { rejectWithValue }) => {
    try {
        return await packageAPI.createPackage(data);
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to create package");
    }
});

export const updatePackage = createAsyncThunk("inventory/updatePackage", async ({ id, data }: { id: string; data: Partial<PackageTemplate> }, { rejectWithValue }) => {
    try {
        console.log(id, data);
        return await packageAPI.updatePackage(id, data);
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to update package");
    }
});

export const deletePackage = createAsyncThunk("inventory/deletePackage", async (id: string, { rejectWithValue }) => {
    try {
        await packageAPI.deletePackage(id);
        return id;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to delete package");
    }
});

// --- SLICE ---
const inventorySlice = createSlice({
    name: "inventory",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchInventory.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchInventory.fulfilled, (state, action) => {
                state.loading = false;
                state.services = action.payload.services;
                state.packages = action.payload.packages;
            })
            .addCase(fetchInventory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Service Reducers
            .addCase(createService.pending, (state) => { state.loading = true; })
            .addCase(createService.fulfilled, (state, action) => {
                state.loading = false;
                state.services.unshift(action.payload);
            })
            .addCase(createService.rejected, (state) => { state.loading = false; })

            .addCase(updateService.pending, (state) => { state.loading = true; })
            .addCase(updateService.fulfilled, (state, action) => {
                state.loading = false;
                const idx = state.services.findIndex(s => s._id === action.payload._id);
                if (idx !== -1) state.services[idx] = action.payload;
            })
            .addCase(updateService.rejected, (state) => { state.loading = false; })

            .addCase(deleteService.pending, (state) => { state.loading = true; })
            .addCase(deleteService.fulfilled, (state, action) => {
                state.loading = false;
                state.services = state.services.filter(s => s._id !== action.payload);
            })
            .addCase(deleteService.rejected, (state) => { state.loading = false; })

            // Package Reducers
            .addCase(createPackage.pending, (state) => { state.loading = true; })
            .addCase(createPackage.fulfilled, (state, action) => {
                state.loading = false;
                state.packages.unshift(action.payload);
            })
            .addCase(createPackage.rejected, (state) => { state.loading = false; })

            .addCase(updatePackage.pending, (state) => { state.loading = true; })
            .addCase(updatePackage.fulfilled, (state, action) => {
                state.loading = false;
                const idx = state.packages.findIndex(p => p._id === action.payload._id);
                if (idx !== -1) state.packages[idx] = action.payload;
            })
            .addCase(updatePackage.rejected, (state) => { state.loading = false; })

            .addCase(deletePackage.pending, (state) => { state.loading = true; })
            .addCase(deletePackage.fulfilled, (state, action) => {
                state.loading = false;
                state.packages = state.packages.filter(p => p._id !== action.payload);
            })
            .addCase(deletePackage.rejected, (state) => { state.loading = false; });
    }
});

export default inventorySlice.reducer;