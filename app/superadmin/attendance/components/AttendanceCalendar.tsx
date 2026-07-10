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
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AttendanceLog } from "@/src/types/attendanceTypes";
import { Badge } from "@/components/ui/badge";

interface AttendanceCalendarProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    dateRange: { from: Date; to?: Date } | null;
    onRangeSelect: (range: { from: Date; to?: Date } | null) => void;
    viewMode: "single" | "range";
    onViewModeChange: (mode: "single" | "range") => void;
    logs: AttendanceLog[];
    exceptions?: { _id: string, date: string, type: string, description?: string }[];
}

export function AttendanceCalendar({
    selectedDate,
    onDateSelect,
    dateRange,
    onRangeSelect,
    viewMode,
    onViewModeChange,
    logs,
    exceptions = []
}: AttendanceCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const handleDayClick = (day: Date) => {
        if (viewMode === "single") {
            onDateSelect(day);
        } else {
            if (!dateRange?.from || (dateRange.from && dateRange.to)) {
                // First click: start a new range (to is left undefined)
                onRangeSelect({ from: day, to: undefined });
            } else {
                // Second click: complete the range
                if (day < dateRange.from) {
                    onRangeSelect({ from: day, to: dateRange.from });
                } else {
                    onRangeSelect({ from: dateRange.from, to: day });
                }
            }
        }
    };

    const getDayStats = (day: Date) => {
        const dayLogs = logs.filter(log => isSameDay(startOfDay(new Date(log.date)), startOfDay(day)));
        if (dayLogs.length === 0) return null;

        const fullDay = dayLogs.filter(l => l.status === "Full Day").length;
        const halfDay = dayLogs.filter(l => l.status === "Half Day").length;
        const leave = dayLogs.filter(l => l.status === "Leave").length;

        const stats = [];
        if (fullDay > 0) stats.push({ label: "Present", shortLabel: "P", count: fullDay, colorClass: "text-emerald-700 bg-emerald-500/15 border-emerald-500/20" });
        if (halfDay > 0) stats.push({ label: "Half", shortLabel: "H", count: halfDay, colorClass: "text-amber-700 bg-amber-500/15 border-amber-500/20" });
        if (leave > 0) stats.push({ label: "Leave", shortLabel: "L", count: leave, colorClass: "text-blue-700 bg-blue-500/15 border-blue-500/20" });

        return stats;
    };

    const isDateSelected = (day: Date) => {
        if (viewMode === "single") {
            return isSameDay(day, selectedDate);
        } else {
            if (!dateRange?.from) return false;
            if (!dateRange.to) return isSameDay(day, dateRange.from);
            return isWithinInterval(startOfDay(day), {
                start: startOfDay(dateRange.from),
                end: startOfDay(dateRange.to)
            });
        }
    };

    return (
        <Card className="border shadow-md w-full overflow-hidden rounded-xl bg-card py-0">
            {/* Header */}
            <div className="border-b flex flex-col sm:flex-row items-center justify-between bg-card px-3 sm:px-4 py-2 sm:py-3 gap-3">
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                        {format(currentMonth, "MMMM yyyy")}
                    </h2>
                    <div className="flex items-center bg-muted/50 p-1 rounded-lg border">
                        <Button
                            variant={viewMode === "single" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => onViewModeChange("single")}
                            className="h-7 text-[10px] font-bold px-3 rounded-md"
                        >
                            SINGLE
                        </Button>
                        <Button
                            variant={viewMode === "range" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => onViewModeChange("range")}
                            className="h-7 text-[10px] font-bold px-3 rounded-md"
                        >
                            RANGE
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 sm:h-9 sm:w-9 border-border hover:bg-muted">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 sm:h-9 sm:w-9 border-border hover:bg-muted">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <CardContent className="p-0">
                <div className="grid grid-cols-7 border-b bg-muted/30">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                        <div key={d} className="py-2 sm:py-3 text-center text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            {d}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-fr bg-border/50 gap-px">
                    {calendarDays.map((day) => {
                        const stats = getDayStats(day);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isSelected = isDateSelected(day);
                        const isToday = isSameDay(day, new Date());
                        const isSunday = day.getDay() === 0;
                        const exception = exceptions.find(ex => isSameDay(new Date(ex.date), day));
                        const isWorkingSunday = isSunday && exception?.type === "Working Sunday";
                        const isHoliday = exception?.type === "Holiday";

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => handleDayClick(day)}
                                className={cn(
                                    "min-h-[50px] sm:min-h-[70px] p-1 sm:p-2 bg-card relative cursor-pointer transition-all hover:bg-primary/5 flex flex-col justify-between group",
                                    !isCurrentMonth && "bg-muted/10 opacity-40",
                                    isSunday && !isWorkingSunday && !isSelected && "bg-rose-500/[0.03]",
                                    isHoliday && !isSelected && "bg-rose-500/[0.05]",
                                    isWorkingSunday && !isSelected && "bg-emerald-500/[0.03]",
                                    isSelected && "bg-primary/[0.03] z-10",
                                    isSelected && viewMode === "range" && dateRange?.from && dateRange?.to &&
                                    isWithinInterval(startOfDay(day), { start: startOfDay(dateRange.from), end: startOfDay(dateRange.to) }) &&
                                    !isSameDay(day, dateRange.from) && !isSameDay(day, dateRange.to) && "bg-primary/[0.08]",
                                    isSelected && (isSameDay(day, viewMode === "single" ? selectedDate : (dateRange?.from || new Date())) || (viewMode === "range" && dateRange?.to && isSameDay(day, dateRange.to))) && "before:absolute before:inset-0 before:border-2 before:border-primary/40"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-[10px] sm:text-[11px] font-black rounded-md w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center transition-all",
                                        isToday ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground group-hover:text-primary",
                                        isSelected && !isToday && "text-primary font-black scale-110",
                                        isSunday && !isWorkingSunday && !isToday && !isSelected && "text-rose-400"
                                    )}>
                                        {format(day, "d")}
                                    </span>
                                    {isHoliday && <Badge variant="outline" className="text-[7px] py-0 px-1 border-rose-200 text-rose-500 h-4">Holiday</Badge>}
                                </div>

                                <div className="flex flex-wrap gap-0.5 sm:gap-1 mt-0.5 sm:mt-1 pb-1">
                                    {stats && stats.map((stat, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "flex items-center gap-1 text-[8px] sm:text-[9px] font-bold px-1 py-[1px] sm:px-[5px] sm:py-[2px] rounded-md border leading-tight",
                                                stat.colorClass
                                            )}
                                        >
                                            <span className="truncate">
                                                {stat.count} <span className="hidden sm:inline">{stat.label}</span><span className="sm:hidden">{stat.shortLabel}</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
