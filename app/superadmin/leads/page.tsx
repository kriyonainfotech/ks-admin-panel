"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchLeads, createLead, updateLead, deleteLead, fetchLeadConfigs, addLeadConfigOption } from "@/src/redux/slices/leadSlice";
import { fetchCompanies } from "@/src/redux/slices/companySlice"; // Import fetchCompanies
import { Lead } from "@/lib/leadData";

import { LeadDialog } from "./components/LeadDialog";
import { LeadSettingsDialog } from "./components/LeadSettingsDialog";
import { LeadsToolbar } from "./components/LeadsToolbar";
import { getLeadColumns } from "./components/columns";
import { DataHandler } from "@/components/DataHandler";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { flexRender, useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState } from "@tanstack/react-table";
import { Plus, Loader2, ChevronLeft, ChevronRight, Settings, Users } from "lucide-react";
import { DateRange } from "react-day-picker";
import { isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";

export default function LeadsPage() {
    const dispatch = useAppDispatch();
    const { leads, configs, isLoading } = useAppSelector((state) => state.leads);
    const { companies } = useAppSelector((state) => state.companies); // For filter

    const [dialogOpen, setDialogOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [currentLead, setCurrentLead] = useState<Lead | null>(null);

    // --- FILTERS STATE ---
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [cityFilter, setCityFilter] = useState("all");
    const [purposeFilter, setPurposeFilter] = useState("all");
    const [companyFilter, setCompanyFilter] = useState("all");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    // --- SORTING STATE ---
    // Default sort by date descending
    const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);

    useEffect(() => {
        // Fetch Leads with Company Filter
        // If companyFilter is 'all', it fetches all (or restricted by backend if not superadmin)
        dispatch(fetchLeads(companyFilter));
        dispatch(fetchLeadConfigs());
        dispatch(fetchCompanies());
    }, [dispatch, companyFilter]); // Refetch when filter changes

    // --- DERIVED LISTS FOR DROPDOWNS ---
    const uniqueStatuses = useMemo(() => {
        const fromLeads = Array.from(new Set(leads.map(l => l.status)));
        const fromConfig = configs.find(c => c.name === "lead_status")?.options.map((o: any) => o.label) || [];
        return Array.from(new Set([...fromConfig, ...fromLeads]));
    }, [leads, configs]);

    const uniqueCities = useMemo(() => {
        const fromLeads = Array.from(new Set(leads.map(l => l.city).filter(Boolean)));
        const fromConfig = configs.find(c => c.name === "lead_city")?.options.map((o: any) => o.label) || [];
        return Array.from(new Set([...fromConfig, ...fromLeads]));
    }, [leads, configs]);

    const uniquePurposes = useMemo(() => {
        const fromLeads = Array.from(new Set(leads.map(l => l.purpose).filter(Boolean)));
        const fromConfig = configs.find(c => c.name === "lead_purpose")?.options.map((o: any) => o.label) || [];
        return Array.from(new Set([...fromConfig, ...fromLeads]));
    }, [leads, configs]);

    // --- FILTER LOGIC ---
    const filteredLeads = useMemo(() => {
        return leads.filter(l => {
            const matchesSearch =
                l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                l.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                l.phone.includes(searchTerm);

            const matchesStatus = statusFilter === "all" ? true : l.status === statusFilter;
            const matchesCity = cityFilter === "all" ? true : l.city === cityFilter;
            const matchesPurpose = purposeFilter === "all" ? true : l.purpose === purposeFilter;

            let matchesDate = true;
            if (dateRange?.from) {
                const leadDate = parseISO(l.date); // Assuming l.date is YYYY-MM-DD string
                const from = startOfDay(dateRange.from);
                const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);

                matchesDate = isWithinInterval(leadDate, { start: from, end: to });
            }

            return matchesSearch && matchesStatus && matchesCity && matchesPurpose && matchesDate;
        });
    }, [leads, searchTerm, statusFilter, cityFilter, purposeFilter, dateRange]);

    // --- HANDLERS ---
    const handleSave = async (data: any) => {
        if (currentLead) await dispatch(updateLead({ id: currentLead.id, data })).unwrap();
        else await dispatch(createLead(data)).unwrap();
        setDialogOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this lead?")) await dispatch(deleteLead(id));
    };

    const onResetFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setCityFilter("all");
        setPurposeFilter("all");
        setCompanyFilter("all"); // Reset
        setDateRange(undefined);
    };

    // --- TABLE ---
    const columns = useMemo(() => getLeadColumns({
        onEdit: (l) => { setCurrentLead(l); setDialogOpen(true); },
        onDelete: handleDelete
    }), []);

    const table = useReactTable({
        data: filteredLeads,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
        initialState: {
            pagination: { pageSize: 10 },
        }
    });

    return (
        <div className="flex flex-col gap-6 w-full max-w-full min-w-0">
            {/* Header Content Wrapper */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-card p-3 rounded-xl border border-border/50 shadow-sm gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2.5 rounded-lg text-primary hidden md:block">
                        <Users size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider leading-none">Lead Ingest</span>
                        <span className="text-[10px] text-muted-foreground mt-1">Manage prospects and conversions</span>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)} className="h-10 w-10">
                        <Settings size={18} />
                    </Button>
                    <Button onClick={() => { setCurrentLead(null); setDialogOpen(true); }} className="flex-1 md:flex-none h-10 font-semibold px-6">
                        <Plus size={18} className="mr-2" /> Add Lead
                    </Button>
                </div>
            </div>

            <LeadsToolbar
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                statusFilter={statusFilter} setStatusFilter={setStatusFilter} uniqueStatuses={uniqueStatuses}
                cityFilter={cityFilter} setCityFilter={setCityFilter} uniqueCities={uniqueCities}
                purposeFilter={purposeFilter} setPurposeFilter={setPurposeFilter} uniquePurposes={uniquePurposes}
                companyFilter={companyFilter} setCompanyFilter={setCompanyFilter} companies={companies} // Pass props
                dateRange={dateRange} setDateRange={setDateRange}
                onReset={onResetFilters}
            />

            <div className="rounded-md border bg-card overflow-x-auto w-full max-w-full">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(hg => (
                            <TableRow key={hg.id} className="bg-muted/50">
                                {hg.headers.map(h => (
                                    <TableHead
                                        key={h.id}
                                        className={cn(
                                            ["Sr.no", "date", "city", "purpose", "notes", "businessName"].includes(h.column.id) && "hidden md:table-cell"
                                        )}
                                    >
                                        {flexRender(h.column.columnDef.header, h.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        <DataHandler
                            loading={isLoading && leads.length === 0}
                            isEmpty={!isLoading && filteredLeads.length === 0}
                            variant="table-row"
                            colSpan={columns.length}
                            emptyText="No leads found."
                        >
                            {table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell
                                            key={cell.id}
                                            className={cn(
                                                ["Sr.no", "date", "city", "purpose", "notes", "businessName"].includes(cell.column.id) && "hidden md:table-cell"
                                            )}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </DataHandler>
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <LeadDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSave}
                initialData={currentLead}
                existingStatuses={uniqueStatuses}
                existingCities={uniqueCities}
                existingPurposes={uniquePurposes}
                onAddConfig={async (name: string, label: string) => {
                    await dispatch(addLeadConfigOption({ name, label })).unwrap();
                }}
                isLoading={isLoading}
                companies={companies}
            />

            <LeadSettingsDialog
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
                configs={configs}
            />
        </div>
    );
}
