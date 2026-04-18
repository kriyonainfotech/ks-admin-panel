import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { sopPointAPI } from "../../services/sopPointService";

export const fetchSopPoints = createAsyncThunk("sopPoints/fetchByGroup", async (groupId: string, { rejectWithValue }) => {
    try {
        return await sopPointAPI.getPoints(groupId);
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.error || "Failed to fetch points");
    }
});

export const createSopPoint = createAsyncThunk("sopPoints/create", async (data: any, { rejectWithValue }) => {
    try {
        return await sopPointAPI.createPoint(data);
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.error || "Failed to create point");
    }
});

export const updateSopPoint = createAsyncThunk("sopPoints/update", async ({ id, data }: { id: string, data: any }, { rejectWithValue }) => {
    try {
        return await sopPointAPI.updatePoint(id, data);
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.error || "Failed to update point");
    }
});

export const deleteSopPoint = createAsyncThunk("sopPoints/delete", async (id: string, { rejectWithValue }) => {
    try {
        await sopPointAPI.deletePoint(id);
        return id;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.error || "Failed to delete point");
    }
});

export const reorderSopPoints = createAsyncThunk("sopPoints/reorder", async (orders: { id: string, order: number }[], { rejectWithValue }) => {
    try {
        return await sopPointAPI.reorderPoints(orders);
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.error || "Failed to reorder points");
    }
});

interface SopPointState {
    points: any[];
    isLoading: boolean;
    error: string | null;
    message: string | null;
}

const initialState: SopPointState = {
    points: [],
    isLoading: false,
    error: null,
    message: null,
};

const sopPointSlice = createSlice({
    name: "sopPoints",
    initialState,
    reducers: {
        resetSopPointStatus: (state) => {
            state.error = null;
            state.message = null;
        },
        setPoints: (state, action) => {
            state.points = action.payload;
        },
        reorderPointsSync: (state, action: { payload: { sourceIndex: number, destinationIndex: number } }) => {
            const { sourceIndex, destinationIndex } = action.payload;
            if (sourceIndex < 0 || sourceIndex >= state.points.length || destinationIndex < 0 || destinationIndex >= state.points.length) return;
            const newPoints = [...state.points];
            const [reorderedItem] = newPoints.splice(sourceIndex, 1);
            newPoints.splice(destinationIndex, 0, reorderedItem);
            state.points = newPoints;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSopPoints.pending, (state) => { state.isLoading = true; })
            .addCase(fetchSopPoints.fulfilled, (state, action) => {
                state.isLoading = false;
                state.points = action.payload.data;
            })
            .addCase(fetchSopPoints.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createSopPoint.fulfilled, (state, action) => {
                state.points.push(action.payload.data);
                state.message = "Point created successfully";
            })
            .addCase(updateSopPoint.fulfilled, (state, action) => {
                const index = state.points.findIndex(p => p._id === action.payload.data._id);
                if (index !== -1) state.points[index] = action.payload.data;
                state.message = "Point updated successfully";
            })
            .addCase(deleteSopPoint.fulfilled, (state, action) => {
                state.points = state.points.filter(p => p._id !== action.payload);
                state.message = "Point deleted successfully";
            })
            .addCase(reorderSopPoints.fulfilled, (state) => {
                state.message = "Points reordered successfully";
            });
    }
});

export const { resetSopPointStatus, setPoints, reorderPointsSync } = sopPointSlice.actions;
export default sopPointSlice.reducer;
