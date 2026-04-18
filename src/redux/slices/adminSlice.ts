import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminAPI } from "@/src/services/adminServices";
import { AdminUser, DeleteAdminResponse, GetAllAdminsResponse, SingleAdminResponse } from "@/lib/admindata";

// GET ALL ADMINS
export const fetchAdmins = createAsyncThunk<GetAllAdminsResponse>(
    "admins/fetchAll",
    async (_, thunkAPI) => {
        try {
            const data = await adminAPI.getAllAdmins();
            return data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue("Failed to fetch admins");
        }
    }
);


export const fetchSuperAdmins = createAsyncThunk<GetAllAdminsResponse>(
    "superadmins/fetchAll",
    async (_, thunkAPI) => {
        try {
            const data = await adminAPI.getAllSuperAdmins();
            return data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue("Failed to fetch superadmins");
        }
    }
);

// CREATE ADMIN
// export const createAdmin = createAsyncThunk<SingleAdminResponse, { data: Partial<AdminUser> }>(
//     "admins/create",
//     async (data: any, { rejectWithValue }) => {
//         try {
//             console.log(data, 'data');
//             return await adminAPI.createAdmin(data);
//         } catch (err) {
//             return rejectWithValue("Failed to create admin");
//         }
//     }
// );

export const createAdmin = createAsyncThunk<
    SingleAdminResponse,
    Omit<AdminUser, "_id" | "createdAt" | "lastLogin">
>(
    "admins/create",
    async (adminData, { rejectWithValue }) => {
        try {
            return await adminAPI.createAdmin(adminData);
        } catch (err) {
            return rejectWithValue("Failed to create admin");
        }
    }
);


// UPDATE ADMIN
export const updateAdmin = createAsyncThunk<SingleAdminResponse, { id: string; data: Partial<AdminUser> }>(
    "admins/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            return await adminAPI.updateAdmin(id, data);
        } catch (err) {
            return rejectWithValue("Failed to update admin");
        }
    }
);

export const deleteAdmin = createAsyncThunk<string, string>(
    "admins/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            await adminAPI.deleteAdmin(id);
            return id; // ✅ matches the <string> return type
        } catch (err) {
            return rejectWithValue("Failed to delete admin");
        }
    }
);

export const resetAdminPassword = createAsyncThunk(
    "admins/resetPassword",
    async (
        { id, password }: { id: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            console.log(id, password, "THUNK PAYLOAD");
            await adminAPI.resetPassword(id, password);
            return { id, password };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to reset password"
            );
        }
    }
);

interface AdminState {
    admins: any[];
    superadmins: any[];
    totalAdmins: number;
    totalSuperAdmins: number; // Add this
    isLoading: boolean;
    error: string | null;
}

const initialState: AdminState = {
    admins: [],
    superadmins: [],
    totalAdmins: 0,
    totalSuperAdmins: 0, // Initialize
    isLoading: false,
    error: null,
};

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // GET ALL ADMINS
            .addCase(fetchAdmins.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAdmins.fulfilled, (state, action) => {
                state.isLoading = false;
                state.admins = action.payload.data;
                state.totalAdmins = action.payload.count;
            })
            .addCase(fetchAdmins.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // GET  ALL SUPERADMINS
            .addCase(fetchSuperAdmins.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSuperAdmins.fulfilled, (state, action) => {
                state.isLoading = false;
                state.superadmins = action.payload.data;
                state.totalSuperAdmins = action.payload.count;
            })
            .addCase(fetchSuperAdmins.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // CREATE
            .addCase(createAdmin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createAdmin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.admins.unshift(action.payload.data);
                state.totalAdmins += 1;
            })
            .addCase(createAdmin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            .addCase(updateAdmin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateAdmin.fulfilled, (state, action) => {
                state.isLoading = false;
                const updatedAdmin = action.payload.data; // your backend wraps the object in { success, data }

                console.log("✅ [UPDATE ADMIN FULFILLED] Payload received:", updatedAdmin);

                const index = state.admins.findIndex(a => a._id === updatedAdmin._id);
                if (index !== -1) {
                    console.log(`🔄 Updating admin at index ${index}:`, state.admins[index]);
                    state.admins[index] = updatedAdmin;
                    console.log("✅ Admin updated successfully:", state.admins[index]);
                } else {
                    console.warn(`⚠️ Admin with _id ${updatedAdmin._id} not found in state`);
                }
            })
            .addCase(updateAdmin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // DELETE
            .addCase(deleteAdmin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteAdmin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.admins = state.admins.filter(a => a._id !== action.payload);
                state.totalAdmins = Math.max(0, state.totalAdmins - 1); // Ensure it doesn't go below 0
            })
            .addCase(deleteAdmin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // RESET PASSWORD
            .addCase(resetAdminPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(resetAdminPassword.fulfilled, (state, action) => {
                state.isLoading = false;

                const { id } = action.payload;

                // Optionally: mark this admin as "passwordReset": true
                const admin = state.admins.find(a => a._id === id);
                if (admin) admin.passwordReset = true;
            })
    }
});

export default adminSlice.reducer;
