import { axiosInstance } from "./apiConnector";
import { Task } from "@/lib/taskdata";

export const taskAPI = {
    // Get All Tasks with Pagination & Filtering
    getAllTasks: async (params?: { 
        page?: number; 
        limit?: number; 
        startDate?: string; 
        endDate?: string; 
        type?: string;
        client?: string;
        assignedTo?: string;
        status?: string;
        search?: string;
    }): Promise<{ data: Task[], total: number, calendarData: any, monthCount: number }> => {
        const response = await axiosInstance.get(`/api/tasks/get-tasks`, { params });
        const mappedData = response.data.data.map((task: any) => {
            let assigneeName = "Unassigned";
            if (task.assignedTo) {
                assigneeName = typeof task.assignedTo === "object" ? (task.assignedTo.name || "Unknown User") : "Unknown User";
            }
            return {
                ...task,
                id: task._id,
                assigneeName,
                clientName: task.client?.businessName || (task.client ? "Client" : undefined)
            };
        });
        return {
            ...response.data,
            data: mappedData
        };
    },

    // Get Tasks by Team Member
    getTasksByTeamMember: async (teamMemberId: string): Promise<Task[]> => {
        const response = await axiosInstance.get(`/api/tasks/team-member/${teamMemberId}`);
        return response.data.data.map((task: any) => ({
            ...task,
            id: task._id,
            assigneeName: task.assignedTo?.name || "Unknown",
            clientName: task.client?.name || (task.client ? "Client" : undefined)
        }));
    },

    // Create Task
    createTask: async (taskData: Partial<Task>): Promise<Task> => {
        const response = await axiosInstance.post(`/api/tasks/create-task`, taskData);
        return response.data.data;
    },

    // Update Generic Task Details
    updateTask: async (_id: string, updates: Partial<Task>): Promise<Task> => {
        const response = await axiosInstance.put(`/api/tasks/update-task/${_id}`, updates);
        return response.data.data;
    },

    // Update Status Only (Keeping separate as requested)
    updateTaskStatus: async (id: string, status: string, note?: string): Promise<Task> => {
        const response = await axiosInstance.put(`/api/tasks/update-status/${id}`, { status, note });
        return response.data.data;
    },

    // Delete Task
    deleteTask: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/api/tasks/delete-task/${id}`);
    }
};