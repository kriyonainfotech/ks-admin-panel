import { AppSidebar } from "@/components/app-sidebar"
import PrivateRoute from "@/components/auth/PrivateRoute"
import { SuperAdminHeader } from "@/components/SuperAdminHeader"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            {/* 1. The Sidebar (Left) */}
            <AppSidebar />

            {/* 2. The Main Content Area (Right) */}
            <SidebarInset>
                <PrivateRoute roles={["Admin", "Superadmin"]}>
                    <SuperAdminHeader />
                    <div className="flex flex-1 flex-col gap-4 p-6 pt-4 overflow-auto">
                        {children}
                    </div>
                </PrivateRoute>
            </SidebarInset>
        </SidebarProvider>
    )
}
