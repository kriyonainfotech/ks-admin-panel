"use client";

import { useMemo, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Clock,
    Calendar,
    Wallet,
    ChevronRight,
    LayoutGrid,
    Users,
    Filter,
    Search
} from "lucide-react";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface TeamListProps {
    data: any[];
    isLoading: boolean;
    onPay: (user: any) => void;
    onViewLogs: (user: any) => void;
    isReadOnly?: boolean;
}

export function TeamList({ data, isLoading, onPay, onViewLogs, isReadOnly = false }: TeamListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    // Extract unique categories (departments)
    const categories = useMemo(() => {
        const cats = new Set<string>();
        data.forEach(item => {
            if (item.department) cats.add(item.department);
        });
        return ["all", ...Array.from(cats)].sort();
    }, [data]);

    // Filter and group data
    const filteredData = useMemo(() => {
        let filtered = data;

        if (searchQuery) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (activeCategory !== "all") {
            filtered = filtered.filter(item => item.department === activeCategory);
        }

        // Group by department
        const groups: Record<string, any[]> = {};
        filtered.forEach(item => {
            const dept = item.department || "Other";
            if (!groups[dept]) groups[dept] = [];
            groups[dept].push(item);
        });
        return groups;
    }, [data, searchQuery, activeCategory]);

    if (!isLoading && data.length === 0) {
        return (
            <div className="bg-card rounded-lg border-2 border-dashed p-20 text-center">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No records found</h3>
                <p className="text-muted-foreground max-w-xs mx-auto mt-2 text-sm">
                    We couldn't find any team members matching your criteria for the selected period.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Context Actions & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-3 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <div className="flex items-center gap-2 mr-2 text-muted-foreground">
                        <Filter className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Filter</span>
                    </div>
                    {/* <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-auto">
                        <TabsList className="bg-muted p-1 h-9 rounded-md border">
                            {categories.map(cat => (
                                <TabsTrigger
                                    key={cat}
                                    value={cat}
                                    className="rounded-sm px-3 text-xs font-medium capitalize data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                                >
                                    {cat === "all" ? "All Team" : cat}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs> */}
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search employee..."
                        className="pl-9 h-9 rounded-md border-input bg-muted/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* List Groups */}
            <div className="space-y-8">
                {Object.entries(filteredData).map(([dept, members]) => (
                    <div key={dept} className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="h-6 w-1 bg-primary rounded-full" />
                            <h2 className="text-base font-bold text-foreground uppercase flex items-center gap-2">
                                {dept}
                                <Badge variant="secondary" className="bg-muted text-muted-foreground rounded-md h-5 px-2 font-medium">
                                    {members.length}
                                </Badge>
                            </h2>
                        </div>

                        <div className="bg-card rounded-lg border overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="border-b hover:bg-transparent">
                                        <TableHead className="py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider pl-6">Employee Info</TableHead>
                                        <TableHead className="py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Shift & Time</TableHead>
                                        <TableHead className="py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider text-center">Month Stats</TableHead>
                                        <TableHead className="py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider text-right">Live Balance</TableHead>
                                        <TableHead className="py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {members.map((member) => (
                                        <TableRow key={member._id} className="border-b hover:bg-muted/30 group transition-colors">
                                            <TableCell className="py-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border shadow-sm">
                                                        <AvatarImage src={member.profilePic} />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
                                                            {member.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-foreground leading-none mb-1 group-hover:text-primary transition-colors">{member.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-muted-foreground font-medium">{member.email}</span>
                                                            <div className="h-1 w-1 bg-muted rounded-full" />
                                                            <Badge variant="outline" className="h-4 px-1 text-[8px] font-bold text-muted-foreground uppercase">
                                                                {member.todayStatus}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Clock className="h-3 w-3 text-primary" />
                                                        <span className="text-xs font-semibold">{member.timing.start} - {member.timing.end}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center justify-center gap-4">
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1">Present</p>
                                                        <p className="text-xs font-bold text-foreground">{member.attendance.present}</p>
                                                    </div>
                                                    <div className="w-[1px] h-6 bg-border" />
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1">Half Day</p>
                                                        <p className="text-xs font-bold text-amber-600">{member.attendance.half}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                                                        <Wallet className="h-3.5 w-3.5 text-emerald-500" />
                                                        <span className="text-base tracking-tight">₹{member.earnedBalance.toLocaleString()}</span>
                                                    </div>
                                                    {member.paidAmount > 0 && (
                                                        <p className="text-[9px] font-medium text-muted-foreground mt-0.5">₹{member.paidAmount.toLocaleString()} Paid</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-right pr-6">
                                                <div className="flex items-center justify-end gap-2 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onViewLogs(member)}
                                                        className="h-8 w-8 p-0 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                    >
                                                        <Calendar className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => !isReadOnly && onPay(member)}
                                                        disabled={isReadOnly}
                                                        className={`h-8 rounded-md font-bold text-[10px] uppercase tracking-wider px-3 ${isReadOnly ? 'bg-muted text-muted-foreground' : 'bg-primary hover:bg-primary/90'}`}
                                                    >
                                                        {isReadOnly ? "Paid/Locked" : "Pay Now"}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
