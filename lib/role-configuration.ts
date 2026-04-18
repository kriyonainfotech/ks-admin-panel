
export interface DashboardTab {
    id: string;
    label: string;
    statuses: string[];
    filterStatus: string[];
    filterCategory?: string;
    showPostingDate?: boolean;
    excludeTasksWithPostingDate?: boolean; // Marketing Ads: strictly exclude tasks that have a postingDate
}

export interface RoleConfig {
    label: string; // Human readable role name
    dashboard: {
        tabs: DashboardTab[];
    };
    form: {
        dueDateLabel: string;
        showPostingDate: boolean;
        postingDateLabel?: string;
    }
}

export const ROLE_CONFIG: { [key: string]: RoleConfig } = {
    design: {
        label: "Graphic Designer",
        dashboard: {
            tabs: [
                {
                    id: 'design',
                    label: 'Content Design',
                    statuses: ['Design', 'Approved'],
                    filterStatus: ['Design', 'Approved', 'Pending'],
                    showPostingDate: false
                },
                {
                    id: 'posting',
                    label: 'Posting',
                    statuses: ['Done'],
                    filterStatus: ['Done'],
                    showPostingDate: true
                }
            ]
        },
        form: {
            dueDateLabel: "Design Date",
            showPostingDate: true,
            postingDateLabel: "Scheduled Posting Date"
        }
    },
    video: {
        label: "Video Editor",
        dashboard: {
            tabs: [
                {
                    id: 'editing',
                    label: 'Video Editing',
                    statuses: ['Edit', 'Approved'],
                    filterStatus: ['Edit', 'Approved', 'Pending'],
                    showPostingDate: false
                },
                {
                    id: 'posting',
                    label: 'Posting',
                    statuses: ['Done'],
                    filterStatus: ['Done'],
                    showPostingDate: true
                }
            ]
        },
        form: {
            dueDateLabel: "Editing Date",
            showPostingDate: true,
            postingDateLabel: "Scheduled Posting Date"
        }
    },
    marketing: {
        label: "Marketing",
        dashboard: {
            tabs: [
                {
                    id: 'ads',
                    label: 'Ads',
                    statuses: ['Done'],
                    filterStatus: ['Done', 'Pending'],
                    showPostingDate: false,
                    excludeTasksWithPostingDate: true
                },
                {
                    id: 'reports',
                    label: 'Report Share',
                    statuses: ['Done'],
                    filterStatus: ['Done', 'Pending'],
                    showPostingDate: true
                }
            ]
        },
        form: {
            dueDateLabel: "Task Date",
            showPostingDate: true,
            postingDateLabel: "Report Sharing Date (Optional)"
        }
    },
    // Default fallback
    default: {
        label: "Team Member",
        dashboard: {
            tabs: [
                {
                    id: 'all',
                    label: 'All Tasks',
                    statuses: [],
                    filterStatus: [],
                    showPostingDate: false
                }
            ]
        },
        form: {
            dueDateLabel: "Due Date",
            showPostingDate: true
        }
    }
};
