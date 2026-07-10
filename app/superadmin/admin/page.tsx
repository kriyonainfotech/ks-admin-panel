"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { getColumns } from "./components/columns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Filter, Download, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { createAdmin, createSuperAdmin, deleteAdmin, fetchAdmins, fetchSuperAdmins, resetAdminPassword, updateAdmin } from "@/src/redux/slices/adminSlice";
import { fetchClients } from "@/src/redux/slices/clientSlice";
import { AdminDialog } from "./components/AdminDialog";
import { SuperAdminDialog } from "./components/SuperAdminDialog";
import { AdminViewSheet } from "./components/AdminViewSheet";
import { ResetPasswordDialog } from "@/components/ResetPasswordDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataHandler } from "@/components/DataHandler";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/src/context/AuthContext";

export default function AdminsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const role = user?.role;

  const { admins, superadmins, totalAdmins, totalSuperAdmins, isLoading } = useAppSelector((state) => state.admin);
  const { clients } = useAppSelector((state) => state.clients);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [activeTab, setActiveTab] = useState("superadmin");

  // Derive the count for the header
  const displayCount = activeTab === "superadmin" ? totalSuperAdmins : totalAdmins;
  const displayTitle = activeTab === "superadmin" ? "Superadmin Management" : "Admin Management";

  // Modal States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null); // For Edit/View
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordAdminId, setPasswordAdminId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10, // 👈 admins per page
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saDialogOpen, setSADialogOpen] = useState(false);


  // --- FETCH DATA ON LOAD ---


  useEffect(() => {
    dispatch(fetchAdmins());
    dispatch(fetchSuperAdmins());
    dispatch(fetchClients());
  }, [dispatch]);

  // --- HANDLERS ---
  const handleCreate = () => {
    setCurrentAdmin(null);
    if (activeTab === "superadmin") {
      setSADialogOpen(true);
    } else {
      setDialogOpen(true);
    }
  };

  const handleEdit = (admin: any) => {
    setCurrentAdmin(admin);
    if (admin.role === "Superadmin") {
      setSADialogOpen(true);
    } else {
      setDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await dispatch(deleteAdmin(deleteId)).unwrap();
      toast.success("Team member removed successfully");
      setDeleteDialogOpen(false);
      setDeleteId(null);
    } catch (error) {
      toast.error("Failed to remove team member");
    }
  };


  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleView = (admin: any) => {
    setCurrentAdmin(admin);
    setViewSheetOpen(true);
  };


  // 2. Handler to Open Modal (Pass this to your columns.tsx)
  const handlePasswordResetClick = (id: string) => {
    console.log(id, '----------------------------------');
    setPasswordAdminId(id);
    setPasswordDialogOpen(true);
  };

  // 3. Handler to Submit Form
  const handlePasswordSubmit = async (id: string, data: any) => {
    setPasswordDialogOpen(false);
    await dispatch(resetAdminPassword({ id, password: data.password }));
  };

  const handleSubmit = async (data: any) => {
    console.log(data, 'data');
    if (currentAdmin) {
      // Update Mode
      await dispatch(updateAdmin({ id: currentAdmin._id, data }));
    } else {
      // Create Mode
      await dispatch(createAdmin(data));
    }
    setDialogOpen(false); // Close modal
  };

  const handleSASubmit = async (data: any) => {
    try {
      if (currentAdmin) {
        await dispatch(updateAdmin({ id: currentAdmin._id, data })).unwrap();
        toast.success("Superadmin updated successfully");
      } else {
        await dispatch(createSuperAdmin(data)).unwrap();
        toast.success("Superadmin registered successfully");
      }
      setSADialogOpen(false);
    } catch (error: any) {
      toast.error(error || "Failed to process superadmin");
    }
  };

  const columns = useMemo(() => getColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onView: handleView,
    onPasswordReset: handlePasswordResetClick
  }), []);

  console.log(admins, 'admins');
  const tableData = useMemo(() => {
    return activeTab === "superadmin" ? (superadmins || []) : (admins || []);
  }, [activeTab, admins, superadmins]);

  const table = useReactTable({
    data: tableData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });



  return (
    <div className="flex flex-col gap-6">
      {/* 2. Filters & Toolbar */}
      <div className="flex flex-col md:flex-row justify-between w-full items-center gap-4">
        {/* LEFT — Tabs */}
        <Tabs
          defaultValue="admin"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-auto"
        >
          <TabsList className="gap-1">
            <TabsTrigger value="superadmin" className="px-4">Superadmins</TabsTrigger>
            <TabsTrigger value="admin" className="px-4">Admins</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* RIGHT — Search & Action */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <Input
            placeholder={`Search ${activeTab}s...`}
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="bg-card w-full sm:w-64"
          />
          {
            activeTab === "superadmin" ? (
              <></>
            ) : (
              <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 w-full sm:w-auto">
                <Plus size={18} /> Add Admin
              </Button>
            )
          }
        </div>
      </div>

      {/* 3. The Data Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="whitespace-nowrap">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <DataHandler
                loading={isLoading && tableData.length === 0}
                isEmpty={!isLoading && table.getRowModel().rows?.length === 0}
                variant="table-row"
                colSpan={columns.length}
                emptyText="No results found."
              >
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </DataHandler>
            </TableBody>

          </Table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
          {/* Left: page info */}
          <p className="text-sm text-muted-foreground">
            Page{" "}
            <span className="font-medium">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            of{" "}
            <span className="font-medium">
              {table.getPageCount()}
            </span>
          </p>

          {/* Right: controls */}
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


        {/* MODALS */}
        <AdminDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          initialData={currentAdmin}
          isLoading={isLoading}
          clients={clients}
        />

        <SuperAdminDialog
          open={saDialogOpen}
          onOpenChange={setSADialogOpen}
          onSubmit={handleSASubmit}
          isLoading={isLoading}
        />

        <AdminViewSheet
          open={viewSheetOpen}
          onOpenChange={setViewSheetOpen}
          admin={currentAdmin}
        />

        <ResetPasswordDialog
          open={passwordDialogOpen}
          onOpenChange={setPasswordDialogOpen}
          id={passwordAdminId}
          onSubmit={handlePasswordSubmit}
          isLoading={isLoading} // uses the loading state from redux
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          isLoading={isLoading}
          title="Remove Admin?"
          description="Are you sure you want to remove this admin? This action cannot be undone."
          confirmText="Remove Admin"
        />
      </div>
    </div>
  );
}