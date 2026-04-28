"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchTasksByTeamMember, updateTaskStatus } from "@/src/redux/slices/taskSlice";
import { fetchOptionSetByName } from "@/src/redux/slices/optionSetSlice";
import { getClientsByTeamMember } from "@/src/redux/slices/clientSlice";
import { TaskStats } from "./components/TaskStats";
import { TeamTaskCalendar } from "./components/TeamTaskCalendar";
import { TeamTaskTable } from "./components/TeamTaskTable";
import { useAuth } from "@/src/context/AuthContext";
import { DateRange } from "react-day-picker";
import { isSameDay, parseISO, startOfDay, isBefore } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE_CONFIG } from "@/lib/role-configuration";

export default function TeamTasksPage() {
    const { user } = useAuth();
    const dispatch = useAppDispatch();

    const { tasks, isLoading: tasksLoading } = useAppSelector(state => state.tasks);
    const { clients } = useAppSelector(state => state.clients);
    const { currentSet: statusSet } = useAppSelector(state => state.optionSet);

    // Default to Today for better UX
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: undefined
    });
    const [viewTask, setViewTask] = useState<any | null>(null);

    // Determine Role Variant
    const roleVariant = useMemo(() => {
        const spec = (user?.profile?.specialization || user?.specialization || "").toLowerCase().trim();
        if (spec.includes("design") || spec.includes("graphic") || spec.includes("art")) return "design";
        if (spec.includes("video") || spec.includes("edit")) return "video";
        if (spec.includes("marketing") || spec.includes("market")) return "marketing";
        if (spec.includes("web") || spec.includes("dev") || spec.includes("software")) return "web";
        return "default";
    }, [user]);

    // Get Config
    const roleConfig = ROLE_CONFIG[roleVariant] || ROLE_CONFIG['default'];
    const dashboardConfig = roleConfig.dashboard;
    const [activeTab, setActiveTab] = useState<string>(dashboardConfig.tabs[0]?.id || "design");

    // Update active tab if role changes
    useEffect(() => {
        if (dashboardConfig.tabs.length > 0) {
            setActiveTab(dashboardConfig.tabs[0].id);
        }
    }, [roleVariant]);

    // Initial Data Fetch
    useEffect(() => {
        const userId = user?._id || user?.id;
        if (userId) {
            dispatch(fetchTasksByTeamMember(userId));
            dispatch(getClientsByTeamMember(userId));

            const statusSetName = roleVariant !== "default" ? `task_status_${roleVariant}` : "task_status";
            dispatch(fetchOptionSetByName(statusSetName));
        }
    }, [dispatch, user, roleVariant]);

    const statusOptions = statusSet?.options || [];

    // --- HELPER: Filter Tasks by Date & Config ---
    const getTasksForTab = (tabConfig: any) => {
        if (!dateRange?.from) return tasks;

        const selectedDate = startOfDay(dateRange.from);

        return tasks.filter(task => {
            // 1. Filter by Task Category if defined
            if (tabConfig.filterCategory && task.taskCategory !== tabConfig.filterCategory) {
                return false;
            }

            // 2. Filter by Posting Date rules:
            // If tab expects posting dates, ONLY show tasks WITH posting dates
            if (tabConfig.showPostingDate && !task.postingDate) return false;
            // Only for tabs that explicitly flag it (e.g. Marketing Ads): exclude tasks that have a postingDate
            if (tabConfig.excludeTasksWithPostingDate && task.postingDate) return false;

            const relevantDateStr = tabConfig.showPostingDate ? task.postingDate : task.dueDate;
            if (!relevantDateStr) return false;

            const taskDate = startOfDay(parseISO(relevantDateStr));
            // Always show tasks on their specific selected date
            if (isSameDay(taskDate, selectedDate)) return true;

            return false;
        });
    };

    // Prepare data for the currently ACTIVE tab to show in stats
    const activeTabConfig = dashboardConfig.tabs.find(t => t.id === activeTab) || dashboardConfig.tabs[0];
    const activeTabTasks = getTasksForTab(activeTabConfig);

    return (
        <div className="min-h-screen bg-white font-sans space-y-8 pb-20">

            {/* Header & Stats */}
            <div className="flex flex-col xl:flex-row gap-8 items-start justify-between">
                <div className="shrink-0">
                    <h1 className="text-2xl font-bold tracking-tight mb-1">My Tasks</h1>
                    <p className="text-slate-500 text-sm font-semibold mt-1.5 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        {dateRange?.from ? "Daily View" : "All Tasks"}
                    </p>
                    {dateRange?.from && !(isSameDay(dateRange.from, new Date()) && !dateRange.to) && (
                        <Button variant="link" onClick={() => setDateRange({ from: new Date(), to: undefined })} className="text-primary p-0 h-auto text-xs font-bold uppercase tracking-wider mt-2 hover:no-underline hover:opacity-80">
                            Reset to Today
                        </Button>
                    )}
                </div>
                <div className="w-full xl:w-auto flex-1">
                    {/* Sync stats with the active tab */}
                    <TaskStats
                        tasks={activeTabTasks}
                        statusOptions={statusOptions}
                    />
                </div>
            </div>

            {/* Calendar */}
            <TeamTaskCalendar
                date={dateRange}
                setDate={setDateRange}
                tasks={tasks}
                statusOptions={statusOptions}
            />

            {/* DYNAMIC TABS */}
            <Tabs value={activeTab} className="w-full" onValueChange={(val) => setActiveTab(val)}>
                <TabsList className={`grid w-full mb-6 bg-slate-100 p-1`} style={{ gridTemplateColumns: `repeat(${dashboardConfig.tabs.length}, minmax(0, 1fr))` }}>
                    {dashboardConfig.tabs.map(tab => {
                        const count = getTasksForTab(tab).length;
                        return (
                            <TabsTrigger key={tab.id} value={tab.id} className="font-bold data-[state=active]:bg-red-700 data-[state=active]:text-white data-[state=active]:shadow-sm">
                                {tab.label} ({count})
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {dashboardConfig.tabs.map(tab => {
                    const tabTasks = getTasksForTab(tab);

                    return (
                        <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-800">{tab.label} Tasks</h2>
                                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                    {tabTasks.length} Tasks
                                </Badge>
                            </div>

                            <TeamTaskTable
                                data={tabTasks}
                                onStatusChange={(id, status) => dispatch(updateTaskStatus({ id, status })).unwrap()}
                                onView={setViewTask}
                                statusOptions={statusOptions}
                                allowedStatuses={tab.statuses}
                                clients={clients}
                                isLoading={tasksLoading}
                                showPostingDate={tab.showPostingDate}
                                dateLabel={roleConfig.form.dueDateLabel}
                            />
                        </TabsContent>
                    );
                })}
            </Tabs>

            {/* View Modal */}
            <Dialog open={!!viewTask} onOpenChange={(o) => !o && setViewTask(null)}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col gap-1">
                    <DialogHeader />
                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto py-2 pr-1 space-y-4">
                        {/* Task Title */}
                        <div className="mb-2">
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-widest">
                                Task
                            </span>
                            <div className="text-lg font-bold bg-slate-50 px-3 py-2 rounded-md border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap max-h-[250px] overflow-y-auto">
                                {viewTask?.title || "-"}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-widest">
                                Description
                            </span>

                            <div className="bg-slate-50 px-3 py-2 rounded-md border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-[250px] overflow-y-auto">
                                {viewTask?.description ? (
                                    viewTask.description
                                ) : (
                                    <span className="text-slate-400 italic">No description provided.</span>
                                )}
                            </div>
                        </div>


                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                            {/* Client */}
                            <div className="flex items-center gap-2 p-2 rounded-lg">
                                <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">
                                    Client:
                                </span>
                                <span className="rounded-md text-sm text-slate-700 leading-relaxed">
                                    {typeof viewTask?.client === 'object' ? viewTask.client.businessName : "Internal"}
                                </span>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-2 p-2 rounded-lg">
                                <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">
                                    Status:
                                </span>
                                <span className="rounded-md text-sm text-slate-700 leading-relaxed">
                                    {viewTask?.status}
                                </span>
                            </div>

                            {/* Due Date */}
                            <div className="flex items-center gap-2 p-2 rounded-lg">
                                <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">
                                    Due Date:
                                </span>
                                <span className="rounded-md text-sm text-slate-700 leading-relaxed">
                                    {viewTask?.dueDate ? new Date(viewTask.dueDate).toLocaleDateString() : "-"}
                                </span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}