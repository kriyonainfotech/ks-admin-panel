import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { sopGroupAPI } from "../../services/sopGroupService";

export const fetchSopGroups = createAsyncThunk("sopGroups/fetchAll", async (params: any, { rejectWithValue }) => {
    try {
        return await sopGroupAPI.getGroups(params);
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.error || "Failed to fetch groups");
    }
});

export const createSopGroup = createAsyncThunk("sopGroups/create", async (data: any, { rejectWithValue }) => {
    try {
        return await sopGroupAPI.createGroup(data);
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.error || "Failed to create group");
    }
});

export const updateSopGroup = createAsyncThunk("sopGroups/update", async ({ id, data }: { id: string, data: any }, { rejectWithValue }) => {
    try {
        return await sopGroupAPI.updateGroup(id, data);
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.error || "Failed to update group");
    }
});

export const deleteSopGroup = createAsyncThunk("sopGroups/delete", async (id: string, { rejectWithValue }) => {
    try {
        await sopGroupAPI.deleteGroup(id);
        return id;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.error || "Failed to delete group");
    }
});

export const reorderSopGroups = createAsyncThunk("sopGroups/reorder", async (orders: { id: string, order: number }[], { rejectWithValue }) => {
    try {
        return await sopGroupAPI.reorderGroups(orders);
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.error || "Failed to reorder groups");
    }
});

interface SopGroupState {
    groups: any[];
    isLoading: boolean;
    error: string | null;
    message: string | null;
}

const initialState: SopGroupState = {
    groups: [],
    isLoading: false,
    error: null,
    message: null,
};

const sopGroupSlice = createSlice({
    name: "sopGroups",
    initialState,
    reducers: {
        resetSopGroupStatus: (state) => {
            state.error = null;
            state.message = null;
        },
        setGroups: (state, action) => {
            state.groups = action.payload;
        },
        reorderGroupsSync: (state, action: { payload: { sourceIndex: number, destinationIndex: number } }) => {
            const { sourceIndex, destinationIndex } = action.payload;
            if (sourceIndex < 0 || sourceIndex >= state.groups.length || destinationIndex < 0 || destinationIndex >= state.groups.length) return;
            const newGroups = [...state.groups];
            const [reorderedItem] = newGroups.splice(sourceIndex, 1);
            newGroups.splice(destinationIndex, 0, reorderedItem);
            state.groups = newGroups;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSopGroups.pending, (state) => { state.isLoading = true; })
            .addCase(fetchSopGroups.fulfilled, (state, action) => {
                state.isLoading = false;
                state.groups = action.payload.data;
            })
            .addCase(fetchSopGroups.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createSopGroup.fulfilled, (state, action) => {
                state.groups.push(action.payload.data);
                state.message = "Group created successfully";
            })
            .addCase(updateSopGroup.fulfilled, (state, action) => {
                const index = state.groups.findIndex(g => g._id === action.payload.data._id);
                if (index !== -1) state.groups[index] = action.payload.data;
                state.message = "Group updated successfully";
            })
            .addCase(deleteSopGroup.fulfilled, (state, action) => {
                state.groups = state.groups.filter(g => g._id !== action.payload);
                state.message = "Group deleted successfully";
            })
            .addCase(reorderSopGroups.fulfilled, (state) => {
                state.message = "Groups reordered successfully";
            });
    }
});

export const { resetSopGroupStatus, setGroups, reorderGroupsSync } = sopGroupSlice.actions;
export default sopGroupSlice.reducer;
