
export interface DashboardTab {
    id: string;
    label: string;
    statuses: string[]; // Options to SHOW in the dropdown
    filterStatus: string[]; // Options to FILTER the list by
    showPostingDate?: boolean; // Whether to show/sort by posting date
}

export interface RoleDashboardConfig {
    [key: string]: {
        tabs: DashboardTab[];
    };
}

export const ROLE_DASHBOARD_CONFIG: RoleDashboardConfig = {
    design: {
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
                statuses: ['Done'], // "Done" (or Posted)
                filterStatus: ['Done'],
                showPostingDate: true
            }
        ]
    },
    video: {
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
    marketing: {
        tabs: [
            {
                id: 'ads',
                label: 'Ads',
                statuses: ['Ads_Done'],
                filterStatus: ['Ads_Done', 'Done', 'Pending'],
                showPostingDate: false
            },
            {
                id: 'reports',
                label: 'Report Shares',
                statuses: ['Report_Shared'],
                filterStatus: ['Report_Shared', 'Done'], // Show done reports
                showPostingDate: true
            }
        ]
    }
};

export const DEFAULT_DASHBOARD_CONFIG = {
    tabs: [
        {
            id: 'all',
            label: 'All Tasks',
            statuses: [], // All
            filterStatus: [], // All
            showPostingDate: false
        }
    ]
};
