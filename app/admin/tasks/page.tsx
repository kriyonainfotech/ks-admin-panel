"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";

// Redux Actions
import { fetchTasks, createTask, updateTask, deleteTask, updateTaskStatus, fetchCalendarData, clearTasks } from "@/src/redux/slices/taskSlice";
import { fetchTeam } from "@/src/redux/slices/teamSlice";
import { fetchClients } from "@/src/redux/slices/clientSlice";
import { fetchAdmins } from "@/src/redux/slices/adminSlice";
import { fetchOptionSets } from "@/src/redux/slices/optionSetSlice";

// Components
import { TaskDialog } from "./components/TaskDialog";
import { ViewTaskDialog } from "./components/ViewTaskDialog";
import { CustomMobileCalendar } from "./components/CustomMobileCalendar";
import { getTaskColumns } from "./components/columns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { flexRender, useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { Plus, FilterX, Search, Trash, Circle, CalendarIcon, Pencil, Eye, Loader2, Filter } from "lucide-react";
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, startOfDay as startOfDayFn, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { TaskType, Task } from "@/lib/taskdata";
import { DateRange } from "react-day-picker";
import { useAuth } from "@/src/context/AuthContext";
import { toast } from "sonner";
import { DataHandler } from "@/components/DataHandler";

