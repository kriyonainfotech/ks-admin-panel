
export interface DashboardTab {
    id: string;
    label: string;
    statuses: string[];
    filterStatus: string[];
    filterCategory?: string;
    // New simplified filter modes
    filterMode?: 'POSTING_ONLY' | 'EXCLUDE_POSTING' | 'DEFAULT';
}

export interface RoleConfig {
    label: string;
    matcher: (specialization: string) => boolean;
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
        matcher: (s) => /design|graphic|art/i.test(s),
        dashboard: {
            tabs: [
                {
                    id: 'design',
                    label: 'Content Design',
                    statuses: ['Design', 'Approved'],
                    filterStatus: ['Design', 'Approved', 'Pending'],
                    filterMode: 'DEFAULT'
                },
                {
                    id: 'posting',
                    label: 'Posting',
                    statuses: ['Done'],
                    filterStatus: ['Done'],
                    filterMode: 'POSTING_ONLY'
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
        matcher: (s) => /video|edit/i.test(s),
        dashboard: {
            tabs: [
                {
                    id: 'editing',
                    label: 'Video Editing',
                    statuses: ['Edit', 'Approved'],
                    filterStatus: ['Edit', 'Approved', 'Pending'],
                    filterMode: 'DEFAULT'
                },
                {
                    id: 'posting',
                    label: 'Posting',
                    statuses: ['Done'],
                    filterStatus: ['Done'],
                    filterMode: 'POSTING_ONLY'
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
        matcher: (s) => /marketing|market/i.test(s),
        dashboard: {
            tabs: [
                {
                    id: 'ads',
                    label: 'Ads',
                    statuses: ['Done'],
                    filterStatus: ['Done', 'Pending'],
                    filterMode: 'EXCLUDE_POSTING'
                },
                {
                    id: 'reports',
                    label: 'Report Share',
                    statuses: ['Done'],
                    filterStatus: ['Done', 'Pending'],
                    filterMode: 'POSTING_ONLY'
                }
            ]
        },
        form: {
            dueDateLabel: "Task Date",
            showPostingDate: true,
            postingDateLabel: "Report Sharing Date (Optional)"
        }
    },
    web: {
        label: "Web Developer",
        matcher: (s) => /web|dev|software/i.test(s),
        dashboard: {
            tabs: [
                {
                    id: 'development',
                    label: 'Development',
                    statuses: ['Developing', 'Review', 'Bug Fix', 'Approved'],
                    filterStatus: ['Developing', 'Review', 'Bug Fix', 'Approved', 'Pending'],
                    filterMode: 'DEFAULT'
                },
                {
                    id: 'deployment',
                    label: 'Live/Deployment',
                    statuses: ['Staging', 'Done'],
                    filterStatus: ['Staging', 'Done'],
                    filterMode: 'POSTING_ONLY'
                }
            ]
        },
        form: {
            dueDateLabel: "Development Date",
            showPostingDate: true,
            postingDateLabel: "Scheduled Deployment Date"
        }
    },

    // Default fallback
    default: {
        label: "Team Member",
        matcher: () => true,
        dashboard: {
            tabs: [
                {
                    id: 'all',
                    label: 'All Tasks',
                    statuses: [],
                    filterStatus: [],
                    filterMode: 'DEFAULT'
                }
            ]
        },
        form: {
            dueDateLabel: "Due Date",
            showPostingDate: true
        }
    }
};
