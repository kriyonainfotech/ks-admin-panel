"use client";

import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LayoutDashboard,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchTasks } from "@/src/redux/slices/taskSlice";
import { fetchTeam } from "@/src/redux/slices/teamSlice";

export function AdminDashboard() {
    const dispatch = useAppDispatch();
    const { tasks, isLoading: tasksLoading } = useAppSelector((state) => state.tasks);
    const { members: teamMembers, isLoading: teamLoading } = useAppSelector((state) => state.team);

    useEffect(() => {
        dispatch(fetchTasks({}));
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
            title: "Active Tasks",
            value: tasks.filter((t: any) => t.status !== "Completed" && t.status !== "Done").length,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-100",
        },
        {
            title: "Completed Tasks",
            value: tasks.filter((t: any) => t.status === "Completed" || t.status === "Done").length,
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-100",
        },
        {
            title: "Overdue Tasks",
            value: tasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Completed").length,
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-100",
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back! Here's an overview of your team's performance and tasks.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                {/* <Card className="col-span-4 border-none shadow-md">
                    <CardHeader>
                        <CardTitle>Team Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg m-4">
                        <p className="text-muted-foreground italic">Performance Chart Placeholder (Recharts)</p>
                    </CardContent>
                </Card> */}
                {/* <Card className="col-span-3 border-none shadow-md">
                    <CardHeader>
                        <CardTitle>Recent Team Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {tasks.slice(0, 5).map((task: any, i: number) => (
                                <div key={i} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Assigned to: {task.assignedTo && typeof task.assignedTo === 'object' ? (task.assignedTo as any).name : 'Unassigned'}
                                        </p>
                                    </div>
                                    <Badge variant={task.status === 'Completed' || task.status === 'Done' ? 'default' : 'outline'}>
                                        {task.status}
                                    </Badge>
                                </div>
                            ))}
                            {tasks.length === 0 && (
                                <p className="text-center text-muted-foreground py-10">No recent tasks found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card> */}
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
