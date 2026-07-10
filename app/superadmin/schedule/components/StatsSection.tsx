"use client";

import { useState } from "react";
import { Users, ClipboardList, Zap, Calendar as CalendarIcon, ChevronDown, CheckCircle2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, startOfMonth, endOfMonth } from "date-fns";

// Shadcn Imports
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsSectionProps {
    totalClients: number;
    totalTasks: number;
    unscheduledTasks: number;
    scheduledTasks: number;
    completedTasks: number;
}

export function StatsSection({
    totalClients,
    totalTasks,
    unscheduledTasks,
    scheduledTasks,
    completedTasks,
}: StatsSectionProps) {
    // Default to current month range
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });

    return (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 w-full">

            {/* 1. Date Range Filter */}
            {/* <div className="shrink-0">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full xl:w-[260px] h-[72px] justify-between px-4 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-slate-100 rounded-lg">
                                    <CalendarIcon className="h-5 w-5 text-slate-600" />
                                </div>
                                <div className="flex flex-col items-start gap-0.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Period</span>
                                    <span className="text-xs font-bold truncate max-w-[140px]">
                                        {date?.from ? (
                                            date.to ? (
                                                <>{format(date.from, "LLL dd")} - {format(date.to, "LLL dd")}</>
                                            ) : (
                                                format(date.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick dates</span>
                                        )}
                                    </span>
                                </div>
                            </div>
                            <ChevronDown className="h-4 w-4 text-slate-400 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-slate-200 shadow-xl rounded-xl" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                            className="p-3"
                        />
                    </PopoverContent>
                </Popover>
            </div> */}

            {/* 2. Stats Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 flex-1 w-full">

                {/* Clients Card (Neutral) */}
                <Card className="shadow-sm border-yellow-200 bg-yellow-50/50 hover:bg-yellow-50 hover:border-yellow-200 transition-all h-[72px]">
                    <CardContent className="p-0 flex items-center h-full px-4 gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-yellow-50 rounded-lg shrink-0">
                            <Users className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-yellow-600/70 uppercase tracking-wider leading-tight">Total Clients</span>
                            <span className="text-xl font-black text-yellow-900 leading-none mt-0.5">{totalClients}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Tasks Card (Neutral) */}
                <Card className="shadow-sm border-slate-200 bg-gray-100/50 hover:bg-gray-50 hover:border-indigo-200 transition-all h-[72px]">
                    <CardContent className="p-0 flex items-center h-full px-4 gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-indigo-50 rounded-lg shrink-0">
                            <ClipboardList className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">Total Tasks</span>
                            <span className="text-xl font-black text-slate-900 leading-none mt-0.5">{totalTasks}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Unscheduled Tasks (Red Background) */}
                <Card className="shadow-sm border-red-100 bg-red-50/50 hover:bg-red-50 hover:border-red-200 transition-all h-[72px]">
                    <CardContent className="p-0 flex items-center h-full px-4 gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shrink-0 shadow-sm border border-red-100">
                            <Zap className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-red-600/70 uppercase tracking-wider leading-tight">Unscheduled</span>
                            <span className="text-xl font-black text-red-900 leading-none mt-0.5">{unscheduledTasks}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Scheduled Tasks (Green Background) */}
                <Card className="shadow-sm border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-200 transition-all h-[72px]">
                    <CardContent className="p-0 flex items-center h-full px-4 gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shrink-0 shadow-sm border border-emerald-100">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider leading-tight">Scheduled</span>
                            <span className="text-xl font-black text-emerald-900 leading-none mt-0.5">{scheduledTasks}</span>
                        </div>
                    </CardContent>
                </Card>
                {/* Completed Tasks (Green Background) */}
                <Card className="shadow-sm border-blue-100 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-200 transition-all h-[72px]">
                    <CardContent className="p-0 flex items-center h-full px-4 gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shrink-0 shadow-sm border border-blue-100">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-blue-600/70 uppercase tracking-wider leading-tight">Completed</span>
                            <span className="text-xl font-black text-blue-900 leading-none mt-0.5">{completedTasks}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}