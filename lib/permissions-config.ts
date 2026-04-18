export const MODULES = [
    {
        id: "catalog",
        label: "Catalog Module",
        icon: "Package", // Lucide icon name
        permissions: [
            { key: "catalog.view", label: "View Packages & Services", desc: "Can view product list and details" },
            { key: "catalog.manage", label: "Manage Packages & Services", desc: "Create, edit, and archive services" },
        ]
    },
    {
        id: "clients",
        label: "Clients (CRM)",
        icon: "Users",
        permissions: [
            { key: "client.view", label: "View Clients", desc: "Access client directory" },
            { key: "client.create", label: "Onboard Clients", desc: "Add new clients to the system" },
            { key: "client.edit", label: "Edit Client Data", desc: "Modify contact info and notes" },
            { key: "client.assign_team", label: "Assign Team", desc: "Link staff to clients" },
        ]
    },
    {
        id: "subscriptions",
        label: "Subscriptions",
        icon: "CreditCard",
        permissions: [
            { key: "subscription.view", label: "View Plans", desc: "See active client subscriptions" },
            { key: "subscription.create", label: "Assign Packages", desc: "Create new active plans" },
            { key: "subscription.manage", label: "Manage Billing", desc: "Renew or cancel plans" },
        ]
    },
    {
        id: "tasks",
        label: "Task Management",
        icon: "CheckSquare",
        permissions: [
            { key: "task.view", label: "View Own Tasks", desc: "See tasks assigned to me" },
            { key: "task.view_all", label: "View All Tasks", desc: "Manager view of all production" },
            { key: "task.create", label: "Create Tasks", desc: "Manually create new tasks" },
        ]
    },
    {
        id: "system",
        label: "System",
        icon: "Settings",
        permissions: [
            { key: "access.manage", label: "Manage Access", desc: "Configure these role settings" },
        ]
    }
];

export const ROLES = [
    { key: "Superadmin", color: "bg-red-500", label: "Superadmin" },
    { key: "Admin", color: "bg-blue-500", label: "Admin" },
    { key: "Team", color: "bg-slate-500", label: "Team" },
    { key: "Client", color: "bg-green-500", label: "Client" },
];