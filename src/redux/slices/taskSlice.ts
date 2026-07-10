import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { taskAPI } from "@/src/services/taskService";
import { Task } from "@/lib/taskdata";

// --- THUNKS ---

export const fetchTasks = createAsyncThunk("tasks/fetchAll", async (params: any = {}, { rejectWithValue }) => {
    try {
        return await taskAPI.getAllTasks(params);
    } catch (err: any) {
        return rejectWithValue("Failed to fetch tasks");
    }
});

export const fetchTasksByTeamMember = createAsyncThunk("tasks/fetchByTeamMember", async (teamMemberId: string, { rejectWithValue }) => {
    try {
        return await taskAPI.getTasksByTeamMember(teamMemberId);
    } catch (err: any) {
        return rejectWithValue("Failed to fetch tasks by team member");
    }
});

export const createTask = createAsyncThunk("tasks/create", async (data: any, { rejectWithValue }) => {
    try {
        console.log(data);
        return await taskAPI.createTask(data);
    } catch (err: any) {
        return rejectWithValue("Failed to create task");
    }
});

export const updateTask = createAsyncThunk(
    "tasks/update",
    async ({ _id, data }: { _id: string; data: Partial<Task> }, { rejectWithValue }) => {
        try {
            return await taskAPI.updateTask(_id, data);
        } catch (err: any) {
            return rejectWithValue("Failed to update task");
        }
    }
);

export const updateTaskStatus = createAsyncThunk(
    "tasks/updateStatus",
    async ({ id, status, note }: { id: string; status: string; note?: string }, { rejectWithValue }) => {
        try {
            return await taskAPI.updateTaskStatus(id, status, note);
        } catch (err: any) {
            return rejectWithValue("Failed to update task status");
        }
    }
);

export const deleteTask = createAsyncThunk("tasks/delete", async (id: string, { rejectWithValue }) => {
    try {
        await taskAPI.deleteTask(id);
        return id;
    } catch (err: any) {
        return rejectWithValue("Failed to delete task");
    }
});

// Lightweight thunk: only fetches calendarData for a given month, doesn't touch the task list
export const fetchCalendarData = createAsyncThunk("tasks/fetchCalendarData", async (params: any, { rejectWithValue }) => {
    try {
        const result = await taskAPI.getAllTasks({ ...params, limit: 1, page: 1 });
        return result.calendarData as Record<string, any>;
    } catch (err: any) {
        return rejectWithValue("Failed to fetch calendar data");
    }
});

// --- SLICE ---

interface TaskState {
    tasks: Task[];
    total: number;
    calendarData: Record<string, any>;
    monthCount: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: TaskState = {
    tasks: [],
    total: 0,
    calendarData: {},
    monthCount: 0,
    isLoading: false,
    error: null,
};

const taskSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        // Optional: If you want to clear tasks on logout
        clearTasks: (state) => {
            state.tasks = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchTasks.pending, (state) => { state.isLoading = true; })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.isLoading = false;
                state.tasks = action.payload.data;
                state.total = action.payload.total;
                // OVERWRITE calendar data so dots represent the CURRENT view (tab/filter)
                state.calendarData = action.payload.calendarData;
                state.monthCount = action.payload.monthCount;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch By Team Member
            .addCase(fetchTasksByTeamMember.pending, (state) => { state.isLoading = true; })
            .addCase(fetchTasksByTeamMember.fulfilled, (state, action) => {
                state.isLoading = false;
                state.tasks = action.payload;
            })
            .addCase(fetchTasksByTeamMember.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Create — re-fetch after save so only correct date-range tasks show
            .addCase(createTask.pending, (state) => { state.isLoading = true; })
            .addCase(createTask.fulfilled, (state) => {
                state.isLoading = false;
                // Do NOT optimistically unshift — the task may belong to a different date than the current filter
            })
            .addCase(createTask.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Update
            .addCase(updateTask.pending, (state) => { state.isLoading = true; })
            .addCase(updateTask.fulfilled, (state, action) => {
                state.isLoading = false;
                const updated = { ...action.payload, id: action.payload._id };
                const index = state.tasks.findIndex(t => t._id === updated._id || t.id === updated._id);
                if (index !== -1) {
                    state.tasks[index] = updated;
                }
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Update Status
            .addCase(updateTaskStatus.pending, (state) => { state.isLoading = true; })
            .addCase(updateTaskStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.tasks.findIndex(t => t._id === action.payload._id || t.id === action.payload._id);
                if (index !== -1) state.tasks[index] = { ...state.tasks[index], status: action.payload.status, completedAt: action.payload.completedAt };
            })
            .addCase(updateTaskStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Delete
            .addCase(deleteTask.pending, (state) => { state.isLoading = true; })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.isLoading = false;
                // Use _id (not id) — action.payload is the raw _id string from the API
                state.tasks = state.tasks.filter(t => t._id !== action.payload && t.id !== action.payload);
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Calendar Data only (silent — does not affect task list or isLoading)
            .addCase(fetchCalendarData.fulfilled, (state, action) => {
                state.calendarData = action.payload;
            });
    },
});

export const { clearTasks } = taskSlice.actions;
export default taskSlice.reducer;