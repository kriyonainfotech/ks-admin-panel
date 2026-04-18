"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender
} from "@tanstack/react-table";

// --- REDUX ---
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchClients, clearClientMessage } from "@/src/redux/slices/clientSlice";
import { fetchTeam } from "@/src/redux/slices/teamSlice";

// --- COMPONENTS ---
import { getClientColumns } from "./components/column";
import { ClientViewSheet } from "./components/ClientViewSheet";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { Client } from "@/lib/clientdata";
import { DataHandler } from "@/components/DataHandler";
import { AssignedPackagesModal } from "@/components/subscriptions/AssignedPackagesModal";
// We can reuse the view sheet from superadmin if it's in a shared location or just copy it
// For now, let's see where ClientViewSheet is located. 
// If it's only in superadmin, I might need to create a local version or move it.
// Assuming we might need a local one for simplicity or it might already be shared.
// Superadmin path: superadmin/app/superadmin/client/components/ClientViewSheet.tsx
// Let's create a simplified view sheet or just wait.

export default function AdminClientsPage() {
    const dispatch = useAppDispatch();
    const { clients, isLoading } = useAppSelector((state) => state.clients);
    const { members: teamMembers } = useAppSelector((state) => state.team);

    const [filter, setFilter] = useState("");
    const [currentClient, setCurrentClient] = useState<Client | null>(null);
    const [viewSheetOpen, setViewSheetOpen] = useState(false);
    const [viewPackagesOpen, setViewPackagesOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchClients());
        dispatch(fetchTeam());
    }, [dispatch]);

    const handleView = (client: Client) => {
        setCurrentClient(client);
        setViewSheetOpen(true);
    };

    const handleViewPackages = (client: Client) => {
        setCurrentClient(client);
        setViewPackagesOpen(true);
    };

    const columns = useMemo(() => getClientColumns({
        onView: handleView,
        onViewPackages: handleViewPackages,
        teamMembers: teamMembers
    }), [teamMembers]);

    const table = useReactTable({
        data: clients,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter: filter },
        onGlobalFilterChange: setFilter,
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Assigned Clients</h1>
                    <p className="text-xs text-muted-foreground">View and manage clients assigned specifically to you.</p>
                </div>
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search assigned clients..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-9 bg-card w-full"
                    />
                </div>
            </div>

            <div className="rounded-xl border bg-card/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="font-semibold">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            <DataHandler
                                loading={isLoading && clients.length === 0}
                                isEmpty={!isLoading && table.getRowModel().rows.length === 0}
                                variant="table-row"
                                colSpan={columns.length}
                                emptyText="No clients assigned to you yet."
                            >
                                {table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </DataHandler>
                        </TableBody>
                    </Table>
                </div>
            </div>

            {viewSheetOpen && (
                <ClientViewSheet
                    open={viewSheetOpen}
                    onOpenChange={setViewSheetOpen}
                    client={currentClient}
                    teamMembers={teamMembers}
                />
            )}

            {viewPackagesOpen && currentClient && (
                <AssignedPackagesModal
                    isOpen={viewPackagesOpen}
                    onClose={() => setViewPackagesOpen(false)}
                    clientId={currentClient.id}
                    clientName={currentClient.businessName}
                />
            )}
        </div>
    );
}