export default function AdminTasksPage() {
    const dispatch = useAppDispatch();
    const { user } = useAuth();

    // Selectors
    const { tasks, isLoading, calendarData } = useAppSelector((state) => state.tasks);
    const { members: teamMembers } = useAppSelector((state) => state.team);
    const { clients } = useAppSelector((state) => state.clients);
    const { admins } = useAppSelector((state) => state.admin);
    const { optionSets } = useAppSelector((state) => state.optionSet);

    // State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"Admin" | "Team">("Admin");

    // Date Range State - Default to TODAY
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    });

    const [statusOptions, setStatusOptions] = useState<{ label: string, value: string, color?: string }[]>([]);
    const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

    // Filters
    const [textFilter, setTextFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

    // Static months for selection
    const monthOptions = useMemo(() => {
        const options = [];
        const today = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(today.getFullYear(), i, 1);
            options.push({
                label: format(date, "MMMM yyyy"),
                value: startOfMonth(date).toISOString(),
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

    const currentMonthValue = useMemo(() => {
        if (!dateRange?.from || !dateRange.to) return "";
        const start = startOfMonth(dateRange.from);
        const end = endOfMonth(dateRange.from);
        if (isSameDay(dateRange.from, start) && isSameDay(dateRange.to, end)) {
            return start.toISOString();
        }
        return "";
    }, [dateRange]);

    useEffect(() => {
        dispatch(clearTasks());
        setTextFilter("");
        setStatusFilter("all");
        if (activeTab === "Admin" && user?._id) {
            setAssigneeFilter(user._id);
        } else {
            setAssigneeFilter("all");
        }
        setDateRange({ from: new Date(), to: new Date() });
    }, [activeTab, user, dispatch]);

    useEffect(() => {
        const setNameMap: Record<string, string> = {
            "Admin": "superadmin_tasks_status",
            "Team": "team_tasks_status",
        };
        const setName = setNameMap[activeTab] || "superadmin_tasks_status";
        const taskStatusSet = optionSets.find(s => s.name === setName);
        if (taskStatusSet) setStatusOptions(taskStatusSet.options);
    }, [optionSets, activeTab]);

    const fetchCurrentTasks = React.useCallback(() => {
        const params: any = {
            startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
            endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : (dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")),
            search: textFilter || undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
        };

        // Tab-specific logic
        if (activeTab === "Admin") {
            params.assignedTo = user?._id;
            // No type filter for Admin - user sees everything assigned to them
        } else {
            params.type = "Team";
            if (assigneeFilter !== "all") params.assignedTo = assigneeFilter;
        }

        dispatch(fetchTasks(params));
    }, [dispatch, activeTab, dateRange, statusFilter, textFilter, assigneeFilter, user]);

    const fetchCalendarForMonth = React.useCallback((month: Date) => {
        const params: any = {
            startDate: format(startOfMonth(month), "yyyy-MM-dd"),
            endDate: format(endOfMonth(month), "yyyy-MM-dd"),
        };

        if (activeTab === "Admin") {
            params.assignedTo = user?._id;
        } else {
            params.type = "Team";
            if (assigneeFilter !== "all") params.assignedTo = assigneeFilter;
        }

        dispatch(fetchCalendarData(params));
    }, [dispatch, activeTab, user, assigneeFilter]);

    useEffect(() => { fetchCalendarForMonth(calendarMonth); }, [calendarMonth, fetchCalendarForMonth]);
    useEffect(() => { fetchCurrentTasks(); }, [fetchCurrentTasks]);

    useEffect(() => {
        dispatch(fetchTeam());
        dispatch(fetchClients());
        dispatch(fetchAdmins());
        dispatch(fetchOptionSets());
    }, [dispatch]);

    const getDayAnalytics = (day: Date) => {
        const dateStr = format(day, "yyyy-MM-dd");
        return calendarData?.[dateStr] || null;
    };

    // Helper to safely get ID from string or object
    const getId = (field: any) => {
        if (!field) return "";
        return typeof field === "object" ? field._id : field;
    };

    const handleSave = async (data: any) => {
        try {
            if (activeTab === "Admin" && !data.assignedTo && user?._id) data.assignedTo = user._id;

            // Normalize (might be objects from population)
            if (data.assignedTo) data.assignedTo = getId(data.assignedTo);
            if (data.client) data.client = getId(data.client);

            if (currentTask?._id) {
                await dispatch(updateTask({ _id: currentTask._id, data })).unwrap();
                toast.success("Task updated successfully");
            } else {
                await dispatch(createTask(data)).unwrap();
                toast.success("Task created successfully");
            }
            setDialogOpen(false);
            fetchCurrentTasks();
        } catch (error: any) {
            toast.error(error.message || "Failed to save task");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure?")) {
            try {
                await dispatch(deleteTask(id)).unwrap();
                toast.success("Task deleted");
            } catch (error) {
                toast.error("Delete failed");
            }
        }
    };

    const AnalyticsSidebar = () => (
        <div className="w-full xl:w-[320px] flex flex-col gap-4">
            <div className="hidden xl:block">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <CalendarIcon size={14} className="text-primary" /> Task Calendar
                    </span>
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                </div>
                <Calendar
                    mode="single"
                    selected={dateRange?.from}
                    onSelect={(date) => date && setDateRange({ from: date, to: date })}
                    month={calendarMonth}
                    onMonthChange={(month) => {
                        setCalendarMonth(month);
                        fetchCalendarForMonth(month);
                    }}
                    className="rounded-xl border shadow-sm bg-card w-full p-3"
                    components={{
                        DayButton: (props) => {
                            const { day } = props;
                            const analytics = getDayAnalytics(day.date);
                            return (
                                <CalendarDayButton {...props}>
                                    <div className="relative flex h-full w-full items-center justify-center">
                                        <span>{day.date.getDate()}</span>
                                        {analytics && (
                                            <div className="absolute bottom-1">
                                                <div className="h-1 w-1 rounded-full" style={{ backgroundColor: analytics.color }} />
                                            </div>
                                        )}
                                    </div>
                                </CalendarDayButton>
                            );
                        }
                    }}
                />
            </div>

            {/* Quick Summary Card */}
            <div className="p-5 rounded-xl border bg-card shadow-sm space-y-4">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Selected Day Analytics</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/40 rounded-lg">
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">Total</p>
                        <p className="text-xl font-black">{getDayAnalytics(dateRange?.from || new Date())?.total || 0}</p>
                    </div>
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                        <p className="text-[9px] text-emerald-600 uppercase font-bold text-center">Done</p>
                        <p className="text-xl font-black text-emerald-600 text-center">{getDayAnalytics(dateRange?.from || new Date())?.completed || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const columns = useMemo(() => getTaskColumns({
        onEdit: (t) => { setCurrentTask(t); setDialogOpen(true); },
        onView: (t) => { setCurrentTask(t); setViewDialogOpen(true); },
        onDelete: handleDelete,
        onStatusChange: async (id, status) => {
            await dispatch(updateTaskStatus({ id, status })).unwrap();
            toast.success("Status updated");
        },
        statusOptions,
        canManage: activeTab === "Team"
    }), [statusOptions, activeTab, dispatch]);

    const table = useReactTable({ data: tasks, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 min-h-screen">
            <div className="flex flex-col gap-6">

                {/* Header Section */}
                <div className="flex items-center justify-between border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tasks Management</h1>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">Monitor and manage team productivity.</p>
                    </div>
                    {activeTab === "Team" && (
                        <Button onClick={() => { setCurrentTask(null); setDialogOpen(true); }} size="sm" className="gap-2 shadow-lg">
                            <Plus size={16} /> New Team Task
                        </Button>
                    )}
                </div>

                {/* Mobile Calendar (Visible < xl) */}
                <div className="xl:hidden">
                    <CustomMobileCalendar
                        date={dateRange?.from}
                        onSelect={(date) => setDateRange({ from: date, to: date })}
                        onMonthChange={(month) => {
                            setCalendarMonth(month);
                            fetchCalendarForMonth(month);
                        }}
                        getAnalytics={getDayAnalytics}
                    />
                </div>

                {/* Tabs & Filters */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col xl:overflow-hidden">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                        <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex w-full md:w-auto">
                            <TabsTrigger value="Admin" className="flex-1 px-6 py-2 rounded-lg data-[state=active]:shadow-sm">Admin Tasks</TabsTrigger>
                            <TabsTrigger value="Team" className="flex-1 px-6 py-2 rounded-lg data-[state=active]:shadow-sm">Team Tasks</TabsTrigger>
                        </TabsList>

                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <Select value={currentMonthValue} onValueChange={handleMonthSelect}>
                                <SelectTrigger className="w-full sm:w-[160px] h-9"><SelectValue placeholder="Month" /></SelectTrigger>
                                <SelectContent>{monthOptions.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[130px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    {statusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            {activeTab === "Team" && (
                                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                                    <SelectTrigger className="w-full sm:w-[150px] h-9"><SelectValue placeholder="Assignee" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Everyone</SelectItem>
                                        {teamMembers.map(m => (
                                            <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {(textFilter || statusFilter !== "all" || assigneeFilter !== "all") && (
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setTextFilter(""); setStatusFilter("all"); setAssigneeFilter("all");
                                    setDateRange({ from: new Date(), to: new Date() });
                                }} className="text-destructive h-9">
                                    <FilterX size={14} className="mr-1" /> Clear
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 rounded-xl border bg-card/50 overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    {table.getHeaderGroups().map(hg => (
                                        <TableRow key={hg.id}>{hg.headers.map(h => <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}</TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    <DataHandler
                                        loading={isLoading && tasks.length === 0}
                                        isEmpty={!isLoading && tasks.length === 0}
                                        variant="table-row"
                                        colSpan={columns.length}
                                        emptyText="No tasks found for this period."
                                    >
                                        {table.getRowModel().rows.map(row => (
                                            <TableRow key={row.id}>{row.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>
                                        ))}
                                    </DataHandler>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </Tabs>
            </div>

            <AnalyticsSidebar />

            <TaskDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSave}
                initialData={currentTask}
                defaultType={activeTab === "Admin" ? "Admin" : "Team"}
                teamMembers={teamMembers}
                clients={clients}
                admins={admins}
                isLoading={isLoading}
            />

            <ViewTaskDialog
                open={viewDialogOpen}
                onOpenChange={setViewDialogOpen}
                task={currentTask}
            />
        </div>
    );
}
