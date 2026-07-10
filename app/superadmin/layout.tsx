import { AppSidebar } from "@/components/app-sidebar" // The file we made earlier
import PrivateRoute from "@/components/auth/PrivateRoute"
import { SuperAdminHeader } from "@/components/SuperAdminHeader"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            {/* 1. The Sidebar (Left) */}
            <AppSidebar />

            {/* 2. The Main Content Area (Right) */}
            <SidebarInset>
                <PrivateRoute roles={["Superadmin", "Admin"]}>
                    {/* Optional Header Row */}
                    <SuperAdminHeader />
                    {/* The Page Content (e.g. Dashboard, Users, Leads) */}
                    <div className="p-6 pt-6">
                        {children}
                    </div>
                </PrivateRoute>
            </SidebarInset>
        </SidebarProvider>
    )
}