"use client";

import React, { useEffect } from "react";
import { isToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LayoutDashboard,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    Trophy,
    Briefcase,
    FileText,
    ShieldCheck
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchTasks } from "@/src/redux/slices/taskSlice";
import { fetchTeam } from "@/src/redux/slices/teamSlice";

export function AdminDashboard() {
    const dispatch = useAppDispatch();
    const { tasks, isLoading: tasksLoading } = useAppSelector((state) => state.tasks);
    const { members: teamMembers, isLoading: teamLoading } = useAppSelector((state) => state.team);

    useEffect(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

        dispatch(fetchTasks({
            startDate: start,
            endDate: end,
            limit: 1000
        }));
        dispatch(fetchTeam(undefined));
    }, [dispatch]);

    const stats = [
        {
            title: "Total Team Members",
            value: teamMembers.length,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100",
        },
        {
            title: "Total Tasks (Today)",
            value: tasks.filter((t: any) => t.dueDate && isToday(new Date(t.dueDate))).length,
            icon: LayoutDashboard,
            color: "text-indigo-600",
            bg: "bg-indigo-100",
        },
        {
            title: "Active Tasks (Today)",
            value: tasks.filter((t: any) => t.dueDate && isToday(new Date(t.dueDate)) && t.status !== "Completed" && t.status !== "Done").length,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-100",
        },
        {
            title: "Completed Tasks (Today)",
            value: tasks.filter((t: any) => t.dueDate && isToday(new Date(t.dueDate)) && (t.status === "Completed" || t.status === "Done")).length,
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-100",
        },
        {
            title: "Overdue Tasks",
            value: tasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Completed" && t.status !== "Done").length,
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-100",
        },
    ];

    const leaderboardData = React.useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return (teamMembers || []).map((member: any) => {
            const memberTasks = (tasks || []).filter((t: any) => {
                const assignedId = (typeof t.assignedTo === 'object' ? t.assignedTo?._id : t.assignedTo)?.toString();
                const taskDate = new Date(t.dueDate);
                return assignedId === member._id?.toString() &&
                    taskDate.getMonth() === currentMonth &&
                    taskDate.getFullYear() === currentYear;
            });

            const total = memberTasks.length;
            const completed = memberTasks.filter((t: any) => t.status === "Done").length;
            const percentage = total > 0 ? Number(((completed / total) * 100).toFixed(2)) : 0;

            return {
                id: member._id,
                name: member.name,
                total,
                completed,
                percentage
            };
        }).sort((a, b) => b.percentage - a.percentage); // Sort by performance
    }, [teamMembers, tasks]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back! Here's an overview of your team's performance and tasks.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <div className={`${stat.bg} ${stat.color} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className={stat.color === 'text-red-600' ? 'text-red-600' : 'text-green-600'}>
                                    <TrendingUp className="inline h-3 w-3 mr-1" />
                                    Updated just now
                                </span>
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-md bg-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold">Team Performance Leaderboard</CardTitle>
                        <Trophy className="h-5 w-5 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {leaderboardData.map((member: any) => {
                                return (
                                    <div key={member.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">
                                                    {member.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{member.name}</p>
                                                    <p className="text-[10px] text-slate-500">{member.completed} / {member.total} Tasks assigned this month</p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-black ${member.percentage >= 80 ? "text-emerald-600" : member.percentage >= 50 ? "text-amber-600" : "text-rose-600"}`}>
                                                {member.percentage}%
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${member.percentage >= 80 ? "bg-emerald-500" : member.percentage >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                                                style={{ width: `${member.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            {leaderboardData.length === 0 && (
                                <div className="text-center py-10 text-slate-400 italic text-sm">
                                    No team members found.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="col-span-3 space-y-4">
                    <Card className="border-none shadow-md bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Recent Activities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(tasks || []).slice(0, 4).map((task: any, i: number) => (
                                    <div key={i} className="flex items-center gap-4 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                        <div className={`h-2 w-2 rounded-full ${["Done", "Approved", "Posted", "Completed"].includes(task.status) ? "bg-emerald-500" : "bg-amber-500"}`} />
                                        <div className="flex-1 space-y-0.5">
                                            <p className="text-xs font-bold text-slate-900 truncate">{task.title}</p>
                                            <p className="text-[10px] text-slate-500">
                                                {task.assignedTo && typeof task.assignedTo === 'object' ? (task.assignedTo as any).name : 'Unassigned'}
                                            </p>
                                        </div>
                                        <Badge variant={["Done", "Approved", "Posted", "Completed"].includes(task.status) ? 'default' : 'outline'}>
                                            <span className="text-[9px]">{task.status}</span>
                                        </Badge>
                                    </div>
                                ))}
                                {tasks.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic text-center py-4">No recent activities.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Card
                            className="border-none shadow-md bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group"
                            onClick={() => window.location.href = '/admin/sop'}
                        >
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-primary">My SOP</p>
                                    <p className="text-[9px] text-muted-foreground">Procedures & Guides</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card
                            className="border-none shadow-md bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer group"
                            onClick={() => window.location.href = '/admin/rules'}
                        >
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                                <div className="p-2 bg-amber-500/10 rounded-full text-amber-600 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-amber-600">My Rules</p>
                                    <p className="text-[9px] text-muted-foreground">Rules & Regulations</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

        </div>
    );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode, variant?: "default" | "outline" | "secondary" }) {
    const variants = {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input bg-background",
        secondary: "bg-secondary text-secondary-foreground"
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold hover:opacity-80 transition-opacity ${variants[variant]}`}>
            {children}
        </span>
    );
}
