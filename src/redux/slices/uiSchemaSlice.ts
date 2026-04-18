import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { uiSchemaAPI } from "@/src/services/uiSchemaService";
import { UiSchema, UiField } from "@/lib/uiSchemaData";

// --- THUNKS ---

export const fetchSchema = createAsyncThunk(
    "uiSchema/fetch",
    async ({ resource, variant = 'default' }: { resource: string; variant?: string }, { rejectWithValue }) => {
        try {
            return await uiSchemaAPI.getSchema(resource, variant);
        } catch (err: any) {
            return rejectWithValue("Failed to fetch UI schema");
        }
    }
);

export const saveSchema = createAsyncThunk(
    "uiSchema/save",
    async ({ resource, variant = 'default', fields }: { resource: string; variant?: string; fields: UiField[] }, { rejectWithValue }) => {
        try {
            return await uiSchemaAPI.updateSchema(resource, variant, fields);
        } catch (err: any) {
            return rejectWithValue("Failed to save UI schema");
        }
    }
);

// --- SLICE ---

interface UiSchemaState {
    schemas: Record<string, UiSchema>; // Cache keyed by resource-variant
    currentSchema: UiSchema | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: UiSchemaState = {
    schemas: {},
    currentSchema: null,
    isLoading: false,
    error: null,
};

const uiSchemaSlice = createSlice({
    name: "uiSchema",
    initialState,
    reducers: {
        setFields: (state, action) => {
            if (state.currentSchema) {
                state.currentSchema.fields = action.payload;
            }
        },
        clearSchemaError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchSchema.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSchema.fulfilled, (state, action) => {
                state.isLoading = false;
                const schema = action.payload;
                state.currentSchema = schema;

                // Cache it
                const cacheKey = `${schema.resource}-${schema.variant || 'default'}`;
                state.schemas[cacheKey] = schema;
            })
            .addCase(fetchSchema.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Save
            .addCase(saveSchema.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(saveSchema.fulfilled, (state, action) => {
                state.isLoading = false;
                const schema = action.payload;
                state.currentSchema = schema;

                const cacheKey = `${schema.resource}-${schema.variant || 'default'}`;
                state.schemas[cacheKey] = schema;
            })
            .addCase(saveSchema.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearSchemaError, setFields } = uiSchemaSlice.actions;
export default uiSchemaSlice.reducer;
