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
import { fetchClients, createClient, updateClient, deleteClient, clearClientMessage, resetClientPassword } from "@/src/redux/slices/clientSlice";
import { fetchTeam } from "@/src/redux/slices/teamSlice";
import { fetchAdmins } from "@/src/redux/slices/adminSlice";
import { fetchOptionSets } from "@/src/redux/slices/optionSetSlice";
import { toast } from "sonner";

// --- COMPONENTS ---
import { getClientColumns } from "./components/column";
import { ClientDialog } from "./components/ClientDialog";
import { ClientViewSheet } from "./components/ClientViewSheet";
import { ClientSettingsDialog } from "./components/ClientSettingsDialog";
import { DeleteClientModal } from "./components/DeleteClientModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Settings, Users, Activity, UserPlus } from "lucide-react";
import { Client } from "@/lib/clientdata";
import { ResetPasswordDialog } from "@/components/ResetPasswordDialog";
import { DataHandler } from "@/components/DataHandler";
import { AssignedPackagesModal } from "@/components/subscriptions/AssignedPackagesModal";

type ClientFormData = Partial<Client>;
type PasswordResetData = { password: string };

export default function ClientsPage() {
    const dispatch = useAppDispatch();
    const { clients, isLoading, message, error } = useAppSelector((state) => state.clients);
    const { members: teamMembers } = useAppSelector((state) => state.team);
    const { admins } = useAppSelector((state) => state.admin);
    console.log(clients, 'clients');
    // --- LOCAL STATE ---
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewSheetOpen, setViewSheetOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState<Client | null>(null);
    const [filter, setFilter] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [passwordClientId, setpasswordClientId] = useState<string | null>(null);
    const [viewPackagesOpen, setViewPackagesOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [statusTab, setStatusTab] = useState("all");

    useEffect(() => {
        if (error) toast.error(error);
        if (message) toast.success(message);

        dispatch(clearClientMessage());
    }, [dispatch, error, message]);


    // --- INITIAL DATA FETCH ---
    useEffect(() => {
        dispatch(fetchClients());
        dispatch(fetchTeam()); // Required for the avatars in the table
        dispatch(fetchAdmins()); // Required for assignments
        dispatch(fetchOptionSets()); // Fetch industries and other options
    }, [dispatch]);

    // --- HANDLERS ---
    const handleSave = async (data: ClientFormData) => {
        console.log("Save data", currentClient);
        try {
            if (currentClient?.id) {
                await dispatch(updateClient({ id: currentClient.id, data })).unwrap();
            } else {
                await dispatch(createClient(data)).unwrap();
            }
            setDialogOpen(false);
        } catch (error) {
            console.error("Save failed", error);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteClientId(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async (id: string, options: Record<string, boolean>) => {
        setIsDeleting(true);
        try {
            await dispatch(deleteClient({ id, options })).unwrap();
            setDeleteModalOpen(false);
            setDeleteClientId(null);
        } catch {
            toast.error("Failed to remove client");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (client: Client) => {
        setCurrentClient(client);
        setDialogOpen(true);
    };

    const handleView = (client: Client) => {
        setCurrentClient(client);
        setViewSheetOpen(true);
    };

    const handleCreate = () => {
        setCurrentClient(null);
        setDialogOpen(true);
    };


    const handlePasswordResetClick = (id: string) => {
        console.log(id, '----------------------------------');
        setpasswordClientId(id);
        setPasswordDialogOpen(true);
    };

    const handleViewPackages = (client: Client) => {
        setCurrentClient(client);
        setViewPackagesOpen(true);
    };

    // 3. Handler to Submit Form
    const handlePasswordSubmit = async (id: string, data: PasswordResetData) => {
        setPasswordDialogOpen(false);
        await dispatch(resetClientPassword({ id, password: data.password }));
    };

    // --- TABLE CONFIG ---
    // Memoize columns to prevent re-renders when local state changes
    const columns = useMemo(() => getClientColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
        onResetPassword: handlePasswordResetClick,
        onViewPackages: handleViewPackages,
        teamMembers: teamMembers
    }), [teamMembers]); // Re-calculate columns only if teamMembers data changes

    const filteredClients = useMemo(() => {
        if (statusTab === "all") return clients;
        return clients.filter(c => c.status?.toLowerCase() === statusTab.toLowerCase());
    }, [clients, statusTab]);

    const clientCounts = useMemo(() => {
        return clients.reduce(
            (counts, client) => {
                const status = client.status?.toLowerCase();
                counts.all += 1;

                if (status === "active") counts.active += 1;
                if (status === "onboarding") counts.onboarding += 1;

                return counts;
            },
            { all: 0, active: 0, onboarding: 0 }
        );
    }, [clients]);

    const table = useReactTable({
        data: filteredClients,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter: filter },
        onGlobalFilterChange: setFilter,
    });

    return (
        <div className="flex flex-col gap-6">
            {/* 2. SEARCH BAR & FILTERS */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <Tabs value={statusTab} onValueChange={setStatusTab} className="w-full md:w-auto">
                        <TabsList className="bg-muted/50 p-1">
                            <TabsTrigger value="all" className="gap-2 px-4">
                                <Users size={14} /> All Clients
                                <span className="rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground shadow-sm">
                                    {clientCounts.all}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="active" className="gap-2 px-4">
                                <Activity size={14} className="text-emerald-500" /> Active
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                    {clientCounts.active}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="onboarding" className="gap-2 px-4">
                                <UserPlus size={14} className="text-amber-500" /> Onboarding
                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                                    {clientCounts.onboarding}
                                </span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}>
                            <Settings size={18} />
                        </Button>
                        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 gap-2 flex-1 md:flex-none">
                            <Plus size={18} /> Onboard Client
                        </Button>
                    </div>
                </div>

                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clients by name, business..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-9 bg-card w-full h-11 shadow-sm"
                    />
                </div>
            </div>

            {/* 3. DATA TABLE */}
            <div className="rounded-md border bg-card overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
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
                            emptyText="No clients found."
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

            {/* 4. MODALS */}
            {/* Add / Edit Dialog */}
            <ClientDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSave}
                initialData={currentClient}
                teamMembers={teamMembers}
                admins={admins}
                isLoading={isLoading}
            />

            {/* View Details Sheet */}
            <ClientViewSheet
                open={viewSheetOpen}
                onOpenChange={setViewSheetOpen}
                client={currentClient}
                teamMembers={teamMembers}
                admins={admins}
            />

            <DeleteClientModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                clientId={deleteClientId}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
            />

            <ResetPasswordDialog
                open={passwordDialogOpen}
                onOpenChange={setPasswordDialogOpen}
                id={passwordClientId}
                onSubmit={handlePasswordSubmit}
                isLoading={isLoading} // uses the loading state from redux
            />

            {viewPackagesOpen && currentClient && (
                <AssignedPackagesModal
                    isOpen={viewPackagesOpen}
                    onClose={() => setViewPackagesOpen(false)}
                    clientId={currentClient.id}
                    clientName={currentClient.businessName}
                />
            )}

            <ClientSettingsDialog
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
            />
        </div>
    );
}
