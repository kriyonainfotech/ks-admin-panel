export const PERMISSION_MODULES = [
    {
        id: "users",
        label: "Users & Teams",
        icon: "Users",
        permissions: [
            { key: "admin.manage", label: "Manage Admins", desc: "Create and edit company-level admins" },
            { key: "team.manage", label: "Manage Team", desc: "Recruit and manage staff members" },
            { key: "client.manage", label: "Manage Clients", desc: "Onboard and manage client profiles" },
        ]
    },
    {
        id: "attendance",
        label: "Attendance",
        icon: "Clock",
        permissions: [
            { key: "attendance.view", label: "View Attendance", desc: "Access daily presence logs" },
            { key: "attendance.manage", label: "Edit Attendance", desc: "Correct logs and manage holidays" },
        ]
    },
    {
        id: "payroll",
        label: "Payroll",
        icon: "Wallet",
        permissions: [
            { key: "payroll.view", label: "View Payroll", desc: "See salary details and wallet stats" },
            { key: "payroll.manage", label: "Process Payroll", desc: "Generate salaries and record payouts" },
        ]
    },
    {
        id: "tasks",
        label: "Task Management",
        icon: "CheckSquare",
        permissions: [
            { key: "task.view", label: "View Own Tasks", desc: "Access personal task list" },
            { key: "task.view_all", label: "View All Tasks", desc: "Company-wide production overview" },
            { key: "task.manage", label: "Manage Tasks", desc: "Create, edit, and assign tasks" },
        ]
    },
    {
        id: "crm",
        label: "Services & CRM",
        icon: "Briefcase",
        permissions: [
            { key: "service.manage", label: "Manage Services", desc: "Create and edit service packages" },
            { key: "lead.manage", label: "Manage Leads", desc: "Track and convert business leads" },
            { key: "client.view", label: "View CRM", desc: "Access the client database" },
        ]
    },
    {
        id: "payments",
        label: "Payments",
        icon: "CreditCard",
        permissions: [
            { key: "payment.view", label: "View Payments", desc: "See sales and collection history" },
            { key: "payment.manage", label: "Record Payments", desc: "Enter new sales or collections" },
        ]
    },
    {
        id: "workflow",
        label: "Workflow",
        icon: "Calendar",
        permissions: [
            { key: "schedule.view", label: "View Schedules", desc: "See project timelines" },
            { key: "schedule.manage", label: "Manage Schedules", desc: "Create and edit project schedules" },
            { key: "sop.view", label: "View SOPs", desc: "Read internal guidelines" },
            { key: "sop.manage", label: "Manage SOPs", desc: "Create and edit SOP points" },
        ]
    },
    {
        id: "system",
        label: "System",
        icon: "Settings",
        permissions: [
            { key: "notification.manage", label: "Send Notifications", desc: "Send bulk alerts to users" },
            { key: "company.edit", label: "Edit Company", desc: "Update business profile details" },
            { key: "access.control", label: "Access Control", desc: "Grant/revoke user permissions" },
        ]
    }
];

export const ROLES = [
    { key: "Superadmin", color: "bg-red-500", label: "Superadmin" },
    { key: "Admin", color: "bg-blue-500", label: "Admin" },
    { key: "Team", color: "bg-slate-500", label: "Team" },
    { key: "Client", color: "bg-green-500", label: "Client" },
];