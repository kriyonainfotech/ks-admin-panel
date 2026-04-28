"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchTeam } from "@/src/redux/slices/teamSlice";
import { attendanceService } from "@/src/services/attendanceService";
import { AttendanceLog } from "@/src/types/attendanceTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Check, X, Clock, Calendar as CalendarIcon, Trash2, User as UserIcon, Filter, Search, ChevronDown, UserCircle2 } from "lucide-react";
import { format, isSameDay, startOfDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceCalendar } from "./components/AttendanceCalendar";
import { Input } from "@/components/ui/input";
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
    const { user } = useAuth();
    const { members, isLoading: teamLoading } = useAppSelector(state => state.team);
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [missingDates, setMissingDates] = useState<string[]>([]);

    // UI State
    const [activeTab, setActiveTab] = useState<"team" | "self">("team");
    const [selectedUserFilter, setSelectedUserFilter] = useState<string>("all");

    // Calendar State
    const [viewMode, setViewMode] = useState<"single" | "range">("single");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [dateRange, setDateRange] = useState<{ from: Date; to?: Date } | null>(null);
    const [calendarExceptions, setCalendarExceptions] = useState<{ _id: string, date: string, type: string, description?: string }[]>([]);

    // Confirmation Dialog State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ userId: string, userName: string, status: "Full Day" | "Half Day" | "Leave", date?: Date, userModel?: string } | null>(null);

    useEffect(() => {
        dispatch(fetchTeam());
        fetchExceptions();
        refreshData();
    }, [dispatch]);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
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

    const refreshData = async () => {
        fetchLogs();
        fetchMissingDates();
        fetchExceptions();
    };

    const handleMarkAttendance = (userId: string, userName: string, status: "Full Day" | "Half Day" | "Leave", date: Date, userModel: string) => {
        setPendingAction({ userId, userName, status, date, userModel });
        setIsConfirmOpen(true);
    };

    const handleMarkAsWorkingSunday = async (date: Date) => {
        try {
            const res = await attendanceService.addCalendarExceptionAPI({
                date,
                type: "Working Sunday",
                description: "Manual override by Admin"
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

    const confirmMarkAttendance = async () => {
        if (!pendingAction) return;

        try {
            const res = await attendanceService.markAttendanceManualAPI(
                pendingAction.userId,
                pendingAction.status,
                pendingAction.date,
                pendingAction.userModel
            );

            if (res.success) {
                toast.success(`Marked ${pendingAction.userName} as ${pendingAction.status}`);
                refreshData();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to mark attendance");
        } finally {
            setIsConfirmOpen(false);
            setPendingAction(null);
        }
    };

    const markAllPresent = async () => {
        const pendingMembers = members.filter(m => !logs.some(l => l.user._id === m._id && isSameDay(new Date(l.date), selectedDate)));

        if (pendingMembers.length === 0) return;

        setIsLoading(true);
        try {
            for (const member of pendingMembers) {
                await attendanceService.markAttendanceManualAPI(member._id, "Full Day", selectedDate, "Team");
            }
            toast.success(`Marked ${pendingMembers.length} members as Present`);
            refreshData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to mark all as present");
        } finally {
            setIsLoading(false);
        }
    };

    // Derived Data
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesUserFilter = selectedUserFilter === "all" || log.user._id === selectedUserFilter;

            // Filter by date
            const logDate = startOfDay(new Date(log.date));
            let matchesDate = false;
            if (viewMode === "single") {
                matchesDate = isSameDay(logDate, startOfDay(selectedDate));
            } else {
                if (!dateRange?.from) matchesDate = true;
                else if (!dateRange.to) matchesDate = isSameDay(logDate, startOfDay(dateRange.from));
                else {
                    matchesDate = logDate >= startOfDay(dateRange.from) && logDate <= startOfDay(dateRange.to);
                }
            }

            // Tabs filtering
            const matchesTab = activeTab === "self" ? log.user._id === user?._id : log.user._id !== user?._id;

            return matchesUserFilter && matchesDate && matchesTab;
        });
    }, [logs, selectedUserFilter, viewMode, selectedDate, dateRange, activeTab, user]);

    const pendingMembers = useMemo(() => {
        if (!isWorkingDay(selectedDate)) return [];
        return members.filter(m => !logs.some(l => l.user._id === m._id && isSameDay(new Date(l.date), selectedDate)));
    }, [members, logs, selectedDate, calendarExceptions]);

    return (
        <div className="flex flex-col h-full bg-background space-y-6">
            {/* Header - Horizontal Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border bg-card shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <CalendarIcon className="text-primary h-6 w-6" />
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-lg font-bold tracking-tight">Attendance</h1>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Reports & Tracking</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 flex-1 lg:justify-end">
                    {/* View Mode Switcher */}
                    <div className="flex bg-muted/50 p-1 rounded-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode("single")}
                            className={cn("h-8 text-xs font-bold px-3", viewMode === "single" ? "bg-card text-primary shadow-sm" : "text-muted-foreground")}
                        >
                            Single Day
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode("range")}
                            className={cn("h-8 text-xs font-bold px-3", viewMode === "range" ? "bg-card text-primary shadow-sm" : "text-muted-foreground")}
                        >
                            Range
                        </Button>
                    </div>

                    {/* Role Tab Switcher */}
                    <Tabs
                        value={activeTab}
                        onValueChange={(v: any) => {
                            setActiveTab(v);
                            setSelectedUserFilter("all");
                        }}
                        className="w-[180px]"
                    >
                        <TabsList className="grid w-full grid-cols-2 h-9 p-1 bg-muted/50 border border-border/50">
                            <TabsTrigger value="team" className="text-[10px] font-bold uppercase transition-all">Team</TabsTrigger>
                            <TabsTrigger value="self" className="text-[10px] font-bold uppercase transition-all">Me</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Member Filter Dropdown */}
                    <Select
                        value={selectedUserFilter}
                        onValueChange={(v) => {
                            setSelectedUserFilter(v);
                            if (v === user?._id) setActiveTab("self");
                            else if (v !== "all") setActiveTab("team");
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[200px] h-9 text-xs font-bold bg-card border-border/50 focus:ring-primary/20">
                            <div className="flex items-center gap-2 truncate">
                                <Filter size={14} className="text-muted-foreground shrink-0" />
                                <SelectValue placeholder="All Members" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            <SelectItem value="all" className="text-xs font-bold">All {activeTab === "self" ? "Admin" : "Team"}</SelectItem>
                            {user && (
                                <SelectItem value={user?._id} className="text-xs font-bold text-primary">
                                    {user.name} (Admin)
                                </SelectItem>
                            )}
                            <div className="my-1 h-px bg-muted" />
                            {members.map(member => (
                                <SelectItem key={member._id} value={member._id} className="text-xs">
                                    {member.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={refreshData}
                            disabled={isLoading}
                            className="h-9 font-bold text-xs shadow-sm hover:translate-y-[-1px] transition-transform"
                        >
                            <RefreshCw size={14} className={cn("mr-2", isLoading && "animate-spin")} />
                            Sync
                        </Button>
                    </div>
                </div>
            </div>

            {/* Calendar - Full Width */}
            <AttendanceCalendar
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                    setSelectedDate(date);
                    setViewMode("single");
                }}
                dateRange={dateRange}
                onRangeSelect={(range) => {
                    setDateRange(range);
                    if (range?.from && range?.to) setViewMode("range");
                }}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                logs={logs}
                exceptions={calendarExceptions}
            />

            {/* Bottom Row: Logs & Team Actions */}
            <div className="space-y-8">
                {/* Team Quick Attendance (Unmarked Members) */}
                {activeTab === "team" && viewMode === "single" && !isLoading && (
                    !isWorkingDay(selectedDate) ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border-2 border-dashed border-border/60 text-center animate-in fade-in duration-500">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
                                <Clock className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Non-Working Day</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mt-1">Offices are closed on Sundays and Public Holidays.</p>
                            {selectedDate.getDay() === 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-6 font-bold border-primary/20 hover:bg-primary/5 text-primary"
                                    onClick={() => handleMarkAsWorkingSunday(selectedDate)}
                                >
                                    Mark as Working Sunday
                                </Button>
                            )}
                        </div>
                    ) : pendingMembers.length > 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-amber-500/10 rounded-md">
                                        <UserCircle2 size={18} className="text-amber-600" />
                                    </div>
                                    <h3 className="text-sm font-bold tracking-tight">Pending Attendance</h3>
                                    <Badge variant="secondary" className="ml-2 bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-black">
                                        {pendingMembers.length} MISSING
                                    </Badge>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={markAllPresent}
                                    className="h-8 text-[10px] font-black uppercase text-emerald-600 border-emerald-200 hover:bg-emerald-50 bg-emerald-50/30"
                                >
                                    <Check size={14} className="mr-1.5" /> Mark All Present
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {pendingMembers.map(m => (
                                    <div key={m._id} className="p-4 rounded-xl border bg-card shadow-sm hover:shadow-md transition-all border-l-4 border-l-amber-500 group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold text-xs border border-primary/10">
                                                    {m.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-foreground truncate">{m.name}</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter truncate">{m.role}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 bg-emerald-50/50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/70 text-[10px] font-black transition-all active:scale-95"
                                                onClick={() => handleMarkAttendance(m._id, m.name, "Full Day", selectedDate, "Team")}
                                            >
                                                FULL
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 bg-amber-50/50 text-amber-600 border-amber-100 hover:bg-amber-100/70 text-[10px] font-black transition-all active:scale-95"
                                                onClick={() => handleMarkAttendance(m._id, m.name, "Half Day", selectedDate, "Team")}
                                            >
                                                HALF
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 bg-rose-50/50 text-rose-600 border-rose-100 hover:bg-rose-100/70 text-[10px] font-black transition-all active:scale-95"
                                                onClick={() => handleMarkAttendance(m._id, m.name, "Leave", selectedDate, "Team")}
                                            >
                                                LEAVE
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                )}

                {/* Logs Table */}
                <Card className="border shadow-md rounded-xl overflow-hidden bg-card">
                    <CardHeader className="py-4 border-b bg-muted/20 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Clock size={18} className="text-primary" />
                            {viewMode === "single"
                                ? `Attendance Logs: ${format(selectedDate, "MMM dd, yyyy")}`
                                : `Attendance Range: ${dateRange?.from ? format(dateRange.from, "MMM dd") : "..."} - ${dateRange?.to ? format(dateRange.to, "MMM dd") : "..."}`
                            }
                            <Badge variant="outline" className="ml-2 bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-black">
                                {filteredLogs.length} Records
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="h-[300px] flex flex-col items-center justify-center py-20 gap-3">
                                <RefreshCw className="animate-spin text-primary h-8 w-8" />
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading records...</p>
                            </div>
                        ) : filteredLogs.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground">User Details</th>
                                            <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Timing Info</th>
                                            <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Daily Status</th>
                                            {activeTab === "team" && viewMode === "single" && (
                                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-right">Adjust</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {filteredLogs.map((log) => (
                                            <tr key={log._id} className="hover:bg-muted/10 transition-colors group">
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                                                            {log.user.name.charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <p className="text-xs font-bold text-foreground truncate">{log.user.name}</p>
                                                            <p className="text-[10px] text-muted-foreground font-medium uppercase truncate tracking-tight">{log.user.role}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-emerald-600 uppercase mb-0.5 tracking-tighter">Clock In</span>
                                                            <span className="text-xs font-bold tabular-nums text-foreground">{log.startTime || "--:--"}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-rose-500 uppercase mb-0.5 tracking-tighter">Clock Out</span>
                                                            <span className="text-xs font-bold tabular-nums text-foreground">{log.endTime || "--:--"}</span>
                                                        </div>
                                                        {viewMode === "range" && (
                                                            <div className="pl-4 border-l border-border/50">
                                                                <span className="text-[10px] font-black text-muted-foreground uppercase">{format(new Date(log.date), "MMM dd")}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge
                                                        className={cn(
                                                            "text-[9px] uppercase font-black px-2.5 py-0.5 border-2 shadow-none",
                                                            log.status === "Full Day" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                                                log.status === "Half Day" ? "bg-amber-50 text-amber-600 border-amber-200" :
                                                                    "bg-rose-50 text-rose-600 border-rose-200"
                                                        )}
                                                    >
                                                        {log.status}
                                                    </Badge>
                                                </td>
                                                {activeTab === "team" && viewMode === "single" && (
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 text-amber-600 border-amber-200 hover:bg-amber-50 text-[10px] font-bold"
                                                                onClick={() => handleMarkAttendance(log.user._id, log.user.name, "Half Day", new Date(log.date), log.userModel)}
                                                            >
                                                                Half Day
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 text-rose-600 border-rose-200 hover:bg-rose-50 text-[10px] font-bold"
                                                                onClick={() => handleMarkAttendance(log.user._id, log.user.name, "Leave", new Date(log.date), log.userModel)}
                                                            >
                                                                Leave
                                                            </Button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <Search className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                <h3 className="text-sm font-bold text-foreground">No records found for this period</h3>
                                <p className="text-xs text-muted-foreground mt-1 max-w-sm font-medium">
                                    Use the "Pending" section above to mark attendance for team members who haven't clocked in.
                                </p>
                            </div>
                        )}
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

                {/* Historical Missing Dates Alert */}
                {/* {activeTab === "team" && missingDates.length > 0 && (
                    <div className="p-5 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center gap-6 animate-in zoom-in-95 duration-700">
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Clock size={28} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-lg font-black tracking-tight text-primary">Attention Required!</h3>
                            <p className="text-xs text-muted-foreground font-medium mt-1">
                                There are <span className="font-black text-foreground">{missingDates.length} dates</span> this year with zero attendance records for your team. Click a date to review and mark it.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                                {missingDates.slice(0, 10).map(date => (
                                    <Button 
                                        key={date} 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 text-[9px] font-black bg-background border hover:bg-primary hover:text-primary-foreground transition-all"
                                        onClick={() => {
                                            setSelectedDate(new Date(date));
                                            setViewMode("single");
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    >
                                        {format(new Date(date), "MMM dd")}
                                    </Button>
                                ))}
                                {missingDates.length > 10 && <span className="text-[10px] font-bold text-muted-foreground self-center">+{missingDates.length - 10} more</span>}
                            </div>
                        </div>
                    </div>
                )} */}
            </div>

            {/* Confirmation Modal */}
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent className="max-w-sm rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-bold">Confirm Attendance</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-medium">
                            Marking <span className="text-primary font-bold">{pendingAction?.userName}</span> as <span className="text-foreground font-bold underline underline-offset-4">{pendingAction?.status}</span> for <span className="font-bold">{pendingAction?.date && format(pendingAction.date, "MMM dd, yyyy")}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl h-10 text-xs font-bold">Dismiss</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmMarkAttendance}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 px-6 text-xs font-bold"
                        >
                            Mark Now
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
