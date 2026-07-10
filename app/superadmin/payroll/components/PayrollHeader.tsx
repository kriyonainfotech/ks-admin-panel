"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Wallet } from "lucide-react";

interface PayrollHeaderProps {
    month: number;
    year: number;
    onDateChange: (month: number, year: number) => void;
}

export function PayrollHeader({ month, year, onDateChange }: PayrollHeaderProps) {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const years = [2025, 2026];

    return (
        <div className="flex flex-col md:flex-row justify-between items-center bg-card p-3 rounded-xl border border-border/50 shadow-sm gap-4 shrink-0">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2.5 rounded-lg text-primary hidden md:block">
                    <Wallet size={20} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider leading-none">Payroll Engine</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Salary cycles & disbursements</span>
                </div>
            </div>

            <div className="flex items-center bg-card border rounded-md shadow-sm p-1 gap-1">
                <div className="flex items-center px-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                </div>
                <Select
                    value={month.toString()}
                    onValueChange={(val) => onDateChange(parseInt(val), year)}
                >
                    <SelectTrigger className="w-[120px] h-8 border-none bg-transparent shadow-none focus:ring-0 font-medium text-sm">
                        <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                        {monthNames.map((name, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                                {name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="w-[1px] h-4 bg-border" />
                <Select
                    value={year.toString()}
                    onValueChange={(val) => onDateChange(month, parseInt(val))}
                >
                    <SelectTrigger className="w-[80px] h-8 border-none bg-transparent shadow-none focus:ring-0 font-medium text-sm">
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map(y => (
                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
