export type TaskType = "Personal" | "Team" | "Admin" | "Superadmin";
export type TaskStatus = "Pending" | "In Progress" | "Done" | "Approved" | "Posted" | "Overdue";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";
export type TaskCategory = "Posting" | "Shooting" | "Ads" | "Report" | "design" | "video" | "web" | "Other";

export interface Task {
    _id: string; // Backend ID
    id?: string; // Optional frontend ID helper if needed
    title: string;
    description: string;
    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;
    taskCategory: TaskCategory;
    dueDate: string; // ISO Date String
    postingDate?: string; // ISO Date String

    // Assignee Logic (Populated)
    assignedTo: {
        _id: string;
        name: string;
        email: string;
    } | string; // Can be object (populated) or string ID (unpopulated)
    assigneeName?: string; // Helper

    // Client Logic (Populated)
    client?: {
        _id: string;
        businessName: string;
    } | string;
    clientId?: string; // Helper
    clientName?: string; // Helper

    createdAt: string;
    completedAt?: string;
    createdBy?: string;
    customFields?: Record<string, any>;
    notificationTime?: string; // ISO Date String
}

export const initialTaskData: Task[] = []; // Empty default, will load from API