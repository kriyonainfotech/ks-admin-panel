"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { User, Briefcase, Search, X } from "lucide-react";
import { DataHandler } from "@/components/DataHandler";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ClientColumnProps {
    clients: any[];
    summary: any[];
    selectedClientId: string;
    onSelectClient: (id: string) => void;
    onDismissClient?: (id: string) => void;
    isLoading?: boolean;
}

export function ClientColumn({ clients, summary, selectedClientId, onSelectClient, onDismissClient, isLoading }: ClientColumnProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredClients = clients.filter((client) => {
        const query = searchQuery.toLowerCase();
        return (
            client.businessName?.toLowerCase().includes(query) ||
            client.name?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="h-[500px] lg:h-[calc(100vh-220px)] flex flex-col bg-transparent">
            {/* Header */}
            <div className="flex items-center justify-between px-1 pb-3 pt-1 border-b border-muted/50 mb-4">
                <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-lg text-slate-800">Clients</h3>
                </div>
                <Badge variant="secondary" className="px-2 h-6 text-xs font-bold bg-white border border-slate-200 text-slate-600 shadow-sm">
                    {filteredClients.length}
                </Badge>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search client or business..."
                    className="pl-9 bg-white/50 border-slate-200 focus:border-primary/50 focus:ring-primary/10 transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Scrollable List */}
            <div className="flex-1 min-h-0 relative">
                <ScrollArea className="h-full -mx-2 px-2">
                    <div className="space-y-2 pb-4">
                        <DataHandler
                            loading={Boolean(isLoading) && clients.length === 0}
                            isEmpty={!isLoading && filteredClients.length === 0}
                            variant="inline"
                            emptyText={searchQuery ? "No matching clients found." : "No clients found."}
                        >
                            {filteredClients.map((client) => {
                                const clientSummary = summary.find((s) => s._id === client.id) || {
                                    total: 0,
                                    unscheduled: 0,
                                    scheduled: 0,
                                    completed: 0,
                                };

                                const isSelected = selectedClientId === client.id;
                                const isCompleted = clientSummary && clientSummary.total > 0 && clientSummary.unscheduled === 0 && clientSummary.scheduled === 0;

                                return (
                                    <Card
                                        key={client.id}
                                        onClick={() => onSelectClient(client.id)}
                                        className={cn(
                                            "cursor-pointer transition-all duration-200 border shadow-sm group relative overflow-hidden py-0",
                                            isSelected
                                                ? isCompleted
                                                    ? "border-emerald-500/40 bg-emerald-50/60 ring-1 ring-emerald-500/20 shadow-md"
                                                    : "border-primary/40 bg-primary/5 ring-1 ring-primary/10 shadow-md"
                                                : isCompleted
                                                    ? "border-emerald-200 bg-emerald-50/30 hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-md"
                                                    : "border-slate-200 bg-white hover:border-primary/30 hover:shadow-md"
                                        )}
                                    >
                                        {/* Selection Indicator Strip */}
                                        {isSelected && (
                                            <div className={cn(
                                                "absolute left-0 top-0 bottom-0 w-1",
                                                isCompleted ? "bg-emerald-500" : "bg-primary"
                                            )} />
                                        )}
                                        {isCompleted && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDismissClient?.(client.id);
                                                }}
                                                className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-emerald-700 hover:bg-emerald-200/70 hover:text-emerald-950 transition-colors"
                                                title="Dismiss client"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}

                                        <CardContent className={cn("p-3 pl-4", isCompleted && "pr-10")}>
                                            {/* Top Row: Name & Total */}
                                            <div className="flex justify-between items-start mb-2.5">
                                                <div className="flex flex-col min-w-0 pr-2">
                                                    <h4 className={cn(
                                                        "font-bold text-sm leading-tight truncate transition-colors",
                                                        isSelected
                                                            ? isCompleted ? "text-emerald-700" : "text-primary"
                                                            : isCompleted ? "text-emerald-800 group-hover:text-emerald-900" : "text-slate-800 group-hover:text-primary"
                                                    )}>
                                                        {client.businessName}
                                                    </h4>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <User className="h-3 w-3 text-slate-400" />
                                                        <p className="text-[11px] text-slate-500 font-medium truncate">
                                                            {client.name}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Total Badge */}
                                                <div className="shrink-0 flex items-center gap-1.5">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total</span>
                                                        <Badge variant="outline" className={cn(
                                                            "h-5 min-w-[24px] flex justify-center px-1 border-slate-200 bg-slate-50 text-slate-700",
                                                            isCompleted && "border-emerald-200 bg-emerald-100/50 text-emerald-850"
                                                        )}>
                                                            {clientSummary.total}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Row: Compact Stats Pills */}
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {/* Pending Pill */}
                                                <div className={cn(
                                                    "flex flex-col items-center justify-center px-1 py-1.5 rounded-md border text-center",
                                                    clientSummary.unscheduled > 0
                                                        ? "bg-red-50/80 border-red-100 text-red-700"
                                                        : "bg-slate-50 border-slate-100 text-slate-400 opacity-60"
                                                )}>
                                                    <span className="text-[8px] font-bold uppercase tracking-tight">Unscheduled</span>
                                                    <span className="text-xs font-bold leading-none mt-1">{clientSummary.unscheduled}</span>
                                                </div>

                                                {/* Active Pill */}
                                                <div className={cn(
                                                    "flex flex-col items-center justify-center px-1 py-1.5 rounded-md border text-center",
                                                    clientSummary.scheduled > 0
                                                        ? "bg-emerald-50/80 border-emerald-100 text-emerald-700"
                                                        : "bg-slate-50 border-slate-100 text-slate-400 opacity-60"
                                                )}>
                                                    <span className="text-[8px] font-bold uppercase tracking-tight">Scheduled</span>
                                                    <span className="text-xs font-bold leading-none mt-1">{clientSummary.scheduled}</span>
                                                </div>

                                                {/* Completed Pill */}
                                                <div className={cn(
                                                    "flex flex-col items-center justify-center px-1 py-1.5 rounded-md border text-center",
                                                    clientSummary.completed > 0
                                                        ? "bg-blue-50/80 border-blue-100 text-blue-700"
                                                        : "bg-slate-50 border-slate-100 text-slate-400 opacity-60"
                                                )}>
                                                    <span className="text-[8px] font-bold uppercase tracking-tight">Completed</span>
                                                    <span className="text-xs font-bold leading-none mt-1">{clientSummary.completed}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </DataHandler>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
