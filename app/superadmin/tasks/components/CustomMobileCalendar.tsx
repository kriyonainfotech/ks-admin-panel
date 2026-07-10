import React, { useState, useEffect } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Analytics {
    total: number;
    completed: number;
    color: string;
}

interface CustomMobileCalendarProps {
    date: Date | undefined;
    onSelect: (date: Date) => void;
    getAnalytics?: (date: Date) => Analytics | null;
    className?: string;
}

export function CustomMobileCalendar({ date, onSelect, getAnalytics, className }: CustomMobileCalendarProps) {
    const [viewDate, setViewDate] = useState(date || new Date());

    useEffect(() => {
        if (date) {
            setViewDate(date);
        }
    }, [date]);

    const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
    const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    return (
        <div className={cn("w-full bg-card rounded-xl border shadow-sm p-4", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevMonth}
                    className="h-8 w-8 hover:bg-muted"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-base font-bold text-foreground">
                    {format(viewDate, "MMMM yyyy")}
                </span>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextMonth}
                    className="h-8 w-8 hover:bg-muted"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 mb-2">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-2">
                {days.map((day) => {
                    const isSelected = date ? isSameDay(day, date) : false;
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const analytics = getAnalytics ? getAnalytics(day) : null;
                    const isDayToday = isToday(day);

                    return (
                        <div
                            key={day.toISOString()}
                            className="flex flex-col items-center justify-center relative"
                        >
                            <button
                                onClick={() => onSelect(day)}
                                className={cn(
                                    "h-9 w-9 flex items-center justify-center rounded-lg text-sm transition-all relative",
                                    !isCurrentMonth && "text-muted-foreground opacity-30",
                                    isSelected && "bg-primary text-primary-foreground font-semibold shadow-md z-10",
                                    !isSelected && isDayToday && "bg-muted font-bold text-foreground",
                                    !isSelected && !isDayToday && "hover:bg-muted/50"
                                )}
                            >
                                {format(day, dateFormat)}

                                {/* Analytics Dot */}
                                {analytics && !isSelected && (
                                    <div className="absolute bottom-1">
                                        <div
                                            className="h-1 w-1 rounded-full"
                                            style={{ backgroundColor: analytics.color }}
                                        />
                                    </div>
                                )}
                                {analytics && isSelected && (
                                    <div className="absolute bottom-1">
                                        <div className="h-1 w-1 rounded-full bg-primary-foreground/70" />
                                    </div>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
