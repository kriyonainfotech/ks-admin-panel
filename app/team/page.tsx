"use client"

import { useEffect, useMemo } from "react"
import { useAuth } from "@/src/context/AuthContext"
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks"
import { fetchTasksByTeamMember } from "@/src/redux/slices/taskSlice"
import { getClientsByTeamMember } from "@/src/redux/slices/clientSlice"
import { fetchOptionSetByName } from "@/src/redux/slices/optionSetSlice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    CheckCircle2,
    Clock,
    ListTodo,
    ArrowRight,
    AlertCircle,
    Calendar,
    Briefcase,
    Building2,
    MoreHorizontal,
    LayoutDashboard,
    Loader2,
    Zap,
    Trophy
} from "lucide-react"

import { isPast, isToday } from "date-fns"
// import AttendanceQR from "@/components/attendance/AttendanceQR"
import { getAttendanceStatus, clockIn, clockOut } from "@/src/redux/slices/attendanceSlice"
import { fetchWalletStats } from "@/src/redux/slices/salarySlice"
import { toast } from "sonner"
import { WalletCard } from "./components/WalletCard"
import Link from "next/link"

export default function TeamPage() {
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    // ... (rest of imports/logic)

    // ... (inside component)
    {/* Attendance Scanner Removed */ }

    // Select from Redux
    const { tasks, isLoading: tasksLoading } = useAppSelector(state => state.tasks);
    const { clients, isLoading: clientsLoading } = useAppSelector(state => state.clients);
    const { wallet, isLoading: walletLoading } = useAppSelector(state => state.salary);
    const { status: attendanceStatus, isLoading: attendanceLoading } = useAppSelector(state => state.attendance);

    // 1. Fetch data on mount
    useEffect(() => {
        const userId = user?._id || user?.id;
        if (userId) {
            dispatch(fetchTasksByTeamMember(userId));
            dispatch(getClientsByTeamMember(userId));
            dispatch(getAttendanceStatus());
            dispatch(fetchWalletStats());

            const specialization = (user?.profile?.specialization || user?.specialization)?.toLowerCase();
            const variant = specialization === "designer" ? "design" : specialization;
            const statusSetName = variant ? `task_status_${variant}` : "task_status";
            dispatch(fetchOptionSetByName(statusSetName));
        }
    }, [dispatch, user]);

    // 2. Computed Stats
    const stats = useMemo(() => {
        const total = tasks.length;
        const completedCount = tasks.filter(t => ["Done", "Approved", "Posted"].includes(t.status)).length;
        const overdueCount = tasks.filter(t =>
            (isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))) &&
            !["Done", "Approved", "Posted"].includes(t.status)
        ).length;
        const pendingCount = tasks.filter(t => !["Done", "Approved", "Posted"].includes(t.status)).length;

        return { total, overdue: overdueCount, pending: pendingCount, completed: completedCount };
    }, [tasks]);

    // Performance Stats (Separated to stabilize dates)
    const performanceStats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Daily Stats
        const dailyTasks = tasks.filter(t => isToday(new Date(t.dueDate)));
        const dailyTotal = dailyTasks.length;
        const dailyDone = dailyTasks.filter(t => t.status === "Done").length;
        const dailyPercentage = dailyTotal > 0 ? Number(((dailyDone / dailyTotal) * 100).toFixed(2)) : 0;

        // Monthly Stats (Current Month)
        const monthlyTasks = tasks.filter(t => {
            const d = new Date(t.dueDate);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        const monthlyTotal = monthlyTasks.length;
        const monthlyDone = monthlyTasks.filter(t => t.status === "Done").length;
        const monthlyPercentage = monthlyTotal > 0 ? Number(((monthlyDone / monthlyTotal) * 100).toFixed(2)) : 0;

        return { dailyPercentage, monthlyPercentage };
    }, [tasks]);


    // 3. TODAY'S TASKS (Filtered strictly for today)
    const todaysTasks = useMemo(() => {
        return tasks.filter(t => isToday(new Date(t.dueDate)));
    }, [tasks]);


    const isLoading = tasksLoading || clientsLoading;

    if (isLoading && tasks.length === 0) {
        return <TeamPageSkeleton />
    }

    return (
        <div className="flex flex-col gap-5 max-w-7xl mx-auto min-h-screen">

            {/* 1. Compact Header */}
            <div className="flex items-center justify-between px-6">
                <div className="flex items-center gap-3 ">
                    <div className="p-2 bg-slate-100 rounded-lg">
                        <LayoutDashboard className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-tight">Overview</h1>
                        <p className="text-xs text-slate-500 font-medium">Welcome back, {user?.name}</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <Button asChild variant="outline" size="sm" className="h-9 text-xs">
                        <Link href="/team/profile">Profile</Link>
                    </Button>
                </div>
            </div>

            {/* Attendance Action Bar */}
            <div className="px-6">
                <Card className="border-none shadow-md bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Clock className="h-24 w-24" />
                    </div>
                    <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${attendanceStatus.data?.startTime && !attendanceStatus.data?.endTime ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-slate-300"}`}>
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">
                                    {attendanceStatus.data?.startTime && !attendanceStatus.data?.endTime
                                        ? "Currently on Duty"
                                        : attendanceStatus.data?.endTime
                                            ? "Shift Ended"
                                            : "Not Clocked In"}
                                </h3>
                                <p className="text-xs text-slate-400 font-medium">
                                    {attendanceStatus.data?.startTime
                                        ? `Started at ${attendanceStatus.data.startTime}${attendanceStatus.data.endTime ? ` • Ended at ${attendanceStatus.data.endTime}` : ""}`
                                        : "Start your daily attendance by clocking in."}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {!attendanceStatus.data?.startTime ? (
                                <Button
                                    onClick={() => dispatch(clockIn()).unwrap().then(() => toast.success("Clocked in successfully!"))}
                                    disabled={attendanceLoading}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white border-none h-11 px-8 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20 w-full md:w-auto"
                                >
                                    {attendanceLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                    Clock In Now
                                </Button>
                            ) : !attendanceStatus.data?.endTime ? (
                                <Button
                                    onClick={() => dispatch(clockOut()).unwrap().then(() => toast.success("Clocked out successfully!"))}
                                    disabled={attendanceLoading}
                                    variant="outline"
                                    className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-11 px-8 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 w-full md:w-auto"
                                >
                                    {attendanceLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                    Clock Out
                                </Button>
                            ) : (
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-4 py-2 rounded-lg font-bold text-sm">
                                    Attendance Marked
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance Scanner Removed */}

            {/* Performance Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-6">
                <PerformanceCard
                    title="Daily Performance"
                    percentage={performanceStats.dailyPercentage}
                    icon={<Zap className="h-5 w-5 text-amber-500" />}
                    subtitle="Tasks completed today vs assigned"
                />
                <PerformanceCard
                    title="Monthly Performance"
                    percentage={performanceStats.monthlyPercentage}
                    icon={<Trophy className="h-5 w-5 text-indigo-500" />}
                    subtitle="Current month's completion rate"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Wallet Card - Takes up 1 column on md+ */}
                <div className="md:col-span-1">
                    {wallet ? (
                        <WalletCard data={wallet} isLoading={walletLoading} />
                    ) : (
                        <Card className="h-full border-slate-200 shadow-sm flex items-center justify-center p-6 text-center text-slate-400 text-xs italic bg-white">
                            No salary data configured.
                        </Card>
                    )}
                </div>

                {/* Stats Row - Spans 2 columns on md+ */}
                <div className="md:col-span-2 grid grid-cols-2 gap-3 h-full content-start">
                    <StatCardCompact
                        title="Total Assigned"
                        value={stats.total}
                        icon={<ListTodo className="h-4 w-4" />}
                        color="text-blue-600"
                        bg="bg-blue-50/50"
                    />
                    <StatCardCompact
                        title="Pending"
                        value={stats.pending}
                        icon={<Clock className="h-4 w-4" />}
                        color="text-amber-600"
                        bg="bg-amber-50/50"
                    />
                    <StatCardCompact
                        title="Overdue"
                        value={stats.overdue}
                        icon={<AlertCircle className="h-4 w-4" />}
                        color="text-rose-600"
                        bg="bg-rose-50/50"
                        isAlert={stats.overdue > 0}
                    />
                    <StatCardCompact
                        title="Completed"
                        value={stats.completed}
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        color="text-emerald-600"
                        bg="bg-emerald-50/50"
                    />
                </div>
            </div>

            {/* 3. Main Content: Today's Tasks & Clients */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 h-full">

                {/* Left: Today's Tasks */}
                <Card className="xl:col-span-2 shadow-sm border-slate-200 bg-white h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between py-4 px-5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                            <CardTitle className="text-base font-bold text-slate-900">Today&apos;s Tasks</CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-[10px] h-5 px-2 font-medium bg-slate-100 text-slate-600">
                            {todaysTasks.length} Tasks
                        </Badge>
                    </CardHeader>

                    <CardContent className="p-0 flex-1">
                        {todaysTasks.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                                {todaysTasks.map((task) => {
                                    const isDone = ["Done", "Approved", "Posted"].includes(task.status);
                                    return (
                                        <div key={task._id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group">
                                            {/* Minimal Status Indicator */}
                                            <div className={`w-1 self-stretch rounded-full ${isDone ? "bg-emerald-400" : "bg-amber-400"}`} />

                                            <div className="flex-1 min-w-0 space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm font-semibold truncate ${isDone ? "text-slate-400 line-through" : "text-slate-900"}`}>
                                                        {task.title}
                                                    </p>
                                                    <Badge variant="outline" className={`text-[10px] py-0 h-4 border-slate-200 ${isDone ? "text-emerald-600 bg-emerald-50" : "text-slate-500"}`}>
                                                        {task.status}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Briefcase className="h-3 w-3" />
                                                        {typeof task.client === 'object' ? task.client.businessName : "Internal"}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                                                <Link href={`/team/mytasks?view=${task._id}`}>
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-center">
                                <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <Calendar className="h-6 w-6 text-slate-300" />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-900">No tasks for today</h3>
                                <p className="text-xs text-slate-500 mt-1">You are all clear for the day.</p>
                            </div>
                        )}
                    </CardContent>

                    <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
                        <Link href="/team/mytasks" className="text-xs font-medium text-slate-600 hover:text-primary transition-colors flex items-center justify-center gap-1">
                            View Full Calendar <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </Card>

                {/* Right: Assigned Clients (Compact List) */}
                {/* <Card className="shadow-sm border-slate-200 bg-white h-full flex flex-col">
                    <CardHeader className="py-4 px-5 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold text-slate-900">My Clients</CardTitle>
                            <Building2 className="h-4 w-4 text-slate-400" />
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <div className="max-h-[400px] xl:max-h-[calc(100vh-350px)] overflow-y-auto custom-scrollbar">
                            {clients.length > 0 ? (
                                <div className="divide-y divide-slate-50">
                                    {clients.map((client) => (
                                        <div key={client.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors group">
                                            <div className="h-8 w-8 shrink-0 rounded bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600">
                                                {client.businessName ? client.businessName.substring(0, 2).toUpperCase() : "CL"}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-900 truncate">
                                                    {client.businessName}
                                                </p>
                                                <p className="text-[10px] text-slate-500 truncate">
                                                    {client.industry || "General"}
                                                </p>
                                            </div>

                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="h-3 w-3 text-slate-400" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-xs italic">
                                    No clients assigned.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card> */}

            </div>
        </div>
    )
}

// Performance Card with Progress Bar
function PerformanceCard({ title, percentage, icon, subtitle }: any) {
    return (
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg">
                            {icon}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                            <p className="text-[10px] text-slate-500 font-medium">{subtitle}</p>
                        </div>
                    </div>
                    <span className="text-2xl font-black text-slate-900">{percentage}%</span>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ease-out ${percentage >= 80 ? "bg-emerald-500" :
                            percentage >= 50 ? "bg-amber-500" : "bg-rose-500"
                            }`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <div className="flex justify-between mt-2">
                    <span className="text-[10px] font-bold text-slate-400">0%</span>
                    <span className="text-[10px] font-bold text-slate-400">100%</span>
                </div>
            </CardContent>
        </Card>
    )
}

// Slim Stat Card
function StatCardCompact({ title, value, icon, color, bg, isAlert }: any) {
    return (
        <Card className="border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow py-0 px-3">
            <CardContent className="p-3 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        {title}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <span className={`text-xl font-black ${isAlert ? "text-rose-600" : "text-slate-900"}`}>
                            {value}
                        </span>
                    </div>
                </div>
                <div className={`p-2 rounded-lg ${bg} ${color}`}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    )
}

// Skeleton Loader
function TeamPageSkeleton() {
    return (
        <div className="flex flex-col gap-5 p-6 max-w-7xl mx-auto">
            <div className="h-16 bg-white rounded-xl border border-slate-200 animate-pulse" />
            <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 bg-white rounded-lg border border-slate-200 animate-pulse" />
                ))}
            </div>
            <div className="grid grid-cols-3 gap-5">
                <div className="col-span-2 h-96 bg-white rounded-xl border border-slate-200 animate-pulse" />
                <div className="h-96 bg-white rounded-xl border border-slate-200 animate-pulse" />
            </div>
        </div>
    )
}