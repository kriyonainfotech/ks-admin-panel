import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { optionSetService, OptionSet, OptionItem } from "../../services/optionSetService";

// State Interface
interface OptionSetState {
    optionSets: OptionSet[]; // List of all sets
    currentSet: OptionSet | null; // Currently selected/editing set
    isLoading: boolean;
    error: string | null;
}

const initialState: OptionSetState = {
    optionSets: [],
    currentSet: null,
    isLoading: false,
    error: null,
};

// --- Async Thunks ---

// Fetch All Sets
export const fetchOptionSets = createAsyncThunk(
    "optionSet/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await optionSetService.getAllOptionSets();
            return response.data; // Assuming backend sends { success: true, data: [...] }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch option sets");
        }
    }
);

// Fetch Single Set by Name
export const fetchOptionSetByName = createAsyncThunk(
    "optionSet/fetchByName",
    async (name: string, { rejectWithValue }) => {
        try {
            const response = await optionSetService.getOptionSetByName(name);
            return response.data || response; // Support both {data: set} and just set
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || `Failed to fetch option set: ${name}`);
        }
    }
);

// Create Set
export const createOptionSet = createAsyncThunk(
    "optionSet/create",
    async (data: { name: string; options: OptionItem[] }, { rejectWithValue }) => {
        try {
            const response = await optionSetService.createOptionSet(data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to create option set");
        }
    }
);

// Add Option
export const addOptionToSet = createAsyncThunk(
    "optionSet/addOption",
    async ({ setId, option }: { setId: string; option: OptionItem }, { rejectWithValue }) => {
        try {
            const response = await optionSetService.addOption(setId, option);
            return response.data; // Returns updated OptionSet
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to add option");
        }
    }
);

// Update Option
export const updateOptionInSet = createAsyncThunk(
    "optionSet/updateOption",
    async ({ setId, optionId, data }: { setId: string; optionId: string; data: Partial<OptionItem> }, { rejectWithValue }) => {
        try {
            const response = await optionSetService.updateOption(setId, optionId, data);
            return response.data; // Returns updated OptionSet
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to update option");
        }
    }
);

// Delete Option
export const deleteOptionFromSet = createAsyncThunk(
    "optionSet/deleteOption",
    async ({ setId, optionId }: { setId: string; optionId: string }, { rejectWithValue }) => {
        try {
            await optionSetService.deleteOption(setId, optionId);
            return { setId, optionId }; // Return IDs to update local state
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete option");
        }
    }
);

// --- Slice ---

const optionSetSlice = createSlice({
    name: "optionSet",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentSet: (state, action: PayloadAction<OptionSet>) => {
            state.currentSet = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchOptionSets.pending, (state) => { state.isLoading = true; })
            .addCase(fetchOptionSets.fulfilled, (state, action) => {
                state.isLoading = false;
                state.optionSets = action.payload;
            })
            .addCase(fetchOptionSets.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch By Name
            .addCase(fetchOptionSetByName.pending, (state) => { state.isLoading = true; })
            .addCase(fetchOptionSetByName.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentSet = action.payload;
                // Also update in list if present
                const index = state.optionSets.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.optionSets[index] = action.payload;
                } else {
                    state.optionSets.push(action.payload);
                }
            })
            .addCase(fetchOptionSetByName.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Create
            .addCase(createOptionSet.fulfilled, (state, action) => {
                state.optionSets.push(action.payload);
            })

            // Add/Update Option (Optimistic update via Backend response)
            .addCase(addOptionToSet.fulfilled, (state, action) => {
                const updatedSet = action.payload;
                const index = state.optionSets.findIndex(s => s._id === updatedSet._id);
                if (index !== -1) state.optionSets[index] = updatedSet;
            })
            .addCase(updateOptionInSet.fulfilled, (state, action) => {
                const updatedSet = action.payload;
                const index = state.optionSets.findIndex(s => s._id === updatedSet._id);
                if (index !== -1) state.optionSets[index] = updatedSet;
            })

            // Delete Option
            .addCase(deleteOptionFromSet.fulfilled, (state, action) => {
                const { setId, optionId } = action.payload;
                const setIndex = state.optionSets.findIndex(s => s._id === setId);
                if (setIndex !== -1) {
                    state.optionSets[setIndex].options = state.optionSets[setIndex].options.filter(o => o._id !== optionId);
                }
            });
    }
});

export const { clearError, setCurrentSet } = optionSetSlice.actions;
export default optionSetSlice.reducer;