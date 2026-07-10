"use client";

import React, { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval, isWithinInterval } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DateRangePickerProps {
    onRangeSelect: (range: { from: Date; to: Date } | null) => void;
    initialRange?: { from: Date; to: Date } | null;
}

export function CustomDateRangePicker({ onRangeSelect, initialRange }: DateRangePickerProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [range, setRange] = useState<{ from: Date | null; to: Date | null }>({
        from: initialRange?.from || null,
        to: initialRange?.to || null
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const handleDateClick = (day: Date) => {
        if (!range.from || (range.from && range.to)) {
            const newRange = { from: day, to: null };
            setRange(newRange);
            onRangeSelect(null);
        } else if (day < range.from) {
            const newRange = { from: day, to: null };
            setRange(newRange);
            onRangeSelect(null);
        } else {
            const newRange = { from: range.from, to: day };
            setRange(newRange);
            onRangeSelect({ from: range.from, to: day });
        }
    };

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between px-2 py-4 border-b">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">
                        {format(currentMonth, "MMMM yyyy")}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1">
                        <CalendarIcon size={10} /> Select Range
                    </span>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={prevMonth}>
                        <ChevronLeft size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={nextMonth}>
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = [];
        const date = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-center text-[10px] font-bold text-slate-400 uppercase py-2">
                    {date[i]}
                </div>
            );
        }
        return <div className="grid grid-cols-7">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const isSelected = (range.from && isSameDay(day, range.from)) || (range.to && isSameDay(day, range.to));
                const isInRange = range.from && range.to && isWithinInterval(day, { start: range.from, end: range.to });
                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <div
                        key={day.toString()}
                        className={cn(
                            "relative h-10 flex items-center justify-center cursor-pointer transition-all duration-200",
                            !isCurrentMonth && "opacity-20",
                            isInRange && !isSelected && "bg-primary/10",
                            isSelected && "bg-primary text-white scale-110 z-10 rounded-md shadow-lg font-bold"
                        )}
                        onClick={() => handleDateClick(cloneDay)}
                    >
                        <span className="text-xs">{format(day, "d")}</span>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toString()} className="grid grid-cols-7">
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="bg-white">{rows}</div>;
    };

    return (
        <div className="w-[300px] border rounded-xl overflow-hidden shadow-sm bg-white border-slate-200">
            {renderHeader()}
            <div className="p-2">
                {renderDays()}
                {renderCells()}
            </div>
            {range.from && range.to && (
                <div className="p-3 border-t bg-slate-50 flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Selected Range</span>
                        <span className="text-xs font-semibold text-slate-700">
                            {format(range.from, "MMM d")} - {format(range.to, "MMM d")}
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-destructive hover:bg-destructive/10" onClick={() => { setRange({ from: null, to: null }); onRangeSelect(null); }}>
                        Clear
                    </Button>
                </div>
            )}
        </div>
    );
}
