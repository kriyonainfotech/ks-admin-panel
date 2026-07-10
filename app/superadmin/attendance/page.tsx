"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchTeam } from "@/src/redux/slices/teamSlice";
import { attendanceService } from "@/src/services/attendanceService";
import { AttendanceLog } from "@/src/types/attendanceTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Check, X, Clock, Calendar as CalendarIcon, User as UserIcon, Trash2, Search, Filter, Pencil } from "lucide-react";
import { format, isSameDay, startOfWeek, isAfter, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AttendanceCalendar } from "./components/AttendanceCalendar";
import { Input } from "@/components/ui/input";
import { fetchAdmins, fetchSuperAdmins } from "@/src/redux/slices/adminSlice";
import { cn } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AttendancePage() {
    const dispatch = useAppDispatch();
    const { members, isLoading: teamLoading } = useAppSelector(state => state.team);
    const { admins, superadmins, isLoading: adminLoading } = useAppSelector(state => state.admin);
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [missingDates, setMissingDates] = useState<string[]>([]);

    // UI State
    const [activeRoleTab, setActiveRoleTab] = useState<"Team" | "Admin" | "Superadmin">("Team");
    const [selectedUserFilter, setSelectedUserFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Calendar State
    const [viewMode, setViewMode] = useState<"single" | "range">("single");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [dateRange, setDateRange] = useState<{ from: Date; to?: Date } | null>(null);
    const [calendarExceptions, setCalendarExceptions] = useState<{ _id: string, date: string, type: string, description?: string }[]>([]);

    // Confirmation & Update Dialog State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedUpdateLog, setSelectedUpdateLog] = useState<AttendanceLog | null>(null);
    const [editStartTime, setEditStartTime] = useState("");
    const [editEndTime, setEditEndTime] = useState("");
    const [pendingAction, setPendingAction] = useState<{ memberId: string, memberName: string, status: "Full Day" | "Half Day" | "Leave", date?: Date, userModel?: string } | null>(null);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            // Fetch all logs to ensure the calendar can show indicators for all days.
            // Client-side filtering will handle displaying the right day/range in the table.
            const data = await attendanceService.getAllAttendanceAPI();
            if (data.success) {
                setLogs(data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch attendance logs");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchExceptions = async () => {
        try {
            const data = await attendanceService.getCalendarExceptionsAPI();
            if (data.success) {
                setCalendarExceptions(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch exceptions", error);
        }
    };

    const fetchMissingDates = async () => {
        try {
            const data = await attendanceService.getMissingDatesAPI();
            if (data.success) {
                setMissingDates(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch missing dates", error);
        }
    };

    const refreshData = async () => {
        fetchLogs();
        fetchMissingDates();
    };

    useEffect(() => {
        dispatch(fetchTeam());
        dispatch(fetchAdmins());
        dispatch(fetchSuperAdmins());
        fetchExceptions();
        fetchMissingDates();
    }, [dispatch]);

    useEffect(() => {
        fetchLogs();
    }, [selectedDate.getMonth(), selectedDate.getFullYear(), viewMode]);

    const isWorkingDay = (date: Date) => {
        const day = date.getDay();
        const exception = calendarExceptions.find(ex => isSameDay(new Date(ex.date), date));

        if (day === 0) { // Sunday
            return exception?.type === "Working Sunday";
        }

        // Non-Sunday
        if (exception?.type === "Holiday") return false;
        return true;
    };

    // --- Computed Filtered Members based on Role Tab ---
    const currentMembers = useMemo(() => {
        let list = activeRoleTab === "Team" ? members : activeRoleTab === "Admin" ? admins : superadmins;

        // Filter by Search Query
        if (searchQuery) {
            list = list.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        // Filter by specific user if selected
        if (selectedUserFilter !== "all") {
            list = list.filter(m => m._id === selectedUserFilter);
        }

        return list;
    }, [activeRoleTab, members, admins, superadmins, searchQuery, selectedUserFilter]);

    // --- Computed Stats ---
    const stats = useMemo(() => {
        let periodLogs = logs;

        // Filter logs by the role of the users we are currently looking at
        const currentUserIds = new Set(currentMembers.map(m => String(m._id)));
        periodLogs = periodLogs.filter(log => {
            const userId = typeof log.user === 'string' ? log.user : log.user?._id;
            return userId && currentUserIds.has(String(userId));
        });

        // Filter by Date/Range
        if (viewMode === "single") {
            periodLogs = periodLogs.filter(log => isSameDay(startOfDay(new Date(log.date)), startOfDay(selectedDate)));
        } else if (viewMode === "range") {
            if (dateRange?.from && dateRange?.to) {
                // Both start and end dates selected
                periodLogs = periodLogs.filter(log => isWithinInterval(startOfDay(new Date(log.date)), {
                    start: startOfDay(dateRange.from as Date),
                    end: startOfDay(dateRange.to as Date)
                }));
            } else if (dateRange?.from && !dateRange?.to) {
                // Only start date selected (intermediate range state)
                periodLogs = periodLogs.filter(log => isSameDay(startOfDay(new Date(log.date)), startOfDay(dateRange.from)));
            } else {
                periodLogs = []; // No range selected at all
            }
        }

        const fullDayCount = periodLogs.filter(l => l.status === "Full Day").length;
        const halfDayCount = periodLogs.filter(l => l.status === "Half Day").length;
        const leaveCount = periodLogs.filter(l => l.status === "Leave").length;

        return {
            fullDay: fullDayCount,
            halfDay: halfDayCount,
            leaves: leaveCount,
            totalPresent: fullDayCount + halfDayCount
        };
    }, [logs, currentMembers, selectedDate, dateRange, viewMode]);

    const consolidatedLogs = useMemo(() => {
        const currentUserIds = new Set(currentMembers.map(m => String(m._id)));
        let filtered = logs.filter(log => {
            const userId = typeof log.user === 'string' ? log.user : log.user?._id;
            return userId && currentUserIds.has(String(userId));
        });

        if (viewMode === "single") {
            filtered = filtered.filter(log => isSameDay(startOfDay(new Date(log.date)), startOfDay(selectedDate)));
        } else if (viewMode === "range") {
            if (dateRange?.from && dateRange?.to) {
                filtered = filtered.filter(log => isWithinInterval(startOfDay(new Date(log.date)), {
                    start: startOfDay(dateRange.from as Date),
                    end: startOfDay(dateRange.to as Date)
                }));
            } else if (dateRange?.from && !dateRange?.to) {
                filtered = filtered.filter(log => isSameDay(startOfDay(new Date(log.date)), startOfDay(dateRange.from)));
            } else {
                filtered = [];
            }
        }

        return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [logs, currentMembers, selectedDate, dateRange, viewMode]);

    // Logs filtered for the calendar markers to match the active tab
    const calendarLogs = useMemo(() => {
        const currentUserIds = new Set(currentMembers.map(m => String(m._id)));
        return logs.filter(log => {
            const userId = typeof log.user === 'string' ? log.user : log.user?._id;
            return userId && currentUserIds.has(String(userId));
        });
    }, [logs, currentMembers]);

    const handleMarkAttendance = async (userId: string, status: "Full Day" | "Half Day" | "Leave", date: Date = selectedDate) => {
        const member = [...members, ...admins, ...superadmins].find(m => String(m._id) === String(userId));

        // --- Robust Model Detection ---
        let userModel: 'Admin' | 'Team' | 'User' = 'Team';
        if (superadmins.some(m => String(m._id) === String(userId))) {
            userModel = 'User';
        } else if (admins.some(m => String(m._id) === String(userId))) {
            userModel = 'Admin';
        } else {
            const m = members.find(m => String(m._id) === String(userId));
            if (m && (m as any).source === 'UserModel') {
                userModel = 'User';
            } else {
                userModel = 'Team';
            }
        }

        setPendingAction({
            memberId: userId,
            memberName: member?.name || "Unknown",
            status,
            date,
            userModel
        });
        setIsConfirmOpen(true);
        setIsUpdateModalOpen(false);
    };

    const handleOpenUpdateModal = (log: AttendanceLog) => {
        setSelectedUpdateLog(log);
        setEditStartTime(log.startTime || "");
        setEditEndTime(log.endTime || "");
        setIsUpdateModalOpen(true);
    };

    const handleUpdateAttendance = async (status?: string) => {
        if (!selectedUpdateLog) return;
        
        try {
            const res = await attendanceService.updateAttendanceAPI(selectedUpdateLog._id, {
                status: status || selectedUpdateLog.status,
                startTime: editStartTime || undefined,
                endTime: editEndTime || undefined
            });
            if (res.success) {
                toast.success("Attendance updated successfully!");
                refreshData();
                setIsUpdateModalOpen(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update attendance");
        }
    };

    const handleClearAttendance = async () => {
        if (!selectedUpdateLog) return;
        
        try {
            const res = await attendanceService.deleteAttendanceAPI(selectedUpdateLog._id);
            if (res.success) {
                toast.success("Attendance cleared successfully!");
                refreshData();
                setIsUpdateModalOpen(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to clear attendance");
        }
    };

    const confirmMarkAttendance = async () => {
        if (!pendingAction) return;

        setIsConfirmOpen(false);
        try {
            const res = await attendanceService.markAttendanceManualAPI(
                pendingAction.memberId,
                pendingAction.status,
                pendingAction.date || selectedDate,
                pendingAction.userModel
            );
            if (res.success) {
                toast.success(`Marked ${pendingAction.memberName} as ${pendingAction.status} for ${format(pendingAction.date || selectedDate, "PP")}`);
                refreshData();
            }
        } finally {
            setPendingAction(null);
        }
    };

    const handleMarkAsWorkingSunday = async (date: Date) => {
        try {
            const res = await attendanceService.addCalendarExceptionAPI({
                date,
                type: "Working Sunday",
                description: "Manual override for workload"
            });
            if (res.success) {
                toast.success("Date set as Working Sunday!");
                fetchExceptions();
                refreshData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add exception");
        }
    };

    const handleDeleteException = async (id: string) => {
        try {
            const res = await attendanceService.deleteCalendarExceptionAPI(id);
            if (res.success) {
                toast.success("Exception removed");
                fetchExceptions();
            }
        } catch (error) {
            toast.error("Failed to remove exception");
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-center bg-card p-3 rounded-xl border border-border/50 shadow-sm gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2.5 rounded-lg text-primary hidden md:block">
                        <Check size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider leading-none">Time Tracker</span>
                        <span className="text-[10px] text-muted-foreground mt-1">Real-time attendance & oversight</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading || teamLoading || adminLoading} className="h-10 px-4 gap-2 shadow-sm font-semibold">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Sync Data
                    </Button>
                </div>
            </div>

            {/* Main Tabs Area */}
            <Tabs defaultValue="Team" className="flex flex-col gap-8" onValueChange={(val) => {
                setActiveRoleTab(val as any);
                setSelectedUserFilter("all");
            }}>
                <div className="space-y-4 shrink-0">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-2 sm:p-4 rounded-xl border shadow-sm">
                        <TabsList className="grid w-full md:w-[400px] grid-cols-3 h-10">
                            <TabsTrigger value="Superadmin" className="font-bold">Superadmins</TabsTrigger>
                            <TabsTrigger value="Admin" className="font-bold">Admins</TabsTrigger>
                            <TabsTrigger value="Team" className="font-bold">Team</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-10"
                                />
                            </div>
                            <Select value={selectedUserFilter} onValueChange={setSelectedUserFilter}>
                                <SelectTrigger className="w-full md:w-48 h-10 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="All Users" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All {activeRoleTab}s</SelectItem>
                                    {(activeRoleTab === "Team" ? members : activeRoleTab === "Admin" ? admins : superadmins).map(member => (
                                        <SelectItem key={member._id} value={member._id}>
                                            {member.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Grid-based Attendance Calendar */}
                    <AttendanceCalendar
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        dateRange={dateRange}
                        onRangeSelect={setDateRange}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        logs={calendarLogs}
                        exceptions={calendarExceptions}
                    />
                </div>

                <div className="mt-8 space-y-8">
                    <TabsContent value={activeRoleTab} className="m-0 space-y-6">
                        {/* Stats Summary Area */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="flex items-center gap-4 p-5 bg-card rounded-xl shadow-sm border border-border group hover:border-primary/50 transition-all">
                                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                    <Check className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Present</p>
                                    <h3 className="text-2xl font-black text-foreground leading-none">{stats.totalPresent}</h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-5 bg-card rounded-xl shadow-sm border border-border group hover:border-primary/50 transition-all">
                                <div className="h-12 w-12 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-700">
                                    <UserIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Full Days</p>
                                    <h3 className="text-2xl font-black text-foreground leading-none">{stats.fullDay}</h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-5 bg-card rounded-xl shadow-sm border border-border group hover:border-primary/50 transition-all">
                                <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Half Days</p>
                                    <h3 className="text-2xl font-black text-foreground leading-none">{stats.halfDay}</h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-5 bg-card rounded-xl shadow-sm border border-border group hover:border-primary/50 transition-all">
                                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                    <CalendarIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Leaves</p>
                                    <h3 className="text-2xl font-black text-foreground leading-none">{stats.leaves}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Logs Table */}
                        <Card className="rounded-lg border bg-card shadow-sm overflow-hidden border-none cursor-default">
                            <CardHeader className="bg-muted/30 border-b py-4">
                                <CardTitle className="text-lg font-bold flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-md">
                                        <UserIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    {viewMode === "single" ? `Marking for ${format(selectedDate, "PP")}` : "Attendance Data"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-muted/50 text-muted-foreground text-[10px] font-bold uppercase tracking-widest border-b">
                                            <tr>
                                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground">User Details</th>
                                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Timing Info</th>
                                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Daily Status</th>
                                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {viewMode === "single" ? (
                                                // SINGLE DAY VIEW (Marking Mode)
                                                !isWorkingDay(selectedDate) ? (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-20 text-center">
                                                            <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                                                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                                                    <Clock className="h-8 w-8" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-foreground font-bold text-lg">Non-Working Day</p>
                                                                    <p className="text-muted-foreground text-sm">Offices are closed on Sundays and Public Holidays.</p>
                                                                </div>
                                                                {selectedDate.getDay() === 0 && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="font-bold border-primary/20 hover:bg-primary/5 text-primary"
                                                                        onClick={() => handleMarkAsWorkingSunday(selectedDate)}
                                                                    >
                                                                        Mark as Working Sunday
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : currentMembers.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">No users found.</td>
                                                    </tr>
                                                ) : (
                                                    currentMembers.map((member) => {
                                                        const memberIdStr = String(member._id);
                                                        const attendance = logs.find(l => {
                                                            const userId = typeof l.user === 'string' ? l.user : l.user?._id;
                                                            return userId && String(userId) === memberIdStr && isSameDay(startOfDay(new Date(l.date)), startOfDay(selectedDate));
                                                        });
                                                        const status = attendance?.status || "Not Marked";

                                                        return (
                                                            <tr key={member._id} className="hover:bg-muted/30 transition-colors group">
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-10 w-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold">
                                                                            {member.name.substring(0, 2).toUpperCase()}
                                                                        </div>
                                                                        <div className="flex flex-col min-w-0">
                                                                            <p className="font-bold text-foreground text-sm truncate">{member.name}</p>
                                                                            <div className="flex items-center gap-2">
                                                                                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">{member.role}</p>
                                                                                <span className="text-[9px] text-muted-foreground/30">•</span>
                                                                                <p className="text-[9px] text-muted-foreground/60 font-medium lowercase tracking-tight truncate">{member.email}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-6">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[9px] font-black text-emerald-600 uppercase mb-0.5 tracking-wide">Clock In</span>
                                                                            <span className="text-xs font-bold tabular-nums text-foreground">{attendance?.startTime || "--:--"}</span>
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[9px] font-black text-rose-500 uppercase mb-0.5 tracking-wide">Clock Out</span>
                                                                            <span className="text-xs font-bold tabular-nums text-foreground">{attendance?.endTime || "--:--"}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className={cn(
                                                                            "font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 border-2 shadow-none",
                                                                            status === "Full Day" && "bg-emerald-50 text-emerald-600 border-emerald-200",
                                                                            status === "Half Day" && "bg-amber-50 text-amber-600 border-amber-200",
                                                                            status === "Leave" && "bg-rose-50 text-rose-600 border-rose-200",
                                                                            status === "Not Marked" && "bg-muted/50 text-muted-foreground border-transparent"
                                                                        )}
                                                                    >
                                                                        {status}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <div className="flex items-center justify-end gap-2 transition-opacity">
                                                                        {(() => {
                                                                            const isFutureDate = isAfter(startOfDay(selectedDate), startOfDay(new Date()));
                                                                            return (
                                                                                <>
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant={status === "Full Day" ? "default" : "outline"}
                                                                                        className={cn("h-8 text-[10px] font-bold px-3", status === "Full Day" ? "bg-emerald-600 hover:bg-emerald-700" : "hover:text-emerald-600")}
                                                                                        onClick={() => handleMarkAttendance(member._id, "Full Day")}
                                                                                        disabled={isFutureDate}
                                                                                        title={isFutureDate ? "Cannot mark attendance for future dates" : ""}
                                                                                    >
                                                                                        FULL
                                                                                    </Button>
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant={status === "Half Day" ? "default" : "outline"}
                                                                                        className={cn("h-8 text-[10px] font-bold px-3", status === "Half Day" ? "bg-amber-500 hover:bg-amber-600" : "hover:text-amber-600")}
                                                                                        onClick={() => handleMarkAttendance(member._id, "Half Day")}
                                                                                        disabled={isFutureDate}
                                                                                        title={isFutureDate ? "Cannot mark attendance for future dates" : ""}
                                                                                    >
                                                                                        HALF
                                                                                    </Button>
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant={status === "Leave" ? "default" : "outline"}
                                                                                        className={cn("h-8 text-[10px] font-bold px-3", status === "Leave" ? "bg-blue-500 hover:bg-blue-600" : "hover:text-blue-600")}
                                                                                        onClick={() => handleMarkAttendance(member._id, "Leave")}
                                                                                        disabled={isFutureDate}
                                                                                        title={isFutureDate ? "Cannot mark attendance for future dates" : ""}
                                                                                    >
                                                                                        LEAVE
                                                                                    </Button>
                                                                                    {attendance && (
                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant="ghost"
                                                                                            className="h-8 w-8 p-0 ml-2 text-muted-foreground hover:text-primary transition-opacity"
                                                                                            onClick={() => handleOpenUpdateModal(attendance)}
                                                                                        >
                                                                                            <Pencil className="h-4 w-4" />
                                                                                        </Button>
                                                                                    )}
                                                                                </>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )
                                            ) : (
                                                // RANGE VIEW (History Mode)
                                                consolidatedLogs.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground italic">No attendance records found for this range.</td>
                                                    </tr>
                                                ) : (
                                                    consolidatedLogs.map((log) => (
                                                        <tr key={log._id} className="hover:bg-muted/30 transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                                                                        {((typeof log.user === 'string' ? '?' : log.user?.name) || 'U').substring(0, 2).toUpperCase()}
                                                                    </div>
                                                                    <div className="flex flex-col min-w-0">
                                                                        <p className="text-xs font-bold text-foreground truncate">{(typeof log.user === 'string' ? 'User' : log.user?.name) || 'Unknown User'}</p>
                                                                        <p className="text-[10px] text-muted-foreground font-medium uppercase truncate tracking-tight">{(typeof log.user === 'string' ? 'Team' : log.user?.role) || 'Team'}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-6">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[9px] font-black text-emerald-600 uppercase mb-0.5 tracking-wide">Clock In</span>
                                                                        <span className="text-xs font-bold tabular-nums text-foreground">{log.startTime || "--:--"}</span>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[9px] font-black text-rose-500 uppercase mb-0.5 tracking-wide">Clock Out</span>
                                                                        <span className="text-xs font-bold tabular-nums text-foreground">{log.endTime || "--:--"}</span>
                                                                    </div>
                                                                    <div className="pl-4 border-l border-border/50">
                                                                        <span className="text-[10px] font-black text-muted-foreground uppercase">{format(new Date(log.date), "MMM dd")}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <Badge
                                                                    variant="secondary"
                                                                    className={cn(
                                                                        "font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 border-2 shadow-none",
                                                                        log.status === "Full Day" && "bg-emerald-50 text-emerald-600 border-emerald-200",
                                                                        log.status === "Half Day" && "bg-amber-50 text-amber-600 border-amber-200",
                                                                        log.status === "Leave" && "bg-rose-50 text-rose-600 border-rose-200"
                                                                    )}
                                                                >
                                                                    {log.status}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0 transition-opacity"
                                                                    onClick={() => handleOpenUpdateModal(log)}
                                                                >
                                                                    <Pencil className="h-4 w-4 text-primary" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Exceptions Area */}
                        {calendarExceptions.length > 0 && (
                            <Card className="rounded-lg border bg-card shadow-sm overflow-hidden mt-6">
                                <CardHeader className="bg-muted/30 border-b py-3">
                                    <CardTitle className="text-xs font-bold flex items-center gap-2 text-muted-foreground">
                                        <CalendarIcon className="h-4 w-4 text-primary" />
                                        Active Calendar Overrides
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="max-h-48 overflow-y-auto">
                                        <table className="w-full text-left text-[10px]">
                                            <tbody className="divide-y divide-border">
                                                {calendarExceptions.map((ex) => (
                                                    <tr key={ex._id} className="hover:bg-muted/30 transition-colors">
                                                        <td className="px-6 py-2 font-bold text-foreground">
                                                            {format(new Date(ex.date), "EEEE, MMM do")}
                                                        </td>
                                                        <td className="px-6 py-2">
                                                            <Badge variant="outline" className="text-[9px] bg-primary/5 text-primary border-primary/10 font-bold uppercase tracking-wider">
                                                                {ex.type}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-2 text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                                onClick={() => handleDeleteException(ex._id)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </div>
            </Tabs>

            {/* Confirmation Dialog */}
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent className="rounded-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Attendance</AlertDialogTitle>
                        <AlertDialogDescription>
                            Mark <strong>{pendingAction?.memberName}</strong> as <strong>{pendingAction?.status}</strong> for {pendingAction?.date ? format(new Date(pendingAction.date), "PPP") : format(selectedDate, "PPP")}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPendingAction(null)} className="rounded-md">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmMarkAttendance} className="bg-primary hover:bg-primary/90 rounded-md">
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Update Status Modal */}
            <AlertDialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Update Attendance</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update attendance details for <strong>{selectedUpdateLog?.user.name}</strong> on <strong>{selectedUpdateLog?.date ? format(new Date(selectedUpdateLog.date), "PPP") : ""}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Clock In Time</label>
                                <Input 
                                    type="time" 
                                    value={editStartTime}
                                    onChange={(e) => setEditStartTime(e.target.value)}
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Clock Out Time</label>
                                <Input 
                                    type="time" 
                                    value={editEndTime}
                                    onChange={(e) => setEditEndTime(e.target.value)}
                                    className="h-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                            <div className="grid grid-cols-3 gap-3">
                                {["Full Day", "Half Day", "Leave"].map((status) => (
                                    <Button
                                        key={status}
                                        variant={selectedUpdateLog?.status === status ? "default" : "outline"}
                                        className={cn(
                                            "h-10 font-bold transition-all text-xs",
                                            status === "Full Day" && "hover:bg-emerald-500/10 hover:text-emerald-600",
                                            status === "Half Day" && "hover:bg-amber-500/10 hover:text-amber-600",
                                            status === "Leave" && "hover:bg-blue-500/10 hover:text-blue-600",
                                            selectedUpdateLog?.status === status && "opacity-50 cursor-not-allowed"
                                        )}
                                        disabled={selectedUpdateLog?.status === status}
                                        onClick={() => handleUpdateAttendance(status)}
                                    >
                                        {status.split(' ')[0]}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <AlertDialogFooter className="flex items-center justify-between sm:justify-between">
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            className="font-bold flex items-center gap-2"
                            onClick={handleClearAttendance}
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear Record
                        </Button>
                        <div className="flex gap-2">
                            <AlertDialogCancel onClick={() => setSelectedUpdateLog(null)}>Cancel</AlertDialogCancel>
                            <Button 
                                onClick={() => handleUpdateAttendance()} 
                                className="bg-primary hover:bg-primary/90"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
