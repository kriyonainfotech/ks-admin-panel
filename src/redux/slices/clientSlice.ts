import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { clientAPI } from "@/src/services/clientService";
import { Client } from "@/lib/clientdata";

/* =======================
   Async Thunks
======================= */

export const fetchClients = createAsyncThunk(
    "clients/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            return await clientAPI.getAllClients();
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch clients");
        }
    }
);

export const createClient = createAsyncThunk(
    "clients/create",
    async (data: any, { rejectWithValue }) => {
        try {
            return await clientAPI.createClient(data);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to create client");
        }
    }
);

export const updateClient = createAsyncThunk(
    "clients/update",
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            return await clientAPI.updateClient(id, data);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to update client");
        }
    }
);

export const deleteClient = createAsyncThunk(
    "clients/delete",
    async ({ id, options }: { id: string; options?: Record<string, boolean> }, { rejectWithValue }) => {
        try {
            return await clientAPI.deleteClient(id, options);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to delete client");
        }
    }
);

export const getClientsByTeamMember = createAsyncThunk(
    "clients/getByTeamMember",
    async (teamId: string, { rejectWithValue }) => {
        try {
            const data = await clientAPI.getClientsByTeamMember(teamId);
            console.log(data?.data, "data");
            return data?.data;
        } catch (err: any) {
            console.log(err, "err");
            return rejectWithValue(err?.message || "Failed to fetch clients");
        }
    }
);

export const resetClientPassword = createAsyncThunk(
    "clients/resetPassword",
    async (
        { id, password }: { id: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            return await clientAPI.resetClientPassword(id, password);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to reset password");
        }
    }
);

/* =======================
   Initial State
======================= */

const initialState = {
    clients: [] as Client[],
    isLoading: false,
    error: null as string | null,
    message: null as string | null,
};

/* =======================
   Slice
======================= */

const clientSlice = createSlice({
    name: "clients",
    initialState,
    reducers: {
        clearClientMessage: (state) => {
            state.message = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder

            /* ===== FETCH ===== */
            .addCase(fetchClients.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchClients.fulfilled, (state, action) => {
                state.isLoading = false;
                state.clients = action.payload?.data || [];
            })
            .addCase(fetchClients.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ===== CREATE ===== */
            .addCase(createClient.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createClient.fulfilled, (state, action) => {
                state.isLoading = false;
                state.clients.push(action.payload.data);
                state.message = action.payload.message;
            })
            .addCase(createClient.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ===== UPDATE ===== */
            .addCase(updateClient.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateClient.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.clients.findIndex(
                    (c) => c.id === action.payload.data.id
                );
                if (index !== -1) {
                    state.clients[index] = action.payload.data;
                }
                state.message = action.payload.message;
            })
            .addCase(updateClient.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ===== DELETE ===== */
            .addCase(deleteClient.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteClient.fulfilled, (state, action) => {
                state.isLoading = false;
                state.clients = state.clients.filter(
                    (c) => c.id !== action.meta.arg.id
                );
                state.message = action.payload.message;
            })
            .addCase(deleteClient.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ===== RESET PASSWORD ===== */
            .addCase(resetClientPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(resetClientPassword.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action.payload.message;
            })
            .addCase(resetClientPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            .addCase(getClientsByTeamMember.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getClientsByTeamMember.fulfilled, (state, action) => {
                state.isLoading = false;
                state.clients = action.payload;
            })
            .addCase(getClientsByTeamMember.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
    },
});

/* =======================
   Exports
======================= */

export const { clearClientMessage } = clientSlice.actions;
export default clientSlice.reducer;
