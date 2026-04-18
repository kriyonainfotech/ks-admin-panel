import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { subscriptionAPI } from "@/src/services/subscriptionService";
import { AssignPackagePayload, AssignPackageResponse, Subscription, GetSubscriptionsResponse, UpdateSubscriptionPayload } from "@/lib/subscriptionData";
export const assignPackageToClient = createAsyncThunk<
    AssignPackageResponse,
    AssignPackagePayload
>(
    "subscription/assign",
    async (payload, { rejectWithValue }) => {
        try {
            return await subscriptionAPI.assignPackage(payload);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to assign package");
        }
    }
);

export const fetchClientSubscriptions = createAsyncThunk<
    GetSubscriptionsResponse,
    string
>(
    "subscription/fetchClientPlans",
    async (clientId, { rejectWithValue }) => {
        try {
            return await subscriptionAPI.getClientSubscriptions(clientId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch client plans");
        }
    }
);

export const updateClientSubscription = createAsyncThunk<
    AssignPackageResponse,
    UpdateSubscriptionPayload
>(
    "subscription/update",
    async (payload, { rejectWithValue }) => {
        try {
            return await subscriptionAPI.updateSubscription(payload);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to update package");
        }
    }
);

export const deleteSubscription = createAsyncThunk<
    { success: boolean; message: string; summary: any },
    { id: string; options: any }
>(
    "subscription/delete",
    async ({ id, options }, { rejectWithValue }) => {
        try {
            return await subscriptionAPI.deleteSubscription(id, options);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete package");
        }
    }
);

interface SubscriptionState {
    isLoading: boolean;
    isUpdating: boolean;
    isSuccess: boolean;
    activeSubscriptions: Subscription[];
    error: string | null;
    message: string;
}

const initialState: SubscriptionState = {
    isLoading: false,
    isUpdating: false,
    isSuccess: false,
    activeSubscriptions: [],
    error: null,
    message: "",
};

const subscriptionSlice = createSlice({
    name: "subscription",
    initialState,
    reducers: {
        resetSubscriptionState: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.error = null;
            state.message = "";
        },
    },
    extraReducers: (builder) => {
        builder
            // ASSIGN PACKAGE
            .addCase(assignPackageToClient.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(assignPackageToClient.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.message = action.payload.message;
            })
            .addCase(assignPackageToClient.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // FETCH CLIENT SUBSCRIPTIONS
            .addCase(fetchClientSubscriptions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchClientSubscriptions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.activeSubscriptions = action.payload.data;
            })
            .addCase(fetchClientSubscriptions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // UPDATE SUBSCRIPTION
            .addCase(updateClientSubscription.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(updateClientSubscription.fulfilled, (state, action) => {
                state.isUpdating = false;
                state.isSuccess = true;
                state.message = action.payload.message;
                // Update local state
                const index = state.activeSubscriptions.findIndex(s => s._id === action.payload.data._id);
                if (index !== -1) {
                    state.activeSubscriptions[index] = action.payload.data;
                }
            })
            .addCase(updateClientSubscription.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload as string;
            })
            // DELETE SUBSCRIPTION
            .addCase(deleteSubscription.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(deleteSubscription.fulfilled, (state, action) => {
                state.isUpdating = false;
                state.isSuccess = true;
                state.message = action.payload.message;
                state.activeSubscriptions = state.activeSubscriptions.filter(
                    s => s._id !== action.meta.arg.id
                );
            })
            .addCase(deleteSubscription.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetSubscriptionState } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
