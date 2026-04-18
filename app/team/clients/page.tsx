"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchClients, getClientsByTeamMember } from "@/src/redux/slices/clientSlice";
import { useAuth } from "@/src/context/AuthContext";
import { DataTable } from "@/components/ui/data-table"; // Reusing your existing DataTable
import { getClientColumns } from "./components/client-columns";
import { Input } from "@/components/ui/input";
import { Search, Users, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeamClientsPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user } = useAuth();

    const { clients, isLoading } = useAppSelector((state) => state.clients);
    const [search, setSearch] = useState("");
    console.log(clients, 'clients')

    // 1. Fetch all data (Backend security should ideally filter this too)
    useEffect(() => {
        if (user?._id) {
            dispatch(getClientsByTeamMember(user._id));
        }
    }, [dispatch, user]);

    // 2. FILTER: Show ONLY clients assigned to this Team Member
    const myClients = useMemo(() => {
        if (!user || !clients.length) return [];

        // Match user ID in the client's assignedTeamIds array
        // Make sure your User ID matches the format stored in Client (string vs ObjectId)
        const userId = user._id || user.id;

        return clients.filter(client => {
            // Check assignment
            const isAssigned = client.assignedTeamIds?.includes(userId);

            // Apply Search
            const matchesSearch = client.businessName.toLowerCase().includes(search.toLowerCase()) ||
                client.name.toLowerCase().includes(search.toLowerCase());

            return isAssigned && matchesSearch;
        });
    }, [clients, user, search]);

    // 3. Handlers
    const handleViewTasks = (clientId: string) => {
        // Navigate to My Tasks pre-filtered for this client
        router.push(`/team/mytasks?clientId=${clientId}`);
    };

    const columns = useMemo(() => getClientColumns(handleViewTasks), []);

    return (
        <div className="h-full flex flex-col gap-6">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2"><h1 className="text-2xl font-bold tracking-tight mb-1">My Clients </h1><span className="text-muted-foreground">({myClients.length})</span>  </div>
                    <p className="text-muted-foreground">Manage the brands assigned to you.</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-4">
                {/* Search Bar */}
                <div className="flex items-center gap-2 max-w-sm bg-card border rounded-md px-3 h-10">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clients..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border-0 focus-visible:ring-0 px-0"
                    />
                </div>

                {/* The Table */}
                <div className="rounded-md border bg-card">
                    <DataTable
                        columns={columns}
                        data={myClients}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}