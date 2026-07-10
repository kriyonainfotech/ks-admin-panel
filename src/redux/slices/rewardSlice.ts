import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../services/apiConnector";

interface RewardState {
    totalPoints: number;
    history: any[];
    leaderboard: any[];
    isLoading: boolean;
    error: string | null;
}

const initialState: RewardState = {
    totalPoints: 0,
    history: [],
    leaderboard: [],
    isLoading: false,
    error: null,
};

export const fetchMyRewards = createAsyncThunk("rewards/fetchMyRewards", async () => {
    const response = await axiosInstance.get("/api/rewards/my-rewards");
    return response.data;
});

export const fetchLeaderboard = createAsyncThunk("rewards/fetchLeaderboard", async () => {
    const response = await axiosInstance.get("/api/rewards/leaderboard");
    return response.data;
});

const rewardSlice = createSlice({
    name: "rewards",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyRewards.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchMyRewards.fulfilled, (state, action) => {
                state.isLoading = false;
                state.totalPoints = action.payload.totalPoints;
                state.history = action.payload.data;
            })
            .addCase(fetchMyRewards.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Failed to fetch rewards";
            })
            .addCase(fetchLeaderboard.fulfilled, (state, action) => {
                state.leaderboard = action.payload.data;
            });
    },
});

export default rewardSlice.reducer;
