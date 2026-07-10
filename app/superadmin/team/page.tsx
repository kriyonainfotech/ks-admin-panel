"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    useReactTable, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, flexRender
} from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchTeam, createTeamMember, updateTeamMember, deleteTeamMember, resetTeamPassword } from "@/src/redux/slices/teamSlice";
import { getTeamColumns } from "./components/columns";
import { TeamDialog } from "./components/TeamDialog";
import { TeamSheet } from "./components/TeamSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Users, Loader2, Search } from "lucide-react";
import { Team } from "@/lib/teamdata";
import { ResetPasswordDialog } from "@/components/ResetPasswordDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { DataHandler } from "@/components/DataHandler";

export default function TeamPage() {
    const dispatch = useAppDispatch();
    const { members, isLoading, error, message } = useAppSelector((state) => state.team);
    // console.log(error, "error");
    // console.log(members, "members")
    console.log(message, "message");

    const [dialogOpen, setDialogOpen] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [passwordTeamId, setPasswordTeamId] = useState<string | null>(null);
    const [currentMember, setCurrentMember] = useState<Team | null>(null);
    const [globalFilter, setGlobalFilter] = useState("");

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [viewMember, setViewMember] = useState<Team | null>(null);

    useEffect(() => {
        dispatch(fetchTeam());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    useEffect(() => {
        if (message) {
            toast.success(message);
        }
    }, [message]);


    // --- HANDLERS ---
    const handleCreate = () => {
        setCurrentMember(null);
        setDialogOpen(true);
    };

    const handleEdit = (member: Team) => {
        setCurrentMember(member);
        setDialogOpen(true);
    };

    const handleView = (member: Team) => {
        setViewMember(member);
        setIsSheetOpen(true);
    };

    const handleResetPassword = (id: string) => {
        console.log(id);
        setPasswordTeamId(id);
        setPasswordDialogOpen(true);
    };

    const handlePasswordSubmit = async (id: string, data: any) => {
        console.log(id, data);
        setPasswordDialogOpen(false);
        await dispatch(resetTeamPassword({ id, password: data.password }));
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await dispatch(deleteTeamMember(deleteId)).unwrap();
            toast.success("Team member removed successfully");
            setDeleteDialogOpen(false);
            setDeleteId(null);
        } catch (error) {
            toast.error("Failed to remove team member");
        }
    };

    const handleSubmit = async (data: any) => {
        // Backend expects specific structure, transform if needed here
        // The Dialog already returns clean data: { name, specialization, salary... }

        if (currentMember) {
            await dispatch(updateTeamMember({ id: currentMember._id, userId: currentMember._id, data }));
        } else {
            await dispatch(createTeamMember(data));
        }
        setDialogOpen(false);
    };

    const columns = useMemo(() => getTeamColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onView: handleView,
        onResetPassword: handleResetPassword
    }), []);

    // Filter Logic: Search Name, Email, or Specialization
    const filteredData = useMemo(() => {
        if (!globalFilter) return members;

        const lowerFilter = globalFilter.toLowerCase();

        return members.filter((m) =>
            m.name?.toLowerCase().includes(lowerFilter) ||
            m.email?.toLowerCase().includes(lowerFilter) ||
            m.profile?.specialization?.toLowerCase().includes(lowerFilter)
        );
    }, [members, globalFilter]);

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="flex flex-col gap-6">
            {/* TOOLBAR */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-card p-3 rounded-xl border border-border/50 shadow-sm gap-4">
                <div className="relative w-full md:max-w-sm flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary hidden md:block">
                        <Users size={18} />
                    </div>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or role..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-10 bg-muted/30 border-none focus-visible:ring-1 h-10 shadow-none"
                        />
                    </div>
                </div>
                <Button onClick={handleCreate} className="w-full md:w-auto h-10 bg-primary hover:bg-primary/90 gap-2 shadow-sm font-semibold px-6 text-white">
                    <Plus size={18} /> Add Team Member
                </Button>
            </div>

            {/* TABLE */}
            <div className="rounded-md border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="font-semibold text-muted-foreground whitespace-nowrap">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            <DataHandler
                                loading={isLoading && members.length === 0}
                                isEmpty={!isLoading && members.length === 0}
                                variant="table-row"
                                colSpan={columns.length}
                                emptyText="No team members found."
                            >
                                {table.getPaginationRowModel().rows.map((row) => (
                                    <TableRow key={row.id} className="hover:bg-muted/20 transition-colors">
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="py-3 whitespace-nowrap">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </DataHandler>
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-between px-2 py-2 border-t bg-muted/20">
                    <div className="text-sm text-muted-foreground">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>

            </div>

            <TeamDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                initialData={currentMember}
                isLoading={isLoading}
            />

            <TeamSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                member={viewMember}
            />

            <ResetPasswordDialog
                open={passwordDialogOpen}
                onOpenChange={setPasswordDialogOpen}
                id={passwordTeamId}
                onSubmit={handlePasswordSubmit}
                isLoading={isLoading} // uses the loading state from redux
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                isLoading={isLoading}
                title="Remove Team Member?"
                description="Are you sure you want to remove this team member? This action cannot be undone."
                confirmText="Remove Member"
            />
        </div>
    );
}