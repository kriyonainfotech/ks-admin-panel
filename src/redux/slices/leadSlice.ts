import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { leadAPI } from "@/src/services/leadService";
import { Lead } from "@/lib/leadData";

// Update to accept companyId
export const fetchLeads = createAsyncThunk("leads/fetchAll", async (companyId?: string) => {
    let url = "/api/leads/view"; // Start with base URL from service default
    if (companyId && companyId !== "all") {
        url = `/api/leads/view?company=${companyId}`;
    }
    const response = await leadAPI.getAll(url);
    return response;
});
export const createLead = createAsyncThunk("leads/create", async (data: any) => await leadAPI.create(data));

export const updateLead = createAsyncThunk("leads/update", async ({ id, data }: { id: string, data: any }) => await leadAPI.update(id, data));
export const deleteLead = createAsyncThunk("leads/delete", async (id: string) => { await leadAPI.delete(id); return id; });

// Configs
export const fetchLeadConfigs = createAsyncThunk("leads/fetchConfigs", async () => await leadAPI.getConfigs());
export const addLeadConfigOption = createAsyncThunk(
    "leads/addConfigOption",
    async ({ name, label }: { name: string, label: string }) => {
        const value = label.toUpperCase().replace(/\s+/g, "_");
        return await leadAPI.addConfigOption(name, label, value);
    }
);
export const deleteLeadConfigOption = createAsyncThunk(
    "leads/deleteConfigOption",
    async ({ name, optionId }: { name: string, optionId: string }) => {
        return await leadAPI.deleteConfigOption(name, optionId);
    }
);

interface LeadState {
    leads: Lead[];
    configs: any[];
    isLoading: boolean;
}

const leadSlice = createSlice({
    name: "leads",
    initialState: {
        leads: [] as Lead[],
        configs: [] as any[],
        isLoading: false
    } as LeadState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Leads
            .addCase(fetchLeads.pending, (state) => { state.isLoading = true; })
            .addCase(fetchLeads.fulfilled, (state, action) => { state.isLoading = false; state.leads = action.payload; })
            .addCase(fetchLeads.rejected, (state) => { state.isLoading = false; })

            .addCase(createLead.pending, (state) => { state.isLoading = true; })
            .addCase(createLead.fulfilled, (state, action) => {
                state.isLoading = false;
                state.leads.unshift(action.payload);
            })
            .addCase(createLead.rejected, (state) => { state.isLoading = false; })

            .addCase(updateLead.pending, (state) => { state.isLoading = true; })
            .addCase(updateLead.fulfilled, (state, action) => {
                state.isLoading = false;
                const idx = state.leads.findIndex(l => l.id === action.payload.id);
                if (idx !== -1) state.leads[idx] = action.payload;
            })
            .addCase(updateLead.rejected, (state) => { state.isLoading = false; })

            .addCase(deleteLead.pending, (state) => { state.isLoading = true; })
            .addCase(deleteLead.fulfilled, (state, action) => {
                state.isLoading = false;
                state.leads = state.leads.filter(l => l.id !== action.payload);
            })
            .addCase(deleteLead.rejected, (state) => { state.isLoading = false; })
            // Configs
            .addCase(fetchLeadConfigs.fulfilled, (state, action) => {
                state.configs = action.payload;
            })
            .addCase(addLeadConfigOption.fulfilled, (state, action) => {
                const name = action.payload.name;
                const idx = state.configs.findIndex(c => c.name === name);
                if (idx !== -1) {
                    state.configs[idx] = action.payload;
                } else {
                    state.configs.push(action.payload);
                }
            })
            .addCase(deleteLeadConfigOption.fulfilled, (state, action) => {
                const name = action.payload.name;
                const idx = state.configs.findIndex(c => c.name === name);
                if (idx !== -1) {
                    state.configs[idx] = action.payload;
                }
            });
    }
});
export default leadSlice.reducer;