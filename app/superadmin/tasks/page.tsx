"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";

// Redux Actions
import { fetchTasks, createTask, updateTask, deleteTask, updateTaskStatus, fetchCalendarData, clearTasks } from "@/src/redux/slices/taskSlice";
import { fetchTeam } from "@/src/redux/slices/teamSlice";
import { fetchClients } from "@/src/redux/slices/clientSlice";
import { fetchAdmins, fetchSuperAdmins } from "@/src/redux/slices/adminSlice";
import { fetchOptionSets } from "@/src/redux/slices/optionSetSlice";

// Components
import { TaskDialog } from "./components/TaskDialog";
import { ViewTaskDialog } from "./components/ViewTaskDialog";
import { CustomMobileCalendar } from "./components/CustomMobileCalendar";
import { getTaskColumns } from "./components/columns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { flexRender, useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { Plus, FilterX, Search, Trash, Circle, CalendarIcon, Pencil, Eye, Loader2, Filter, Check, ChevronsUpDown } from "lucide-react";
import { format, parseISO, isSameDay, isBefore, startOfDay, isWithinInterval, startOfDay as startOfDayFn, endOfDay, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { TaskType, Task } from "@/lib/taskdata";
import type { Client } from "@/lib/clientdata";
import { DateRange } from "react-day-picker";
import { useAuth } from "@/src/context/AuthContext"; // ✅ IMPORT AUTH
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { DataHandler } from "@/components/DataHandler";

type ClientFilterOption = Client & { _id?: string };
const getStatusLabel = (
    value: string,
    options: { label: string; value: string }[]
) => {
    const normalized = value.trim().toLowerCase();
    return options.find(opt =>
        opt.value.trim().toLowerCase() === normalized ||
        opt.label.trim().toLowerCase() === normalized
    )?.label || value;
};

const getStatusOptionColor = (
    value: string,
    options: { label: string; value: string; color?: string }[]
) => {
    const normalized = value.trim().toLowerCase();
    return options.find(opt =>
        opt.value.trim().toLowerCase() === normalized ||
        opt.label.trim().toLowerCase() === normalized
    )?.color;
};

function ClientFilterDropdown({
    clients,
    value,
    onChange,
    compact = false,
}: {
    clients: Client[];
    value: string;
    onChange: (value: string) => void;
    compact?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const clientOptions = clients as ClientFilterOption[];
    const selectedClient = clientOptions.find((client) => (client.id || client._id) === value);
    const filteredClients = clientOptions.filter((client) =>
        client.businessName?.toLowerCase().includes(search.trim().toLowerCase())
    );

    const selectClient = (clientId: string) => {
        onChange(clientId);
        setSearch("");
        setOpen(false);
    };

    return (
        <div className="relative">
            <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                onClick={() => setOpen((current) => !current)}
                className={cn(
                    "justify-between font-normal focus-visible:border-input focus-visible:ring-0 focus-visible:ring-transparent",
                    compact
                        ? "h-8 w-full px-2 text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-tighter bg-muted/40 border-none rounded-full shadow-sm"
                        : "w-full sm:w-[190px] h-9"
                )}
            >
                <span className="truncate">{selectedClient?.businessName || "All Clients"}</span>
                <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
            </Button>

            {open && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-[280px] rounded-md border bg-popover p-2 text-popover-foreground shadow-md">
                    <div className="relative mb-2">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search client..."
                            className="h-8 pl-8 text-xs focus-visible:border-input focus-visible:ring-0 focus-visible:ring-transparent"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-64 overflow-y-auto pr-1">
                        <button
                            type="button"
                            onClick={() => selectClient("all")}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                        >
                            <Check className={cn("h-4 w-4", value === "all" ? "opacity-100" : "opacity-0")} />
                            All Clients
                        </button>
                        {filteredClients.length === 0 ? (
                            <div className="px-2 py-6 text-center text-sm text-muted-foreground">No client found.</div>
                        ) : (
                            filteredClients.map((client) => {
                                const clientId = client.id || client._id || "";
                                return (
                                    <button
                                        type="button"
                                        key={clientId}
                                        onClick={() => selectClient(clientId)}
                                        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                                    >
                                        <Check className={cn("h-4 w-4", value === clientId ? "opacity-100" : "opacity-0")} />
                                        <span className="truncate">{client.businessName}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TasksPage() {
    const dispatch = useAppDispatch();
    const { user } = useAuth();

    // Selectors
    const { tasks, isLoading, calendarData, total, monthCount } = useAppSelector((state) => state.tasks);
    const { members: teamMembers } = useAppSelector((state) => state.team);
    const { clients } = useAppSelector((state) => state.clients);
    const { admins, superadmins } = useAppSelector((state) => state.admin);
    const { optionSets } = useAppSelector((state) => state.optionSet);

    // State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<TaskType>("Personal");
    const [superadminTabUser, setSuperadminTabUser] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Date Range State - Default to TODAY
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });

    const [page, setPage] = useState(1);
    const [limit] = useState(50);

    const [dialogDefaultType, setDialogDefaultType] = useState<TaskType>("Personal");
    const [statusOptions, setStatusOptions] = useState<{ label: string, value: string, color?: string }[]>([]);
    const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

    const otherSuperAdmins = useMemo(() => {
        return superadmins.filter((a: any) => a._id !== user?._id);
    }, [superadmins, user]);

    useEffect(() => {
        if (activeTab === "Superadmin" && otherSuperAdmins.length > 0 && !superadminTabUser) {
            setSuperadminTabUser(otherSuperAdmins[0]._id);
        }
    }, [activeTab, otherSuperAdmins, superadminTabUser]);

    // Filters
    const [textFilter, setTextFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [clientFilter, setClientFilter] = useState<string>("all");
    const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Generate Current Year Months for Filter
    const monthOptions = useMemo(() => {
        const options = [];
        const today = new Date();
        const startOfYearDate = new Date(today.getFullYear(), 0, 1);

        for (let i = 0; i < 12; i++) {
            const date = new Date(today.getFullYear(), i, 1);
            options.push({
                label: format(date, "MMMM yyyy"),
                value: startOfMonth(date).toISOString(),
                date: date
            });
        }
        return options;
    }, []);

    const handleMonthSelect = (value: string) => {
        const selectedDate = parseISO(value);
        setCalendarMonth(selectedDate);
        setDateRange({
            from: startOfMonth(selectedDate),
            to: endOfMonth(selectedDate)
        });
    };

    // Helper to check if current range matches a month
    const currentMonthValue = useMemo(() => {
        if (!dateRange?.from || !dateRange.to) return "";
        const start = startOfMonth(dateRange.from);
        const end = endOfMonth(dateRange.from);

        // Check if the range matches a full month
        if (isSameDay(dateRange.from, start) && isSameDay(dateRange.to, end)) {
            return start.toISOString();
        }
        return "";
    }, [dateRange]);

    useEffect(() => {
        const savedTab = localStorage.getItem("tasks-tab") as TaskType | null;
        if (savedTab === "Personal" || savedTab === "Admin" || savedTab === "Team" || savedTab === "Superadmin") {
            setActiveTab(savedTab);
        }
    }, []);

    // ✅ AUTO-SELECT "ME" WHEN SWITCHING TO PERSONAL TAB
    useEffect(() => {
        setTextFilter("");
        setStatusFilter("all");
        setClientFilter("all");
        setPage(1); // Reset page on tab switch

        if (activeTab === "Personal" && user?._id) {
            setAssigneeFilter(user._id); // Default to My Tasks
        } else {
            setAssigneeFilter("all");
        }

        dispatch(clearTasks()); // Clear state to avoid data bleed between tabs
        setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) });
    }, [activeTab, user, dispatch]);

    useEffect(() => {
        const setNameMap: Record<TaskType, string> = {
            "Personal": "superadmin_tasks_status",
            "Admin": "admin_tasks_status",
            "Team": "team_tasks_status",
            "Superadmin": "superadmin_tasks_status"
        };
        const setName = setNameMap[activeTab] || "superadmin_tasks_status";

        const taskStatusSet = optionSets.find(s => s.name === setName);
        if (taskStatusSet) {
            setStatusOptions(taskStatusSet.options);
        } else {
            const fallbackSet = optionSets.find(s => s.name === "superadmin_tasks_status");
            if (fallbackSet) setStatusOptions(fallbackSet.options);
        }
    }, [optionSets, activeTab]);

    const fetchCurrentTasks = React.useCallback(() => {
        const isMonthView = !!currentMonthValue;
        const params: any = {
            page,
            limit: isMonthView ? 500 : limit,
            type: activeTab === "Superadmin" ? "Personal" : activeTab,
            startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
            endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : (dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")),
            search: textFilter || undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
        };

        if (activeTab === "Personal") params.assignedTo = user?._id;
        if (activeTab === "Superadmin") params.assignedTo = superadminTabUser;
        if (clientFilter !== "all") params.client = clientFilter;
        if ((activeTab === "Team" || activeTab === "Admin") && assigneeFilter !== "all") params.assignedTo = assigneeFilter;

        dispatch(fetchTasks(params));
    }, [dispatch, activeTab, dateRange, statusFilter, textFilter, clientFilter, assigneeFilter, superadminTabUser, user, page, limit, currentMonthValue]);

    // Fetch just calendarData for the visible calendar month (silent — no loading state)
    const fetchCalendarForMonth = React.useCallback((month: Date) => {
        const params: any = {
            type: activeTab === "Superadmin" ? "Personal" : activeTab,
            startDate: format(startOfMonth(month), "yyyy-MM-dd"),
            endDate: format(endOfMonth(month), "yyyy-MM-dd"),
        };
        if (activeTab === "Personal") params.assignedTo = user?._id;
        if (activeTab === "Superadmin") params.assignedTo = superadminTabUser;
        if (clientFilter !== "all") params.client = clientFilter;
        if ((activeTab === "Team" || activeTab === "Admin") && assigneeFilter !== "all") params.assignedTo = assigneeFilter;
        dispatch(fetchCalendarData(params));
    }, [dispatch, activeTab, user, superadminTabUser, assigneeFilter, clientFilter]);

    useEffect(() => {
        fetchCalendarForMonth(calendarMonth);
    }, [calendarMonth, fetchCalendarForMonth]);

    useEffect(() => {
        fetchCurrentTasks();
    }, [fetchCurrentTasks]);

    useEffect(() => {
        dispatch(fetchTeam());
        dispatch(fetchClients());
        dispatch(fetchAdmins());
        dispatch(fetchOptionSets());
        dispatch(fetchSuperAdmins());
    }, [dispatch]);

    // Helper to safely get ID from string or object
    const getId = (field: any) => {
        if (!field) return "";
        return typeof field === "object" ? field._id : field;
    };

    const getDayAnalytics = (day: Date) => {
        const dateStr = format(day, "yyyy-MM-dd");
        return calendarData?.[dateStr] || null;
    };

    const displayedTasks = useMemo(() => {
        return tasks;
    }, [tasks]);

    console.log(displayedTasks, "displayedTasks");
    // --- HANDLERS ---
    const handleAddClick = () => {
        setCurrentTask(null);
        setDialogDefaultType(activeTab === "Superadmin" ? "Personal" : activeTab);
        setDialogOpen(true);
    };

    const handleSave = async (data: any) => {
        try {
            // Force assign to self if Personal task and no assignee
            if (activeTab === "Personal" && !data.assignedTo && user?._id) {
                data.assignedTo = user._id;
            }

            // Normalize AssignedTo and Client (might be objects from population)
            if (data.assignedTo) data.assignedTo = getId(data.assignedTo);
            if (data.client) data.client = getId(data.client);

            // Handle "Superadmin" sub-tab logic
            if (activeTab === "Superadmin") {
                data.type = "Personal";
                if (superadminTabUser) data.assignedTo = superadminTabUser;
            }

            if (currentTask?._id) {
                await dispatch(updateTask({ _id: currentTask._id, data })).unwrap();
                toast.success("Task updated successfully");
            } else {
                await dispatch(createTask(data)).unwrap();
                toast.success("Task created successfully");
            }
            setDialogOpen(false);
            fetchCurrentTasks(); // Re-fetch so list matches current date filter
        } catch (error: any) {
            console.error("Task Save Error:", error);
            toast.error(error.message || "Failed to save task");
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await dispatch(deleteTask(deleteId)).unwrap();
            toast.success("Task Deleted successfully");
            setDeleteDialogOpen(false);
            setDeleteId(null);
        } catch (error) {
            toast.error("Failed to delete task");
        }
    };

    const handleUpdate = (task: Task) => {
        setCurrentTask(task);
        setDialogOpen(true);
    };

    const handleView = (task: Task) => {
        setCurrentTask(task);
        setViewDialogOpen(true);
    };

    // CustomCalendar removed to prevent re-mounting issues. 
    // We will use <Calendar /> directly in the JSX.

    const AnalyticsSidebar = () => {
        const focusDate = dateRange?.from;
        const analytics = focusDate ? getDayAnalytics(focusDate) : null;

        return (
            <div className="w-full xl:w-[280px] flex flex-col gap-4">
                <div className="hidden xl:block">
                    <div className="flex items-center justify-between mb-2">
                        {/* <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Calendar View</span> */}
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    </div>
                    <Calendar
                        mode="single"
                        selected={dateRange?.from}
                        onSelect={(date) => {
                            if (date) {
                                setDateRange({ from: date, to: date });
                            }
                        }}
                        month={calendarMonth}
                        onMonthChange={(month) => {
                            setCalendarMonth(month);
                            fetchCalendarForMonth(month);
                        }}
                        className="rounded-md border shadow bg-card w-full"
                        components={{
                            DayButton: (props) => {
                                const { day } = props;
                                const analytics = getDayAnalytics(day.date);
                                return (
                                    <CalendarDayButton {...props}>
                                        <div className="relative flex h-full w-full items-center justify-center">
                                            <span>{day.date.getDate()}</span>
                                            {analytics && (
                                                <div className="absolute bottom-1 flex flex-col items-center">
                                                    <div
                                                        className="h-1.5 w-1.5 rounded-full"
                                                        style={{ backgroundColor: analytics.color }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </CalendarDayButton>
                                );
                            }
                        }}
                    />
                </div>
            </div>
        );
    };

        const FilterBar = () => {
        const showAssignee = activeTab === "Team" || activeTab === "Admin";
        const assigneeAllLabel = activeTab === "Team" ? "All Team" : "All People";
        const hasActiveFilters =
            !!textFilter ||
            statusFilter !== "all" ||
            clientFilter !== "all" ||
            (activeTab === "Personal" ? assigneeFilter !== user?._id : assigneeFilter !== "all") ||
            !(dateRange?.from && isSameDay(dateRange.from, startOfMonth(new Date())) && dateRange?.to && isSameDay(dateRange.to, endOfMonth(new Date())));

        const clearFilters = () => {
            setTextFilter("");
            setStatusFilter("all");
            setClientFilter("all");
            setAssigneeFilter(activeTab === "Personal" && user?._id ? user._id : "all");
            setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) });
        };

        const FilterControls = () => (
            <>
                {/* MONTH FILTER */}
                <Select value={currentMonthValue} onValueChange={handleMonthSelect}>
                    <SelectTrigger className="w-full sm:w-[180px] h-9 focus-visible:border-input focus-visible:ring-0 focus-visible:ring-transparent">
                        <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                        {monthOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* STATUS FILTER */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[130px] h-9 focus-visible:border-input focus-visible:ring-0 focus-visible:ring-transparent"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {statusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: opt.color }} />
                                    <span>{opt.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* ✅ ASSIGNEE FILTER - ONLY FOR TEAM AND ADMIN TABS */}
                {(activeTab === "Team" || activeTab === "Admin") && (
                    <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                        <SelectTrigger className="w-full sm:w-[150px] h-9 focus-visible:border-input focus-visible:ring-0 focus-visible:ring-transparent">
                            <SelectValue placeholder="Assignee" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{assigneeAllLabel}</SelectItem>
                            {activeTab === "Team" && teamMembers.map(m => (
                                <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                            ))}
                            {activeTab === "Admin" && admins.map((a: any) => (
                                <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {/* CLIENT FILTER */}
                <ClientFilterDropdown clients={clients} value={clientFilter} onChange={setClientFilter} />

                {/* CLEAR FILTERS */}
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive h-9">
                        <FilterX className="h-4 w-4 mr-1" /> Clear
                    </Button>
                )}
            </>
        );

        const AddTaskButton = ({ className }: { className?: string }) => (
            <Button
                onClick={handleAddClick}
                size="sm"
                className={cn("bg-red-600 hover:bg-red-700 text-white font-bold px-6 shadow-sm transition-all gap-2 h-9", className)}
            >
                <Plus className="h-4 w-4" /> Add {activeTab === "Superadmin" ? "Partner" : activeTab} Task
            </Button>
        );

        return (
            <div className="flex flex-col gap-2 mb-4">
                {/* Desktop: Show Filters directly */}
                <div className="hidden xl:flex flex-col w-full gap-3">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={textFilter}
                                onChange={(event) => setTextFilter(event.target.value)}
                                placeholder="Search by task, client, assignee, creator, status, priority, category..."
                                className="h-10 pl-9 pr-3 focus-visible:border-input focus-visible:ring-0 focus-visible:ring-transparent"
                            />
                        </div>
                        <AddTaskButton className="shrink-0 h-10" />
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        <FilterControls />
                    </div>
                </div>

                {/* Tablet/Laptop & Mobile Filters */}
                <div className="xl:hidden w-full flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={textFilter}
                                onChange={(event) => setTextFilter(event.target.value)}
                                placeholder="Search task, client, assignee..."
                                className="h-9 pl-8 text-xs focus-visible:border-input focus-visible:ring-0 focus-visible:ring-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 w-full">
                            {/* MONTH TAB */}
                            <div className="min-w-0">
                                <Select value={currentMonthValue} onValueChange={handleMonthSelect}>
                                    <SelectTrigger className="h-8 px-2 text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-tighter bg-muted/40 border-none rounded-full hover:bg-muted/60 transition-all shadow-sm w-full focus-visible:ring-0 focus-visible:ring-transparent">
                                        <div className="flex items-center gap-1 truncate justify-center">
                                            <CalendarIcon className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                                            <span className="truncate">{currentMonthValue ? format(parseISO(currentMonthValue), "MMM 'yy") : "Month"}</span>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-muted/50">
                                        {monthOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value} className="text-[10px] sm:text-xs">
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* STATUS TAB */}
                            <div className="min-w-0">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="h-8 px-2 text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-tighter bg-muted/40 border-none rounded-full hover:bg-muted/60 transition-all shadow-sm w-full focus-visible:ring-0 focus-visible:ring-transparent">
                                        <div className="flex items-center gap-1 truncate justify-center">
                                            <Filter className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                                            <span className="truncate">{statusFilter === "all" ? "Status" : getStatusLabel(statusFilter, statusOptions)}</span>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-muted/50">
                                        <SelectItem value="all" className="text-[10px] sm:text-xs">All Status</SelectItem>
                                        {statusOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value} className="text-[10px] sm:text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: opt.color }} />
                                                    <span>{opt.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* PEOPLE TAB */}
                            {showAssignee && (
                                <div className="min-w-0">
                                    <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                                        <SelectTrigger className="h-8 px-2 text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-tighter bg-muted/40 border-none rounded-full hover:bg-muted/60 transition-all shadow-sm w-full focus-visible:ring-0 focus-visible:ring-transparent">
                                            <div className="flex items-center gap-1 truncate justify-center">
                                                <Search className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                                                <span className="truncate">
                                                    {assigneeFilter === "all" ? assigneeAllLabel : (activeTab === "Team" ? teamMembers.find(m => m._id === assigneeFilter)?.name : admins.find((a: any) => a._id === assigneeFilter)?.name) || assigneeAllLabel}
                                                </span>
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-muted/50">
                                            <SelectItem value="all" className="text-[10px] sm:text-xs">{assigneeAllLabel}</SelectItem>
                                            {activeTab === "Team" && teamMembers.map(m => (
                                                <SelectItem key={m._id} value={m._id} className="text-[10px] sm:text-xs">{m.name}</SelectItem>
                                            ))}
                                            {activeTab === "Admin" && admins.map((a: any) => (
                                                <SelectItem key={a._id} value={a._id} className="text-[10px] sm:text-xs">{a.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="min-w-0">
                                <ClientFilterDropdown clients={clients} value={clientFilter} onChange={setClientFilter} compact />
                            </div>
                        </div>

                        {/* Mobile Clear Button */}
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-destructive h-7 text-[10px] font-bold uppercase tracking-tighter self-center lg:hidden"
                            >
                                <FilterX className="h-3 w-3 mr-1" /> Clear Filters
                            </Button>
                        )}
                    </div>

                    {/* Add Task Button for Tablet/Laptop (LG screens >= 1024px) */}
                    <div className="hidden lg:block shrink-0">
                        <AddTaskButton className="h-10 px-6" />
                    </div>
                </div>
            </div>
        );
    };

    const columns = useMemo(() => getTaskColumns({
        onEdit: handleUpdate,
        onView: handleView,
        onDelete: handleDelete,
        statusOptions: statusOptions
    }), [statusOptions]);

    const RenderTable = ({ data }: { data: any[] }) => {
        const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
        return (
            <div className="rounded-md border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(hg => (
                            <TableRow key={hg.id} className="bg-muted/50">{hg.headers.map(h => <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}</TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        <DataHandler
                            loading={isLoading && data.length === 0}
                            isEmpty={!isLoading && data.length === 0}
                            variant="table-row"
                            colSpan={columns.length}
                            emptyText="No tasks found for this range."
                        >
                            {table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>{row.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>
                            ))}
                        </DataHandler>
                    </TableBody>
                </Table>
            </div>
        )
    };

    const rangeStats = useMemo(() => {
        if (!calendarData || !dateRange?.from || !dateRange?.to) {
            return { total: 0, done: 0, pending: 0 };
        }

        let total = 0;
        let done = 0;

        const start = startOfDayFn(dateRange.from);
        const end = endOfDay(dateRange.to);

        Object.keys(calendarData).forEach(dateStr => {
            try {
                const date = parseISO(dateStr);
                if (date >= start && date <= end) {
                    total += calendarData[dateStr].total || 0;
                    done += calendarData[dateStr].completed || 0;
                }
            } catch (e) {
                console.error("Error parsing date in calendarData:", dateStr);
            }
        });

        return { total, done, pending: total - done };
    }, [calendarData, dateRange]);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 xl:h-[calc(100vh-2rem)] min-h-screen xl:overflow-hidden">
            <div className="flex flex-col xl:min-h-0 xl:overflow-hidden">

                {/* Mobile Custom Month Calendar (Visible < xl) */}
                <div className="xl:hidden w-full mb-4 px-1 sticky top-0 z-30">
                    <CustomMobileCalendar
                        date={dateRange?.from}
                        onSelect={(date) => {
                            setDateRange({ from: date, to: date });
                        }}
                        getAnalytics={getDayAnalytics}
                    />
                </div>

                <Tabs
                    value={activeTab}
                    className="flex-1 flex flex-col xl:overflow-hidden"
                    onValueChange={(val) => {
                        setActiveTab(val as TaskType);
                        localStorage.setItem("tasks-tab", val);
                    }}>

                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-2 mb-2">
                        <div className="flex justify-between items-center mb-0 shrink-0 w-full lg:w-auto overflow-x-auto no-scrollbar">
                            <TabsList className="flex w-full min-w-max lg:min-w-0 h-auto gap-2 lg:grid lg:grid-cols-4 lg:w-full p-1 bg-muted/50 rounded-lg">
                                <TabsTrigger value="Personal" className="flex-1 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">My Tasks</TabsTrigger>
                                <TabsTrigger value="Superadmin" className="flex-1 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">Superadmin Tasks</TabsTrigger>
                                <TabsTrigger value="Admin" className="flex-1 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">Admin Tasks</TabsTrigger>
                                <TabsTrigger value="Team" className="flex-1 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">Team Tasks</TabsTrigger>
                            </TabsList>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col xl:min-h-0 xl:overflow-hidden">
                        <div className="shrink-0">
                            {FilterBar()}
                        </div>

                        <div className="flex-1 xl:overflow-y-auto pr-2 custom-scrollbar">
                            <TabsContent value="Personal" className="mt-0 outline-none">
                                <div className="space-y-3">
                                    <DataHandler
                                        loading={isLoading && displayedTasks.length === 0}
                                        isEmpty={!isLoading && displayedTasks.length === 0}
                                        variant="inline"
                                        emptyText={`No tasks found for ${assigneeFilter === user?._id ? "you" : "selected partner"} in this range.`}
                                    >
                                        {displayedTasks.map(task => (
                                            <div key={task._id} className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 sm:py-2 border rounded-xl bg-card shadow-sm hover:shadow-md transition-all gap-4 sm:gap-0">
                                                <div className="flex flex-col gap-1 flex-1">
                                                    <span className={cn("font-semibold text-base", task.status === "Done" && "text-muted-foreground line-through")}>
                                                        {task.title}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground flex items-center gap-1.5 border">
                                                            <div
                                                                className="h-2 w-2 rounded-full"
                                                                style={{ backgroundColor: getStatusOptionColor(task.status, statusOptions) || '#64748b' }}
                                                            />
                                                            {task.status}
                                                        </span>
                                                        {task.dueDate && (
                                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                                                {format(new Date(task.dueDate), "MMM d")}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-row items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-dashed sm:border-none">
                                                    <Select
                                                        value={task.status}
                                                        onValueChange={async (val: any) => {
                                                            try {
                                                                await dispatch(updateTaskStatus({ id: task._id, status: val })).unwrap();
                                                                toast.success("Status updated");
                                                            } catch (err: any) {
                                                                toast.error(err.message || "Failed to update status");
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-full sm:w-[130px] h-9 sm:h-8 text-xs font-medium bg-muted/30">
                                                            <SelectValue placeholder="Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {statusOptions.map((opt) => (
                                                                <SelectItem key={opt.value} value={opt.value}>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: opt.color }} />
                                                                        <span>{opt.label}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>

                                                    <div className="flex items-center sm:border-l sm:pl-3 gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => handleView(task)} className="text-muted-foreground hover:text-primary h-9 w-9 sm:h-8 sm:w-8">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleUpdate(task)} className="text-muted-foreground hover:text-primary h-9 w-9 sm:h-8 sm:w-8">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(task._id)} className="text-muted-foreground hover:text-destructive h-9 w-9 sm:h-8 sm:w-8">
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </DataHandler>
                                </div>
                            </TabsContent>

                            <TabsContent value="Admin" className="mt-0 outline-none">
                                <RenderTable data={displayedTasks} />
                            </TabsContent>

                            <TabsContent value="Team" className="mt-0 outline-none">
                                <RenderTable data={displayedTasks} />
                            </TabsContent>

                            <TabsContent value="Superadmin" className="mt-0 outline-none h-full flex flex-col">
                                <Tabs value={superadminTabUser || ""} onValueChange={setSuperadminTabUser} className="flex-1 flex flex-col">
                                    <TabsList className="flex overflow-x-auto justify-start bg-transparent h-auto p-0 gap-2 mb-4">
                                        {otherSuperAdmins.map((a: any) => (
                                            <TabsTrigger
                                                key={a._id}
                                                value={a._id}
                                                className="px-4 py-2 rounded-full border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                            >
                                                {a.name}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    <div className="space-y-3 overflow-y-auto pr-1">
                                        <DataHandler
                                            loading={isLoading && displayedTasks.length === 0}
                                            isEmpty={!isLoading && displayedTasks.length === 0}
                                            variant="inline"
                                            emptyText={`No tasks found for ${otherSuperAdmins.find(a => a._id === superadminTabUser)?.name} in this range.`}
                                        >
                                            {displayedTasks.map(task => (
                                                <div key={task._id} className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 sm:py-2 border rounded-xl bg-card shadow-sm hover:shadow-md transition-all gap-4 sm:gap-0">
                                                    <div className="flex flex-col gap-1 flex-1">
                                                        <span className={cn("font-semibold text-base", task.status === "Done" && "text-muted-foreground line-through")}>
                                                            {task.title}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground flex items-center gap-1.5 border">
                                                                <div
                                                                    className="h-2 w-2 rounded-full"
                                                                    style={{ backgroundColor: getStatusOptionColor(task.status, statusOptions) || '#64748b' }}
                                                                />
                                                                {task.status}
                                                            </span>
                                                            {task.dueDate && (
                                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                                                    {format(new Date(task.dueDate), "MMM d")}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-row items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-dashed sm:border-none">
                                                        <Select
                                                            value={task.status}
                                                            onValueChange={async (val: any) => {
                                                                try {
                                                                    await dispatch(updateTaskStatus({ id: task._id, status: val })).unwrap();
                                                                    toast.success("Status updated");
                                                                } catch (err: any) {
                                                                    toast.error(err.message || "Failed to update status");
                                                                }
                                                            }}
                                                        >
                                                            <SelectTrigger className="w-full sm:w-[130px] h-9 sm:h-8 text-xs font-medium bg-muted/30">
                                                                <SelectValue placeholder="Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {statusOptions.map((opt) => (
                                                                    <SelectItem key={opt.value} value={opt.value}>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: opt.color }} />
                                                                            <span>{opt.label}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        <div className="flex items-center sm:border-l sm:pl-3 gap-1">
                                                            <Button variant="ghost" size="icon" onClick={() => handleView(task)} className="text-muted-foreground hover:text-primary h-9 w-9 sm:h-8 sm:w-8">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleUpdate(task)} className="text-muted-foreground hover:text-primary h-9 w-9 sm:h-8 sm:w-8">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </DataHandler >
                                    </div >
                                </Tabs >
                            </TabsContent >
                        </div>
                    </div>
                </Tabs>
            </div>

            {/* RIGHT COLUMN: Sidebar (Calendar & Analytics) */}
            <div className="hidden xl:flex flex-col border-l pl-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="px-3 py-2 bg-muted/40 rounded-lg border shadow-sm flex flex-col items-center justify-center">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total</span>
                        <span className="text-xl font-black">{rangeStats.total}</span>
                    </div>
                    <div className="px-3 py-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10 shadow-sm flex flex-col items-center justify-center">
                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Done</span>
                        <span className="text-xl font-black text-emerald-600">{rangeStats.done}</span>
                    </div>
                    <div className="px-3 py-2 bg-amber-500/5 rounded-lg border border-amber-500/10 shadow-sm flex flex-col items-center justify-center">
                        <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Pending</span>
                        <span className="text-xl font-black text-amber-600">{rangeStats.pending}</span>
                    </div>
                </div>
                <div className="p-2 border-t">
                    <h2 className="text-lg font-bold text-center uppercase tracking-widest text-muted-foreground/80">Calendar</h2>
                </div>
                <div className="flex flex-col gap-6">
                    <AnalyticsSidebar />
                </div>
            </div>

            {/* Dialogs */}
            <TaskDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSave}
                initialData={currentTask}
                defaultType={activeTab}
                lockType={true}
                teamMembers={teamMembers}
                clients={clients}
                admins={admins}
                defaultAssignee={activeTab === "Superadmin" ? superadminTabUser || "" : (assigneeFilter !== "all" ? assigneeFilter : "")}
                defaultDueDate={dateRange?.from?.toISOString()}
                isLoading={isLoading}
            />

            <ViewTaskDialog
                open={viewDialogOpen}
                onOpenChange={setViewDialogOpen}
                task={currentTask}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                isLoading={isLoading}
                title="Delete Task?"
                description="Are you sure you want to remove this task? This action cannot be undone."
                confirmText="Delete Task"
            />

            {/* Mobile FAB */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
                <Button
                    onClick={handleAddClick}
                    size="icon"
                    className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg flex items-center justify-center animate-in fade-in zoom-in duration-300"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
}
