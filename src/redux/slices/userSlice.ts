import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userAPI } from "../../services/userService";
import { User } from "@/lib/userData";

export const fetchUsers = createAsyncThunk("users/fetchAll", async () => await userAPI.getAll());
export const createUser = createAsyncThunk("users/create", async (data: any) => await userAPI.create(data));
export const updateUser = createAsyncThunk("users/update", async ({ id, data }: { id: string, data: any }) => await userAPI.update(id, data));
export const deleteUser = createAsyncThunk("users/delete", async (id: string) => { await userAPI.delete(id); return id; });

const userSlice = createSlice({
    name: "users",
    initialState: { users: [] as User[], isLoading: false },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => { state.isLoading = true; })
            .addCase(fetchUsers.fulfilled, (state, action) => { state.isLoading = false; state.users = action.payload; })
            .addCase(createUser.fulfilled, (state, action) => { state.users.unshift(action.payload); })
            .addCase(updateUser.fulfilled, (state, action) => {
                const idx = state.users.findIndex(u => u.id === action.payload.id);
                if (idx !== -1) state.users[idx] = action.payload;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(u => u.id !== action.payload);
            });
    }
});
export default userSlice.reducer;