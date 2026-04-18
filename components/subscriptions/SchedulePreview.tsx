"use client";

import { useMemo } from "react";
import { format, addDays, isWeekend, isSunday } from "date-fns";
import { Calendar as CalendarIcon, User, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DeliverableItem } from "@/src/types/subscription";

interface SchedulePreviewProps {
    items: DeliverableItem[];
    startDate: string;
}

export function SchedulePreview({ items, startDate }: SchedulePreviewProps) {

    // ⚡ FRONTEND SIMULATION OF BACKEND SCHEDULER
    // We run the math here so the user sees exactly what the database will create.
    const previewTasks = useMemo(() => {
        const tasks: any[] = [];
        const start = new Date(startDate);

        items.forEach((item) => {
            // Logic: Distribute Quantity over 30 Days (Monthly Cycle)
            // If Frequency is "Once", just do 1 date.
            // If "Weekly", do every 7 days.

            // Simplified Logic for Preview (Matches Backend)
            const totalDays = 30;
            const interval = Math.floor(totalDays / item.quantity);

            for (let i = 0; i < item.quantity; i++) {
                // Calculate Date
                const dateOffset = (i * interval) + 1; // Start Day 1, not Day 0
                let taskDate = addDays(start, dateOffset);

                // SKIP SUNDAYS logic: If falls on Sunday, move to Monday
                if (isSunday(taskDate)) {
                    taskDate = addDays(taskDate, 1);
                }

                tasks.push({
                    date: taskDate,
                    dateString: format(taskDate, "yyyy-MM-dd"),
                    displayDate: format(taskDate, "MMM dd, yyyy"), // e.g., Jan 03, 2025
                    dayName: format(taskDate, "EEEE"), // e.g., Friday
                    serviceName: item.serviceName || item.name,
                    role: item.scheduleConfig?.assignToRole || "Unassigned",
                    isWeekend: isWeekend(taskDate)
                });
            }
        });

        // Sort by Date (Earliest first)
        return tasks.sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [items, startDate]);

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md border border-blue-100">
                <div className="flex items-center gap-2 text-blue-800">
                    <CalendarIcon size={18} />
                    <span className="font-semibold text-sm">Projected Schedule</span>
                </div>
                <Badge variant="secondary" className="bg-white text-blue-700">
                    {previewTasks.length} Tasks Generated
                </Badge>
            </div>

            {/* THE TIMELINE LIST */}
            {/* THE TIMELINE LIST - Replaced ScrollArea with standard div for explicit control */}
            <div className="flex-1 max-h-[400px] overflow-y-auto border rounded-md bg-white p-4">
                <div className="space-y-3">
                    {previewTasks.map((task, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-md border ${task.isWeekend ? "bg-amber-50 border-amber-200" : "bg-card border-border"
                                }`}
                        >
                            {/* Left: Date Info */}
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center justify-center w-12 h-12 bg-muted/50 rounded-md border">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">{format(task.date, "MMM")}</span>
                                    <span className="text-lg font-bold leading-none">{format(task.date, "dd")}</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm">{task.serviceName}</h4>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <User size={10} /> {task.role}
                                        </span>
                                        <span>•</span>
                                        <span>{task.dayName}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Warnings (e.g., Weekend) */}
                            {task.isWeekend && (
                                <div className="flex items-center gap-1 text-xs text-amber-600 font-medium px-2 py-1 bg-white/50 rounded-full">
                                    <AlertCircle size={12} />
                                    <span>Weekend</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <p className="text-[11px] text-muted-foreground text-center">
                * This is a preview. Actual dates can be adjusted in the Task Manager after creation.
            </p>
        </div>
    );
}