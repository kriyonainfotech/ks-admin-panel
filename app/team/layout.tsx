import { AppSidebar } from "@/components/app-sidebar"
import PrivateRoute from "@/components/auth/PrivateRoute"
import { SuperAdminHeader } from "@/components/SuperAdminHeader"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function TeamLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            {/* 1. The Sidebar (Left) */}
            <AppSidebar />

            {/* 2. The Main Content Area (Right) */}
            <SidebarInset>
                <PrivateRoute roles={["Team Member", "Team", "Admin", "Superadmin"]}>
                    {/* Header Row */}
                    <SuperAdminHeader />
                    {/* The Page Content */}
                    <div className="p-4 md:p-8 space-y-6">
                        {children}
                    </div>
                </PrivateRoute>
            </SidebarInset>
        </SidebarProvider>
    )
}
