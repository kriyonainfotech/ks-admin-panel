"use client";

import React from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AdminPage() {
    return (
        <AdminDashboard />
    );
}
