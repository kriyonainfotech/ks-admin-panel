"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { isSameDay, isBefore, startOfDay, parseISO } from "date-fns";
import { OptionItem } from "@/src/services/optionSetService";

interface TaskStatsProps {
    tasks: any[];
    statusOptions?: OptionItem[];
}

export function TaskStats({ tasks, statusOptions = [] }: TaskStatsProps) {
    const stats = useMemo(() => {
        const total = tasks.length || 0;
        const today = startOfDay(new Date()); // 00:00:00 today

        // 1. Define "Done" Statuses
        const DONE_STATUSES = ["Done"];
        const APPROVED_STATUSES = ["Approved", "Posted"];

        // 2. Separate Buckets
        const doneTasks = tasks.filter(t => DONE_STATUSES.includes(t.status));
        const approvedTasks = tasks.filter(t => APPROVED_STATUSES.includes(t.status));
        
        // Active Tasks are those that are NOT Done and NOT Approved
        const activeTasks = tasks.filter(t => 
            !DONE_STATUSES.includes(t.status) && 
            !APPROVED_STATUSES.includes(t.status)
        );

        // 3. Calculate Buckets
        const overdueTasks = activeTasks.filter(t => {
            if (!t.dueDate) return false;
            // Strictly before Today (e.g. Yesterday or older)
            return isBefore(startOfDay(parseISO(t.dueDate)), today);
        });

        const pendingTasks = activeTasks.filter(t => {
            if (!t.dueDate) return true; // No date = Pending
            // Today OR Future (Pending = Total Active - Overdue)
            return !isBefore(startOfDay(parseISO(t.dueDate)), today);
        });

        // *Optional*: Count Today specific tasks just for the orange card
        const todayTasks = activeTasks.filter(t => t.dueDate && isSameDay(parseISO(t.dueDate), today));

        // 4. Return Cards
        return [
            {
                label: "Total Tasks",
                value: total,
                percent: 100,
                color: "bg-slate-50 text-slate-700 border-slate-200"
            },
            {
                label: "Done",
                value: doneTasks.length,
                percent: total ? Math.round((doneTasks.length / total) * 100) : 0,
                color: "bg-emerald-50 text-emerald-700 border-emerald-200"
            },
            {
                label: "Approved",
                value: approvedTasks.length,
                percent: total ? Math.round((approvedTasks.length / total) * 100) : 0,
                color: "bg-blue-50 text-blue-700 border-blue-200"
            },
            {
                label: "Pending", // Includes Today + Future
                value: pendingTasks.length,
                percent: total ? Math.round((pendingTasks.length / total) * 100) : 0,
                color: "bg-yellow-50 text-yellow-700 border-yellow-200"
            },
            // {
            //     label: "Today", // Just a highlight, part of Pending
            //     value: todayTasks.length, // Should be 1
            //     percent: total ? Math.round((todayTasks.length / total) * 100) : 0,
            //     color: "bg-orange-50 text-orange-700 border-orange-200"
            // },

            {
                label: "Overdue",
                value: overdueTasks.length, // Should be 1
                percent: total ? Math.round((overdueTasks.length / total) * 100) : 0,
                color: "bg-red-50 text-red-700 border-red-200"
            },

        ];
    }, [tasks]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 w-full">
            {stats.map((stat, i) => (
                <div key={i} className={cn("p-3 rounded-xl border flex justify-between h-20 shadow-sm", stat.color)}>
                    <div className="flex flex-col justify-between items-start">
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{stat.label}</span>
                        <span className="text-3xl font-black leading-none mt-1">{stat.value}</span>
                    </div>
                    <div className="flex flex-col justify-end items-end">
                        <span className="text-3xl font-medium leading-none mt-1 opacity-60">{stat.percent}%</span>
                    </div>
                </div>
            ))}
        </div>
    );
}