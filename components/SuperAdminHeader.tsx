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

export function SuperAdminHeader({ title }: { title?: string }) {

    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();

    // Map path to title
    const getPageTitle = (path: string) => {
        if (title) return title;
        
        const segments = path.split("/").filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        
        if (!lastSegment || lastSegment === "admin" || lastSegment === "superadmin") return "Dashboard";
        
        // Convert kkab-case to Title Case (e.g. tasks-management -> Tasks Management)
        return lastSegment
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    };

    const displayTitle = getPageTitle(pathname);

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
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">{displayTitle}</div>
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
                    <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg">
                        <DropdownMenuItem
                            onClick={() => router.push(user?.role === 'Team' ? "/team/profile" : "/admin/profile")}
                            className="cursor-pointer gap-2"
                        >
                            <User className="h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
