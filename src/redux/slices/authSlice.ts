import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "@/lib/userData";
import api from "@/lib/api";

export const updateUserProfile = createAsyncThunk(
    "auth/updateProfile",
    async (formData: FormData, { rejectWithValue }) => {
        try {
            const response = await api.put("/auth/edit-profile", formData);
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.response?.data?.error || "Failed to update profile");
        }
    }
);

export const removeProfilePic = createAsyncThunk(
    "auth/removeProfilePic",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.delete("/auth/remove-profile-pic");
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.response?.data?.error || "Failed to remove profile picture");
        }
    }
);

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    activeCompanyId: string | null;
    activeCompany: { _id: string; name: string } | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    activeCompanyId: null,
    activeCompany: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isLoading = false;
            if (typeof window !== 'undefined') {
                localStorage.setItem("kriyona_user", JSON.stringify(action.payload));
            }
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            if (typeof window !== 'undefined') {
                localStorage.removeItem("kriyona_user");
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        restoreSession: (state, action: PayloadAction<User | null>) => {
            if (action.payload) {
                state.user = action.payload;
                state.isAuthenticated = true;
            } else {
                state.user = null;
                state.isAuthenticated = false;
            }
            state.isLoading = false;
        },
        setActiveCompany: (state, action: PayloadAction<{ _id: string; name: string } | null>) => {
            state.activeCompany = action.payload;
            state.activeCompanyId = action.payload?._id || null;
            if (action.payload) {
                localStorage.setItem("active_company_id", action.payload._id);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateUserProfile.pending, () => {
                // Don't set global isLoading - profile page handles its own loading state
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = {
                    ...state.user,
                    ...action.payload,
                };
                if (typeof window !== 'undefined') {
                    localStorage.setItem("kriyona_user", JSON.stringify(state.user));
                }
            })
            .addCase(updateUserProfile.rejected, (state) => {
                state.isLoading = false;
            })
            .addCase(removeProfilePic.pending, () => {
                // Profile page handles its own loading state
            })
            .addCase(removeProfilePic.fulfilled, (state, action) => {
                // Replace user entirely so profilePic: null properly clears the old value
                state.user = action.payload;
                if (typeof window !== 'undefined') {
                    localStorage.setItem("kriyona_user", JSON.stringify(state.user));
                }
            })
            .addCase(removeProfilePic.rejected, () => {
                // Profile page handles its own error state
            });
    },
});

export const { login, logout, setLoading, restoreSession, setActiveCompany } = authSlice.actions;
export default authSlice.reducer;