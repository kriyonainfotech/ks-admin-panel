"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    Briefcase,
    Store,
    Settings,
    LogOut,
    FunnelPlus, HandCoins,
    NotebookPen,
    Command,
    Wallet,
    FileText,
    User,
    Building2,
    QrCode
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/src/context/AuthContext"
import Image from "next/image";
import { CompanySwitcher } from "./CompanySwitcher";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// --- Menu Configurations ---

const MENU_ITEMS_SUPERADMIN = [
    { title: "Dashboard", url: "/superadmin", icon: LayoutDashboard },
    { title: "SOP", url: "/superadmin/sop", icon: FileText },
    { title: "RULES", url: "/superadmin/rules", icon: ShieldCheck },
    { title: "My SOP & Rules", url: "/superadmin/my-sops-rules", icon: FileText },
    { title: "Admin Management", url: "/superadmin/admin", icon: ShieldCheck },
    // { title: "Access Control", url: "/superadmin/access", icon: ShieldCheck },
    { title: "Team Management", url: "/superadmin/team", icon: Briefcase },
    { title: "Packages & Services", url: "/superadmin/packages-services", icon: Store },
    { title: "Client Management", url: "/superadmin/client", icon: Store },
    { title: "Assign Packages", url: "/superadmin/assign-packages", icon: Store },
    { title: "Schedule Management", url: "/superadmin/schedule", icon: LayoutDashboard },
    { title: "Tasks Management", url: "/superadmin/tasks", icon: NotebookPen },
    { title: "Leads Management", url: "/superadmin/leads", icon: FunnelPlus },
    // { title: "All Users", url: "/superadmin/users", icon: Users },
    { title: "Attendance", url: "/superadmin/attendance", icon: QrCode },
    { title: "Payroll & Salaries", url: "/superadmin/payroll", icon: Wallet },
    { title: "Payments & Finances", url: "/superadmin/payments", icon: HandCoins },
    // { title: "Companies", url: "/superadmin/companies", icon: Building2 }, // NEW
    // { title: "Developer Settings", url: "/superadmin/", icon: Settings },
]

const MENU_ITEMS_ADMIN = [
    { title: "Dashboard", url: "/superadmin/admin", icon: LayoutDashboard },
    { title: "My SOP", url: "/team/sop", icon: FileText },
    { title: "My Rules", url: "/team/rules", icon: ShieldCheck },
    { title: "Team Management", url: "/superadmin/team", icon: Briefcase }, // Admin matches Team? Or manages Team? Assuming manage.
    { title: "Client Management", url: "/superadmin/client", icon: Store },
    { title: "Tasks Management", url: "/superadmin/tasks", icon: NotebookPen },
    { title: "Schedule Management", url: "/superadmin/schedule", icon: LayoutDashboard },
    { title: "Leads Management", url: "/superadmin/leads", icon: FunnelPlus },
    { title: "Packages & Services", url: "/superadmin/packages-services", icon: Store },
    { title: "Attendance", url: "/superadmin/attendance", icon: QrCode },
    { title: "Settings", url: "/superadmin/settings", icon: Settings },
]

const MENU_ITEMS_TEAM = [
    { title: "Dashboard", url: "/team", icon: LayoutDashboard },
    { title: "My SOP", url: "/team/sop", icon: FileText },
    { title: "My Tasks", url: "/team/mytasks", icon: NotebookPen },
    { title: "Clients", url: "/team/clients", icon: Store },
    { title: "Profile", url: "/team/profile", icon: User },
    { title: "My Rules", url: "/team/rules", icon: ShieldCheck },
]

export function AppSidebar() {
    const { user, logout, isLoading } = useAuth();
    const pathname = usePathname();
    const role = user?.role || "Guest";

    // Determine which menu to show
    let menuItems = MENU_ITEMS_TEAM; // Default safe fallback
    let roleLabel = "Team Member";

    if (isLoading) {
        roleLabel = "Loading...";
        menuItems = []; // Don't show any items while loading to prevent flickering
    } else if (role === "Superadmin") {
        menuItems = MENU_ITEMS_SUPERADMIN;
        roleLabel = "Superadmin";
    } else if (role === "Admin") {
        menuItems = MENU_ITEMS_ADMIN;
        roleLabel = "Administrator";
    } else if (role === "Team") {
        menuItems = MENU_ITEMS_TEAM;
        roleLabel = "Team";
    }

    return (
        <Sidebar variant="inset">
            {/* 1. Header: Brand / Logo */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={role === 'Superadmin' ? "/superadmin" : role === 'Admin' ? "/superadmin/admin" : "/team"}>
                                <div className="relative flex aspect-square size-10 items-center justify-center rounded-lg">
                                    <Image
                                        src="/logo.svg"
                                        alt="Logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-bold text-xl">Kriyona Studio</span>
                                    <span className="truncate text-md">{roleLabel} Panel</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

            </SidebarHeader>

            {/* 2. Content: Main Navigation */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => {
                                const isActive = pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.url}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={isActive}
                                            className={cn(
                                                "relative transition-all duration-200 ease-in-out py-3",
                                                isActive
                                                    ? "text-md bg-primary/20 hover:bg-primary/30 text-primary-foreground font-medium hover:bg-primary dark:bg-primary/20 dark:text-primary-foreground dark:hover:bg-primary/30"
                                                    : "text-md text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                                            )}
                                        >
                                            <Link href={item.url}>
                                                {isActive && (
                                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r-full bg-primary dark:bg-primary animate-in fade-in zoom-in-50 duration-300" />
                                                )}
                                                <item.icon
                                                    className={cn(
                                                        "size-4 shrink-0 transition-transform duration-200 text-xl",
                                                        isActive ? "text-primary dark:text-primary-foreground scale-110" : "group-hover:scale-110"
                                                    )}
                                                />
                                                <span className={cn(isActive && "font-semibold")}>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarSeparator />

            {/* 3. Footer: User Info + Logout */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <SidebarMenuButton
                                    className="text-white bg-red-500 hover:bg-red-600 dark:hover:bg-red-950/30 dark:text-red-400 py-3"
                                    tooltip="Logout"
                                >
                                    <LogOut className="size-4 shrink-0" />
                                    <span className="text-md font-semibold">Logout</span>
                                </SidebarMenuButton>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You will need to login again to access your account.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={logout} className="bg-red-500 hover:bg-red-600 text-white border-none">
                                        Logout
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}