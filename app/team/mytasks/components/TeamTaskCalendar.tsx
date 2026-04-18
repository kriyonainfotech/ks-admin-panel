"use client";

import { useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isWithinInterval,
    startOfDay,
    endOfDay,
    isBefore,
    parseISO
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { OptionItem } from "@/src/services/optionSetService";

interface TeamTaskCalendarProps {
    date: DateRange | undefined;
    setDate: (date: DateRange | undefined) => void;
    tasks: any[];
    statusOptions?: OptionItem[];
}

export function TeamTaskCalendar({ date, setDate, tasks, statusOptions = [] }: TeamTaskCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const handleDayClick = (day: Date) => {
        if (!date?.from || (date.from && date.to)) {
            setDate({ from: day, to: undefined });
        } else {
            // Simple toggle logic or range logic
            setDate({ from: day, to: undefined });
        }
    };

    // --- DOTS LOGIC ---
    const getDayStats = (day: Date) => {
        let designCount = 0;
        let postingCount = 0;
        let overdueCount = 0;

        const today = startOfDay(new Date());

        tasks.forEach(task => {
            // Stage Logic:
            // 1. Initial Work (Stage 1): Ads_Done, Approved, Design, Edit, Done
            // 2. Final Delivery (Stage 2): Report_Shared, Done
            const isStage1Done = ["Ads_Done", "Report_Shared", "Approved", "Done"].includes(task.status);
            const isStage2Done = ["Report_Shared", "Done"].includes(task.status);

            // 1. CHECK TASK DATE (DUE DATE)
            if (task.dueDate && isSameDay(parseISO(task.dueDate), day)) {
                // For tasks with two dates, the first date represents Stage 1
                // For single-date tasks, the only date represents the final delivery (Stage 2)
                const isFinished = task.postingDate ? isStage1Done : isStage2Done;

                if (isFinished) {
                    postingCount++; // Green
                } else if (isBefore(day, today)) {
                    overdueCount++; // Red
                } else {
                    designCount++; // Yellow
                }
            }

            // 2. CHECK DELIVERY DATE (POSTING / REPORTING)
            if (task.postingDate && isSameDay(parseISO(task.postingDate), day)) {
                // The delivery date always follows Stage 2 completion
                if (isStage2Done) {
                    postingCount++; // Green
                } else if (isBefore(day, today)) {
                    overdueCount++; // Red
                } else {
                    designCount++; // Yellow
                }
            }
        });

        const stats = [];
        if (overdueCount > 0) stats.push({ label: "Overdue", count: overdueCount, color: "#ef4444" });
        if (designCount > 0) stats.push({ label: "Design", count: designCount, color: "#f59e0b" }); // Orange
        if (postingCount > 0) stats.push({ label: "Post", count: postingCount, color: "#10b981" }); // Emerald/Green

        return stats;
    };

    const isSelected = (day: Date) => {
        if (!date?.from) return false;
        return isSameDay(day, date.from);
    };

    return (
        <Card className="border shadow-sm w-full overflow-hidden rounded-xl pt-3 pb-0 gap-0">
            {/* Header */}
            <div className="border-b flex flex-row items-center justify-between bg-white px-3 pb-2">
                <h2 className="text-lg font-bold text-slate-900">
                    {format(currentMonth, "MMMM yyyy")}
                </h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <CardContent className="p-0">
                <div className="grid grid-cols-7 border-b bg-slate-50">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                        <div key={d} className="p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {d}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-fr bg-slate-100 gap-px border-l border-t">
                    {calendarDays.map((day) => {
                        const stats = getDayStats(day);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isDaySelected = isSelected(day);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => handleDayClick(day)}
                                className={cn(
                                    "min-h-[20px] p-2 bg-white relative cursor-pointer transition-all hover:bg-primary/5 flex justify-between group",
                                    !isCurrentMonth && "bg-slate-50/30 text-slate-400",
                                    isDaySelected && "bg-primary/5 border border-primary/20 z-10"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-sm font-semibold rounded-full w-7 h-7 flex items-center justify-center transition-colors",
                                        isToday ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-slate-700",
                                        isDaySelected && !isToday && "text-primary font-bold"
                                    )}>
                                        {format(day, "d")}
                                    </span>
                                </div>

                                {stats && stats.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1 content-end">
                                        {stats.map((stat, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm border border-transparent"
                                                style={{
                                                    backgroundColor: `${stat.color}20`,
                                                    color: stat.color,
                                                }}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stat.color }} />
                                                {stat.count}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}