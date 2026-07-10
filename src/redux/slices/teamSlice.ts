import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { teamAPI } from "../../services/teamService";
import { Team, TeamResponse, TeamsResponse } from "@/lib/teamdata";
import { get } from "http";

// --- THUNKS ---

export const fetchTeam = createAsyncThunk("team/fetchAll", async (_, { rejectWithValue }) => {
    try {
        return await teamAPI.getAllTeam();
    } catch (err: any) {
        return rejectWithValue("Failed to fetch team data");
    }
});

export const createTeamMember = createAsyncThunk(
    "team/create",
    async (data: any, { rejectWithValue }) => {
        try {
            return await teamAPI.createTeamMember(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to create team member");
        }
    }
);

// export const updateTeamMember = createAsyncThunk(
//     "team/update",
//     async ({ id, data }: { id: string; data: Partial<Team> }, { rejectWithValue }) => {
//         try {
//             console.log(id, data, "id and data to update----------------")
//             return await teamAPI.updateTeamMember(id, data);
//         } catch (err: any) {
//             return rejectWithValue("Failed to update team member");
//         }
//     }
// );
export const updateTeamMember = createAsyncThunk(
    "team/updateTeamMember",
    async ({ id, userId, data }: { id: string; userId: string; data: Partial<Team> | FormData }, { rejectWithValue }) => {
        try {
            console.log(id, userId, data, "id and data to update----------------")
            return await teamAPI.updateTeamMember(id, userId, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to update team member");
        }
    }
);

export const deleteTeamMember = createAsyncThunk(
    "team/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            console.log(id, "id to delete----------------")
            await teamAPI.deleteTeamMember(id);
            return id;
        } catch (err: any) {
            return rejectWithValue("Failed to delete team member");
        }
    }
);

export const fetchTeamById = createAsyncThunk("team/fetchById", async (id: string, { rejectWithValue }) => {
    try {
        return await teamAPI.getTeamById(id);
    } catch (err: any) {
        return rejectWithValue("Failed to fetch team data");
    }
});

export const resetTeamPassword = createAsyncThunk(
    "team/reset-password",
    async ({ id, password }: { id: string; password: string }, { rejectWithValue }) => {
        try {
            console.log(id, "id to reset password----------------")
            return await teamAPI.resetTeamPassword(id, password);
        } catch (err: any) {
            return rejectWithValue("Failed to reset password");
        }
    }
);

// --- SLICE ---

interface TeamState {
    members: Team[];
    myProfile: Team | null;
    selectedMember: Team | null;
    message: string;
    isLoading: boolean;
    error: string | null;
}

const initialState: TeamState = {
    members: [],
    myProfile: null,
    selectedMember: null,
    message: "",
    isLoading: false,
    error: null,
};

const teamSlice = createSlice({
    name: "team",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchTeam.pending, (state) => { state.isLoading = true; })
            .addCase(fetchTeam.fulfilled, (state, action) => {
                console.log(action.payload, "team slice getteam")
                state.isLoading = false;
                state.members = action.payload.data;
                state.message = action.payload.message;
            })
            .addCase(fetchTeam.rejected, (state, action) => {
                console.log(action.payload, "team slice getteam")
                state.isLoading = false;
                state.error = action.payload as string;
            })


            // Create
            .addCase(createTeamMember.pending, (state) => { state.isLoading = true; })
            .addCase(createTeamMember.fulfilled, (state, action) => {
                state.isLoading = false;
                console.log(action.payload, "team slice createteam")
                state.message = action.payload.message;
                state.members.push(action.payload.data);
            })
            .addCase(createTeamMember.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Update
            .addCase(updateTeamMember.pending, (state) => { state.isLoading = true; })
            .addCase(updateTeamMember.fulfilled, (state, action) => {
                state.isLoading = false;
                console.log(action.payload, "team slice updateteam")
                state.message = action.payload.message;
                const index = state.members.findIndex((m) => m._id === action.payload.data._id);
                if (index !== -1) state.members[index] = action.payload.data;
            })
            .addCase(updateTeamMember.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Delete
            .addCase(deleteTeamMember.pending, (state) => { state.isLoading = true; })
            .addCase(deleteTeamMember.fulfilled, (state, action) => {
                state.isLoading = false;
                state.members = state.members.filter((m) => m._id !== action.payload);
            })
            .addCase(deleteTeamMember.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch by ID
            .addCase(fetchTeamById.pending, (state) => { state.isLoading = true; })
            .addCase(fetchTeamById.fulfilled, (state, action) => {
                console.log(action.payload, "team slice getteam by id")
                state.isLoading = false;
                const index = state.members.findIndex((m) => m._id === action.payload.data._id);
                if (index !== -1) {
                    state.members[index] = action.payload.data;
                } else {
                    state.members.push(action.payload.data);
                }
                state.selectedMember = action.payload.data;
                state.message = action.payload.message;
            })
            .addCase(fetchTeamById.rejected, (state, action) => {
                console.log(action.payload, "team slice getteam by id")
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Reset Password
            // Reset Password
            .addCase(resetTeamPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })

            .addCase(resetTeamPassword.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action.payload.message; // ✅ ONLY message
            })

            .addCase(resetTeamPassword.rejected, (state, action) => {
                state.isLoading = false;
                console.log(action.payload, "team slice resetpassword")
                state.error = (action.payload as string) || "Failed to reset password";
            });

    },
});

export default teamSlice.reducer;