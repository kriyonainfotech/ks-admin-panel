"use client";

import { useEffect, useState } from "react";
import {
    Users,
    DollarSign,
    Target,
    Wallet,
    Clock,
    Briefcase,
    ShieldCheck,
    UserCircle,
    Video,
    Palette,
    Megaphone,
    Calendar,
    ChevronRight,
    Search, TrendingUp,
    IndianRupee,
    Package, User,
    Layers,
    FileText,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFinancialStats, getTaskStats, getUserStats, FinancialStats, TaskStats, UserStats } from "@/lib/dashboardDataService";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAppSelector, useAppDispatch } from "@/src/redux/hooks";
import { RootState } from "@/src/redux/store";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchInventory } from "@/src/redux/slices/packageSlice";
import { fetchSopGroups } from "@/src/redux/slices/sopGroupSlice";
import { fetchSopPoints } from "@/src/redux/slices/sopPointSlice";
import { ChevronDown, Loader2 } from "lucide-react";

export default function DashboardPage() {
    const dispatch = useAppDispatch();
    const [financialStats, setFinancialStats] = useState<FinancialStats | null>(null);
    const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
    const [userStats, setUserStats] = useState<UserStats | null>(null);

    const [loadingFinancials, setLoadingFinancials] = useState(true);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const [activeTab, setActiveTab] = useState<string>("");
    const [allSopPoints, setAllSopPoints] = useState<any[]>([]);
    const [allSopPointsLoading, setAllSopPointsLoading] = useState(false);

    const { user } = useAppSelector((state: RootState) => state.auth);
    const { services, packages } = useAppSelector((state: RootState) => state.packages);
    const { groups: sopGroups, isLoading: sopLoading } = useAppSelector((state: RootState) => state.sopGroups);

    const activePackages = packages.filter((p: any) => !p.isArchived).length;
    const totalServiceItems = services.length;

    useEffect(() => {
        dispatch(fetchInventory());
    }, [dispatch]);

    useEffect(() => {
        if (user?._id) {
            dispatch(fetchSopGroups({ category: "sop", entityType: "superadmin", entityId: user._id }));
        }
    }, [dispatch, user?._id]);

    useEffect(() => {
        if (sopGroups.length === 0) return;
        setAllSopPointsLoading(true);
        dispatch(fetchSopPoints(sopGroups[0]._id)).unwrap()
            .then((res: any) => {
                setAllSopPoints(res.data ?? res);
            })
            .catch(() => setAllSopPoints([]))
            .finally(() => setAllSopPointsLoading(false));
    }, [sopGroups, dispatch]);

    useEffect(() => {
        getFinancialStats()
            .then(data => setFinancialStats(data))
            .catch(err => console.error("Failed to fetch financial stats", err))
            .finally(() => setLoadingFinancials(false));

        getUserStats()
            .then(data => setUserStats(data))
            .catch(err => console.error("Failed to fetch user stats", err))
            .finally(() => setLoadingUsers(false));

        getTaskStats()
            .then(data => {
                setTaskStats(data);
                if (data.superadminsList && data.superadminsList.length > 0) {
                    const currentUserStat = data.superadminsList.find((a: any) => a.email === user?.email);
                    setActiveTab(currentUserStat ? currentUserStat._id : data.superadminsList[0]._id);
                }
            })
            .catch(err => console.error("Failed to fetch task stats", err))
            .finally(() => setLoadingTasks(false));
    }, [user?.email]);

    return (
        <div className="flex-1 space-y-4 pb-8 px-2 sm:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 ">
                <div className="lg:col-span-8 flex flex-col gap-4">
                    {/* 2. ROW 1: PRIMARY FINANCIALS (4 CARDS) */}
                    {loadingFinancials ? (
                        <div className="grid gap-2 sm:gap-3 grid-cols-2">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[90px] sm:h-[110px] w-full rounded-xl" />)}
                        </div>
                    ) : financialStats ? (
                        <div className="grid gap-2 sm:gap-3 grid-cols-2 lg:grid-cols-2">
                            <MetricCardLarge
                                title="Total Funds Available"
                                value={formatCurrency(financialStats.financials.totalAvailableFunds)}
                                icon={IndianRupee}
                                color="blue"
                            />

                            <MetricCardLarge
                                title="Total Outstanding"
                                value={formatCurrency(financialStats.financials.totalOutstanding)}
                                icon={Clock}
                                color="amber"
                            />
                            <MetricCardLarge
                                title={`${format(new Date(), 'MMM')} Sales`}
                                value={formatCurrency(financialStats.financials.sales)}
                                icon={TrendingUp}
                                color="indigo"
                            />
                            <MetricCardLarge
                                title={`${format(new Date(), 'MMM')} Collection`}
                                value={formatCurrency(financialStats.financials.collection)}
                                icon={Wallet}
                                color="emerald"
                            />
                        </div>
                    ) : <div className="p-4 text-muted-foreground">Failed to load financial stats.</div>}

                    {/* 3. ROW 2: USER COUNTS (3 CARDS) */}
                    {loadingUsers ? (
                        <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[60px] sm:h-[75px] w-full rounded-xl" />)}
                        </div>
                    ) : userStats ? (
                        <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3">
                            <MetricCardSmall title="Total Clients" value={userStats.kpi.totalClients} icon={Briefcase} color="rose" />
                            <MetricCardSmall title="Packages" value={activePackages} icon={Package} color="violet" />
                            <MetricCardSmall title="Services" value={totalServiceItems} icon={Layers} color="amber" />
                        </div>
                    ) : <div className="p-4 text-muted-foreground">Failed to load user stats.</div>}

                    {/* 4. */}
                    {loadingUsers ? (
                        <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[60px] sm:h-[75px] w-full rounded-xl" />)}
                        </div>
                    ) : userStats ? (
                        <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3">
                            <MetricCardSmall title="Total Superadmin" value={userStats.kpi.totalSuperadmin} icon={User} color="rose" />
                            <MetricCardSmall title="Total Admins" value={userStats.kpi.totalAdmin} icon={User} color="violet" />
                            <MetricCardSmall title="Total Team" value={userStats.kpi.totalTeam} icon={User} color="amber" />
                        </div>
                    ) : <div className="p-4 text-muted-foreground">Failed to load user stats.</div>}

                </div>

                <div className="lg:col-span-4 flex flex-col h-full">
                    {/* 5. MY SOP */}
                    <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Daily Rituals
                    </h2>
                    {sopLoading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-5 w-full rounded-lg" />)}
                        </div>
                    ) : sopGroups.length === 0 ? (
                        <div className="flex items-center justify-center py-6 sm:py-10 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center h-full">
                            <div>
                                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-[10px] sm:text-sm font-medium text-muted-foreground italic">No SOPs defined.</p>
                            </div>
                        </div>
                    ) : (
                        /* Added 'h-full' to the container and 'max-h-[440px]' (approx height of left 3 rows). 
                           Using flex-1 and overflow-y-auto ensures it fills the space and scrolls.
                        */
                        <div className="rounded-xl border bg-white shadow-sm flex flex-col h-full max-h-[385px]">
                            <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3 custom-scrollbar">
                                {allSopPointsLoading ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    </div>
                                ) : allSopPoints.length === 0 ? (
                                    <p className="text-[10px] sm:text-xs text-muted-foreground italic text-center py-4">No SOP points available.</p>
                                ) : (
                                    <ul className="space-y-1.5 sm:space-y-2">
                                        {allSopPoints.map((point: any) => (
                                            <li key={point._id} className="flex gap-2 group/item">
                                                <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                                                <p className="text-[10px] sm:text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-wrap min-w-0 flex-1">
                                                    {point.content}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. TASK COLUMNS (Tabs on Mobile/Tablet, Grid on Desktop) */}
            {loadingTasks ? (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
                    {[...Array(1)].map((_, i) => <Skeleton key={i} className="h-[400px] w-full rounded-xl" />)}
                </div>
            ) : taskStats ? (
                <div className="space-y-6">
                    {/* Responsive Task Layout */}
                    <div className="lg:hidden">
                        <Tabs defaultValue="personal" className="w-full">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    Daily Tasks
                                </h2>
                                <TabsList className="h-8 bg-slate-100 p-1">
                                    <TabsTrigger value="personal" className="text-[10px] px-3 py-1">Personal</TabsTrigger>
                                    <TabsTrigger value="admin" className="text-[10px] px-3 py-1">Admin</TabsTrigger>
                                    <TabsTrigger value="team" className="text-[10px] px-3 py-1">Team</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="personal" className="mt-0">
                                <TaskColumnWrapper title="My Tasks" subtitle="(Today)" icon={Calendar} iconColor="text-primary">
                                    <PersonalTaskColumn taskStats={taskStats} user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
                                </TaskColumnWrapper>
                            </TabsContent>
                            <TabsContent value="admin" className="mt-0">
                                <TaskColumnWrapper title="Admin Tasks" subtitle="(Today)" icon={ShieldCheck} iconColor="text-blue-600">
                                    <AdminTaskColumn taskStats={taskStats} />
                                </TaskColumnWrapper>
                            </TabsContent>
                            <TabsContent value="team" className="mt-0">
                                <TaskColumnWrapper title="Team Tasks" subtitle="(Today)" icon={Users} iconColor="text-emerald-600">
                                    <TeamTaskColumn taskStats={taskStats} />
                                </TaskColumnWrapper>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="hidden lg:grid gap-6 grid-cols-3">
                        <TaskColumnWrapper title="My Tasks" subtitle="(Today)" icon={Calendar} iconColor="text-primary">
                            <PersonalTaskColumn taskStats={taskStats} user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
                        </TaskColumnWrapper>
                        <TaskColumnWrapper title="Admin Tasks" subtitle="(Today)" icon={ShieldCheck} iconColor="text-blue-600">
                            <AdminTaskColumn taskStats={taskStats} />
                        </TaskColumnWrapper>
                        <TaskColumnWrapper title="Team Tasks" subtitle="(Today)" icon={Users} iconColor="text-emerald-600">
                            <TeamTaskColumn taskStats={taskStats} />
                        </TaskColumnWrapper>
                    </div>
                </div>
            ) : <div className="p-4 text-muted-foreground">Failed to load task stats.</div>}

        </div>
    );
}

// --- SUB-COMPONENTS ---

function TaskColumnWrapper({ title, subtitle, icon: Icon, iconColor, children }: any) {
    return (
        <div className="flex flex-col gap-3">
            <div className="hidden lg:flex items-center gap-2">
                <Icon className={cn("h-4 w-4", iconColor)} />
                <h2 className="text-base font-bold text-slate-800">{title}</h2>
                <span className="text-muted-foreground font-medium text-xs">{subtitle}</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[450px] flex flex-col">
                {children}
            </div>
        </div>
    );
}

function PersonalTaskColumn({ taskStats, user, activeTab, setActiveTab }: any) {
    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-3 sm:px-4 pt-2 sm:pt-3 border-b border-slate-100">
                <TabsList className="bg-slate-100/50 p-0.5 sm:p-1 mb-2 w-full flex overflow-x-auto hide-scrollbar">
                    {taskStats.superadminsList?.slice().sort((a: any, b: any) => {
                        if (a.email === user?.email) return -1;
                        if (b.email === user?.email) return 1;
                        return 0;
                    }).map((admin: any) => (
                        <TabsTrigger key={admin._id} value={admin._id} className="flex-1 gap-1.5 text-[10px] sm:text-xs py-1 whitespace-nowrap px-2">
                            {admin.email === user?.email ? "Me" : admin.name?.split(" ")[0]}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
                {taskStats.superadminsList?.map((admin: any) => {
                    const adminTasks = taskStats.todayTasks.filter((t: any) => t.assignedTo?._id === admin._id);
                    return (
                        <TabsContent key={admin._id} value={admin._id} className="m-0 space-y-2 sm:space-y-3">
                            {adminTasks.length > 0 ? (
                                adminTasks.map((task: any) => (
                                    <TaskItem key={task._id} task={task} />
                                ))
                            ) : (
                                <EmptyState message={`No tasks for ${admin.email === user?.email ? 'you' : admin.name?.split(" ")[0]}`} />
                            )}
                        </TabsContent>
                    );
                })}
            </div>
        </Tabs>
    );
}

function AdminTaskColumn({ taskStats }: any) {
    return (
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
            {taskStats.allAdminTasks && taskStats.allAdminTasks.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                    {taskStats.allAdminTasks.map((task: any) => (
                        <TaskItem key={task._id} task={task} />
                    ))}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center py-10 text-center opacity-50">
                    <Search className="h-5 w-5 sm:h-6 sm:w-6 text-slate-300 mb-2" />
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground italic">No admin tasks</p>
                </div>
            )}
        </div>
    );
}

function TeamTaskColumn({ taskStats }: any) {
    return (
        <Tabs defaultValue="video" className="h-full flex flex-col">
            <div className="px-3 sm:px-4 pt-2 sm:pt-3 border-b border-slate-100">
                <TabsList className="bg-slate-100/50 p-0.5 sm:p-1 mb-2 w-full">
                    <TabsTrigger value="video" className="flex-1 gap-1.5 text-[10px] sm:text-xs py-1">
                        <Video className="h-3 w-3" /> Video
                    </TabsTrigger>
                    <TabsTrigger value="design" className="flex-1 gap-1.5 text-[10px] sm:text-xs py-1">
                        <Palette className="h-3 w-3" /> Design
                    </TabsTrigger>
                    <TabsTrigger value="marketing" className="flex-1 gap-1.5 text-[10px] sm:text-xs py-1">
                        <Megaphone className="h-3 w-3" /> Market
                    </TabsTrigger>
                </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
                <TabsContent value="video" className="m-0 space-y-2 sm:space-y-3">
                    <TeamTaskList
                        tasks={taskStats.allTeamTasks}
                        specialization="video"
                    />
                </TabsContent>
                <TabsContent value="design" className="m-0 space-y-2 sm:space-y-3">
                    <TeamTaskList
                        tasks={taskStats.allTeamTasks}
                        specialization="design"
                    />
                </TabsContent>
                <TabsContent value="marketing" className="m-0 space-y-2 sm:space-y-3">
                    <TeamTaskList
                        tasks={taskStats.allTeamTasks}
                        specialization="marketing"
                    />
                </TabsContent>
            </div>
        </Tabs>
    );
}

function MetricCardLarge({ title, value, icon: Icon, color, subtitle }: any) {
    const variants: any = {
        indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
        emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
        amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
        blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    };
    const v = variants[color];

    return (
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 min-h-[90px] sm:min-h-[110px] flex flex-col justify-center relative group hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start mb-1">
                <div className={cn("p-1 sm:p-1.5 rounded-md border", v.bg, v.border)}>
                    <Icon className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", v.text)} />
                </div>
                <div className="text-right">
                    <p className="text-[9px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{title}</p>
                </div>
            </div>
            <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight leading-tight truncate">{value}</div>
        </div>
    );
}

function MetricCardSmall({ title, value, icon: Icon, color }: any) {
    const variants: any = {
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        rose: "text-rose-600 bg-rose-50 border-rose-100",
        violet: "text-violet-600 bg-violet-50 border-violet-100",
        amber: "text-amber-600 bg-amber-50 border-amber-100",
    };

    return (
        <div className="bg-white rounded-xl p-2 sm:p-3 shadow-sm border border-slate-200 flex items-center gap-2 sm:gap-3 hover:shadow-md transition-shadow group min-h-[60px] sm:min-h-[75px]">
            <div className={cn("p-1 sm:p-1.5 rounded-md border group-hover:bg-opacity-80 transition-all", variants[color])}>
                <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[8px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">{title}</p>
                <p className="text-sm sm:text-lg font-black text-slate-900 mt-1 leading-none">{value}</p>
            </div>
        </div>
    );
}

function TaskItem({ task }: { task: any }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all cursor-default">
            <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-primary/30">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate leading-tight">{task.title}</p>
                    <StatusBadge status={task.status} />
                </div>
                <div className="flex items-center gap-2 mt-1 leading-none">
                    <span className="text-[9px] uppercase font-bold text-primary">
                        {task.client?.businessName || "No Client"}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-[9px] font-medium text-muted-foreground">
                        {task.dueDate ? format(new Date(task.dueDate), "MMM do") : ""}
                    </span>
                </div>
            </div>
        </div>
    );
}

function TeamTaskList({ tasks, specialization }: { tasks: any[], specialization: string }) {
    const filtered = tasks.filter(t => t.specialization === specialization);

    if (filtered.length === 0) return <EmptyState message={`No ${specialization} tasks`} />;

    return (
        <div className="space-y-2">
            {filtered.map((task) => (
                <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 group hover:border-slate-300 transition-all cursor-default">
                    <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-[10px] text-muted-foreground group-hover:text-primary group-hover:bg-primary/5">
                        {task.assignedTo?.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900 truncate leading-tight">{task.title}</p>
                            <StatusBadge status={task.status} />
                        </div>
                        <div className="flex items-center gap-2 mt-1 leading-none">
                            <span className="text-[9px] font-bold text-muted-foreground">
                                {task.assignedTo?.name || "Unassigned"}
                            </span>
                            <span className="text-slate-200">|</span>
                            <span className="text-[9px] font-medium text-slate-400">
                                {task.dueDate ? format(new Date(task.dueDate), "MMM do") : ""}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const getVariant = (s: string) => {
        const lower = s?.toLowerCase();
        if (lower === "pending" || lower === "to do") return "secondary";
        if (lower === "doing" || lower === "in progress") return "outline";
        if (lower === "done" || lower === "completed" || lower === "posted") return "default"; // "default" is solid colored in some themes, or "success" in others
        return "secondary";
    };

    // Helper for colors since generic shadcn badges might not have "success"
    const getStyle = (s: string) => {
        const lower = s?.toLowerCase();
        if (lower === "done" || lower === "completed" || lower === "posted")
            return "bg-emerald-50 text-emerald-700 border-emerald-100";
        if (lower === "doing" || lower === "in progress")
            return "bg-blue-50 text-blue-700 border-blue-100";
        return "bg-slate-50 text-slate-600 border-slate-100";
    };

    return (
        <span className={cn(
            "text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider border",
            getStyle(status)
        )}>
            {status || "No Status"}
        </span>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
            <Search className="h-6 w-6 text-slate-300 mb-2" />
            <p className="text-xs font-medium text-muted-foreground italic">{message}</p>
        </div>
    );
}

