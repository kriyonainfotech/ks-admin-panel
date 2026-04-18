
import api from "./api";

export interface FinancialStats {
    financials: {
        sales: number;
        collection: number;
        expense: number;
        outstanding: number;
        totalAvailableFunds: number;
    };
}

export interface TaskStats {
    tasks: {
        myTasks: number;
        partnerTasks: number;
        teamTasks: number;
        adminTasks: number;
    };
    superadminsList: {
        _id: string;
        name: string;
        email: string;
    }[];
    todayTasks: any[];
    allTeamTasks: any[];
    teamWorkload: {
        name: string;
        role: string;
        activeTasks: number;
    }[];
}

export interface UserStats {
    kpi: {
        totalClients: number;
        totalLeads: number;
        totalSuperadmin: number;
        totalAdmin: number;
        totalTeam: number;
    };
    clientGrowth: {
        name: string;
        total: number;
    }[];
}

export const getFinancialStats = async (): Promise<FinancialStats> => {
    const response = await api.get("/dashboard/stats/financials");
    return response.data;
};

export const getTaskStats = async (): Promise<TaskStats> => {
    const response = await api.get("/dashboard/stats/tasks");
    return response.data;
};

export const getUserStats = async (): Promise<UserStats> => {
    const response = await api.get("/dashboard/stats/users");
    return response.data;
};
