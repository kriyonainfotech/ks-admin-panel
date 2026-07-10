"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterX, Search, Calendar as CalendarIcon, Building2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/src/context/AuthContext";

interface LeadsToolbarProps {
    // Filters
    searchTerm: string;
    setSearchTerm: (val: string) => void;

    statusFilter: string;
    setStatusFilter: (val: string) => void;
    uniqueStatuses: string[];

    cityFilter: string;
    setCityFilter: (val: string) => void;
    uniqueCities: string[];

    purposeFilter: string;
    setPurposeFilter: (val: string) => void;
    uniquePurposes: string[];

    // Company Filter (New)
    companyFilter?: string;
    setCompanyFilter?: (val: string) => void;
    companies?: any[];

    dateRange: DateRange | undefined;
    setDateRange: (range: DateRange | undefined) => void;

    onReset: () => void;
}

export function LeadsToolbar({
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter, uniqueStatuses,
    cityFilter, setCityFilter, uniqueCities,
    purposeFilter, setPurposeFilter, uniquePurposes,
    companyFilter, setCompanyFilter, companies,
    dateRange, setDateRange,
    onReset
}: LeadsToolbarProps) {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === "Superadmin";

    return (
        <div className="flex flex-col gap-3 mb-4 bg-card p-3 border rounded-md bg-muted/40">
            {/* Top Row: Filters */}
            <div className="flex flex-wrap gap-2 items-center w-full">

                {/* 1. Purpose (First as requested) */}
                <div className="grow basis-[150px]">
                    <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                        <SelectTrigger className="w-full bg-background">
                            <SelectValue placeholder="Purpose" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Purposes</SelectItem>
                            {uniquePurposes.map((p: string) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {/* 2. Company Filter (Superadmin) */}
                {isSuperAdmin && companies && setCompanyFilter && (
                    <div className="grow basis-[200px]">
                        <Select value={companyFilter} onValueChange={setCompanyFilter}>
                            <SelectTrigger className="w-full bg-background border-blue-200">
                                <SelectValue placeholder="Select Company" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Companies</SelectItem>
                                {companies.map((c) => (
                                    <SelectItem key={c._id} value={c._id}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* 3. Status Filter */}
                <div className="grow basis-[150px]">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full bg-background">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {uniqueStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {/* 4. City Filter */}
                <div className="grow basis-[150px]">
                    <Select value={cityFilter} onValueChange={setCityFilter}>
                        <SelectTrigger className="w-full bg-background">
                            <SelectValue placeholder="City" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Cities</SelectItem>
                            {uniqueCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {/* Corner Group: Date Range & Reset */}
                <div className="ml-auto flex items-center gap-2 grow sm:grow-0">
                    <div className="w-full sm:w-auto">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-full sm:w-[240px] justify-start text-left font-normal bg-background",
                                        !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    <span className="truncate">
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                                    {format(dateRange.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            "Date Range"
                                        )}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Button variant="ghost" onClick={onReset} className="text-destructive hover:bg-destructive/10 px-2 lg:px-4">
                        <FilterX size={16} className="mr-2" /> <span className="hidden lg:inline">Reset</span>
                    </Button>
                </div>
            </div>

            {/* Bottom Row: Search (Long) */}
            <div className="w-full">
                <div className="relative w-full">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 bg-background w-full"
                    />
                </div>
            </div>
        </div>
    );
}
