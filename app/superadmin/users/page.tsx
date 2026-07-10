"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchUsers, createUser, updateUser, deleteUser } from "@/src/redux/slices/userSlice";
import { User } from "@/lib/userData";

import { UserDialog } from "./components/UserDialog";
import { UserViewModal } from "./components/UserViewModal";
import { getUserColumns } from "./components/columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { flexRender, useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { Plus, Loader2, Search, Users } from "lucide-react";
import { fetchInventory } from "@/src/redux/slices/packageSlice";

export default function UsersPage() {
    const dispatch = useAppDispatch();
    const { users, isLoading } = useAppSelector((state) => state.users);
    const { packages, services } = useAppSelector((state) => state.packages);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [viewUser, setViewUser] = useState<User | null>(null);
    const [filter, setFilter] = useState("");
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [targetUser, setTargetUser] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchUsers());
        dispatch(fetchInventory()); // Fetch packages/services so dropdowns work
    }, [dispatch]);

    const handleAssignClick = (user: any) => {
        setTargetUser(user);
        setAssignModalOpen(true);
    };

    // const handleAssignSubmit = async (packageData: any) => {
    //     await dispatch(assignPackageToUser({ userId: targetUser.id, packageData })).unwrap();
    //     setAssignModalOpen(false);
    //     // Optional: Toast "User promoted to Client!"
    // };

    const handleSave = async (data: any) => {
        if (currentUser) await dispatch(updateUser({ id: currentUser.id, data })).unwrap();
        else await dispatch(createUser(data)).unwrap();
        setDialogOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this user?")) await dispatch(deleteUser(id));
    };

    // Filter Logic
    const filteredUsers = useMemo(() => {
        return users.filter(u =>
            u.name.toLowerCase().includes(filter.toLowerCase()) ||
            u.email.toLowerCase().includes(filter.toLowerCase()) ||
            u.businessName?.toLowerCase().includes(filter.toLowerCase())
        );
    }, [users, filter]);

    const columns = useMemo(() => getUserColumns({
        onEdit: (u) => { setCurrentUser(u); setDialogOpen(true); },
        onDelete: handleDelete,
        onView: (u) => { setViewUser(u); setViewDialogOpen(true); },
        // handleAssignClick
    }), []);

    const table = useReactTable({
        data: filteredUsers,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="flex flex-col gap-6 w-full max-w-full min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-card p-3 rounded-xl border border-border/50 shadow-sm gap-4">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="pl-10 bg-muted/30 border-none focus-visible:ring-1 h-10"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button 
                        onClick={() => { setCurrentUser(null); setDialogOpen(true); }}
                        className="flex-1 md:flex-none h-10 shadow-sm font-semibold"
                    >
                        <Plus size={18} className="mr-2" /> Add User
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(hg => (
                            <TableRow key={hg.id} className="bg-muted/50">
                                {hg.headers.map(h => <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <TableRow><TableCell colSpan={columns.length} className="h-24 text-center"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow> :
                            table.getRowModel().rows.length > 0 ? table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>{row.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>
                            )) : <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">No users found.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>

            <UserDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSave}
                initialData={currentUser}
                isLoading={isLoading}
            />

            <UserViewModal
                open={viewDialogOpen}
                onOpenChange={setViewDialogOpen}
                user={viewUser}
            />

            {/* <AssignPackageModal
                open={assignModalOpen}
                onOpenChange={setAssignModalOpen}
                onSubmit={handleAssignSubmit}
                targetUser={targetUser}
                templates={packages} // Pass templates
                services={services}   // Pass services
            /> */}
        </div>
    );
}