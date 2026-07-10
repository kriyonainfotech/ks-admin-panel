// app/superadmin/components/SuperAdminHeader.tsx
"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/src/context/AuthContext"
import { useRouter, usePathname } from "next/navigation"
import { NotificationBell } from "./NotificationBell"
import { CompanySwitcher } from "./CompanySwitcher"

export function SuperAdminHeader({ title }: { title?: string }) {

    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();

    const getDynamicTitle = (path: string) => {
        if (title) return title;
        if (path === "/superadmin") return "Dashboard";
        if (path === "/team") return "Team Dashboard";

        // Custom Title Mappings
        const mapping: Record<string, string> = {
            "/superadmin/users": "Users Management",
            "/superadmin/leads": "Leads Management",
            "/superadmin/tasks": "Task Management",
            "/superadmin/team": "Team Management",
            "/superadmin/attendance": "Attendance Management",
            "/superadmin/packages-services": "Package & Services",
            "/superadmin/assign-packages": "Assign Package & Services",
            "/superadmin/payroll": "Salary Management",
            "/superadmin/payments": "Payment Management",
            "/superadmin/profile": "Profile",
            "/superadmin/settings": "Settings",
            "/superadmin/sop": "SOP Management",
            "/superadmin/sop-view": "SOP",
            "/superadmin/schedule": "Schedule Management",
            "/superadmin/client": "Client Management",
            "/superadmin/companies": "Companies Management",
            "/superadmin/access": "Access Control",
            "/superadmin/admin": "Admin Management",
            "/superadmin/ui-builder": "UI Builder",
            "/superadmin/rules": "Rules Management",
            "/superadmin/rules-view": "Rules & Regulations",
            "/superadmin/notifications": "Notifications",
        };

        if (mapping[path]) return mapping[path];

        // Default: take the last piece and capitalize
        const parts = path.split("/").filter(Boolean);
        const last = parts[parts.length - 1];
        if (!last || last === "superadmin") return "Overview";

        return last
            .split("-")
            .map(p => p.charAt(0).toUpperCase() + p.slice(1))
            .join(" ");
    };

    const displayTitle = getDynamicTitle(pathname);

    const getInitials = (name?: string) => {
        if (!name) return "U";
        const parts = name.trim().split(" ");
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : parts[0][0].toUpperCase();
    };

    return (
        <header className="flex items-center justify-between h-16 px-4 border-b bg-white dark:bg-gray-800">
            {/* Left: Hamburger + Title */}
            <div className="flex items-center gap-4">
                <SidebarTrigger className="text-gray-600 dark:text-gray-200" />
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200 tracking-tight">
                    {displayTitle}
                </div>
            </div>

            {/* Right: Notifications + Profile Avatar */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <NotificationBell />

                {/* Profile Avatar Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2">
                            <Avatar className="w-9 h-9 cursor-pointer transition-transform hover:scale-105" role={user?.role}>
                                <AvatarImage src={user?.profilePic?.url || user?.avatarUrl || ""} alt={user?.name || "User"} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                    {getInitials(user?.name)}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-0 overflow-hidden border-slate-200">
                        {/* Company Switcher Area */}
                        <div className="bg-slate-50/80 border-b outline-none">
                            <CompanySwitcher />
                        </div>

                        <DropdownMenuItem
                            onClick={() => router.push("/superadmin/profile")}
                            className="cursor-pointer gap-2 m-1 rounded-lg font-medium"
                        >
                            <User className="h-4 w-4" />
                            My Profile
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
