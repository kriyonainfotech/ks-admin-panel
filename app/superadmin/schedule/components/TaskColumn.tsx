"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Clock, Zap, Calendar, User, Pencil, Trash2, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DataHandler } from "@/components/DataHandler";

interface TaskColumnProps {
    title: string;
    count: number;
    items: any[];
    type: "unscheduled" | "scheduled";
    onAction?: (item: any) => void;
    onEdit?: (item: any) => void;
    onRename?: (item: any) => void;
    onDelete?: (id: string) => void;
    isLoading?: boolean;
}

export function TaskColumn({ title, count, items, type, onAction, onEdit, onRename, onDelete, isLoading }: TaskColumnProps) {
    return (
        // 1. Constrain the outer container height
        <div className="flex flex-col h-[500px] lg:h-[calc(100vh-220px)] bg-transparent">

            {/* Header Section (Fixed Height) */}
            <div className="flex items-center justify-between px-1 pb-3 pt-1 border-b border-muted/50 mb-3 shrink-0">
                <div className="flex items-center gap-2">
                    {type === "unscheduled" ? (
                        <div className="p-1.5 bg-red-50 rounded-md">
                            <Zap className="h-4 w-4 text-red-600" />
                        </div>
                    ) : (
                        <div className="p-1.5 bg-emerald-50 rounded-md">
                            <Clock className="h-4 w-4 text-emerald-600" />
                        </div>
                    )}
                    <h3 className="font-bold text-lg text-slate-800 tracking-tight">{title}</h3>
                </div>
                <Badge
                    variant="outline"
                    className={cn(
                        "px-2.5 h-6 text-xs font-bold border shadow-sm",
                        type === "unscheduled"
                            ? "bg-white border-red-200 text-red-600"
                            : "bg-white border-emerald-200 text-emerald-600"
                    )}
                >
                    {count}
                </Badge>
            </div>

            {/* 2. Scrollable Content Area */}
            {/* flex-1 and min-h-0 are critical for nested scrolling */}
            <div className="flex-1 min-h-0 relative">
                <ScrollArea className="h-full pr-3 -mr-3">
                    <div className="space-y-2.5 pb-4 pl-1 pr-1">
                        <DataHandler
                            loading={Boolean(isLoading)}
                            isEmpty={(items || []).length === 0}
                            variant="inline"
                            emptyText={`No ${type} tasks found`}
                        >
                            {(items || []).map((item) => (
                                <Card
                                    key={item._id}
                                    className={cn(
                                        "group border-slate-200 shadow-sm transition-all duration-200 relative overflow-hidden",
                                        "hover:shadow-md bg-white py-1",
                                        type === "unscheduled"
                                            ? "hover:border-red-200 hover:bg-red-50/30"
                                            : item.status === "Completed"
                                                ? "hover:border-blue-500/50 hover:bg-blue-50/50"
                                                : "hover:border-emerald-500/50 hover:bg-emerald-50/50"
                                    )}
                                >
                                    {/* Left Colored Strip */}
                                    <div className={cn(
                                        "absolute left-0 top-0 bottom-0 w-1",
                                        type === "unscheduled"
                                            ? "bg-red-700/0 group-hover:bg-red-700 transition-colors"
                                            : item.status === "Completed"
                                                ? "bg-blue-700/0 group-hover:bg-blue-700 transition-colors"
                                                : "bg-emerald-700/0 group-hover:bg-emerald-700 transition-colors"
                                    )} />

                                    <CardContent className="p-3 pl-4">
                                        <div className="flex justify-between gap-3">
                                            <div className="flex-1 min-w-0 flex flex-col gap-1.5">

                                                {/* Top Metadata Row */}
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-[9px] h-5 px-1.5 font-bold bg-slate-100 text-slate-600 rounded-[4px] border border-slate-200">
                                                        {item.postType || "POST"}
                                                    </Badge>
                                                    {item.isChutak && (
                                                        <Badge variant="outline" className="text-[9px] h-5 px-1.5 font-bold border-amber-200 bg-amber-50 text-amber-700 rounded-[4px]">
                                                            CHUTAK (₹{item.price})
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Main Content Title */}
                                                <h4 className={cn(
                                                    "font-bold text-sm text-slate-800 leading-snug line-clamp-2 transition-colors",
                                                    type === "unscheduled" ? "group-hover:text-red-700" : "group-hover:text-black"
                                                )}>
                                                    {item.content}
                                                </h4>

                                                {/* Scheduled Footer Info */}
                                                {type === "scheduled" && (
                                                    <div className="flex items-center gap-3 pt-1 mt-0.5 border-t border-slate-50">
                                                        <div className={cn(
                                                            "flex items-center gap-1.5 text-[11px] px-1.5 py-0.5 rounded-md transition-colors",
                                                            item.status === "Completed"
                                                                ? "text-blue-500 bg-blue-50 group-hover:bg-blue-100/50"
                                                                : "text-slate-500 bg-slate-50 group-hover:bg-emerald-100/50"
                                                        )}>
                                                            <Calendar className={cn("h-3 w-3", item.status === "Completed" ? "text-blue-400" : "text-slate-400")} />
                                                            <span className={cn("font-semibold", item.status === "Completed" ? "text-blue-700" : "text-slate-700")}>
                                                                {item.date ? format(new Date(item.date), "MMM d") : "TBD"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                                            <User className="h-3 w-3 text-slate-400" />
                                                            <span className="truncate max-w-[100px]">
                                                                {item.linkedTask?.assignedTo?.name || "Unassigned"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-row gap-1 items-center self-center shrink-0 pl-2">


                                                {/* Edit Button (Scheduled Only) */}
                                                {type === "scheduled" && (
                                                    <div className={cn(
                                                        "flex items-center transition-all duration-200",
                                                        item.status === "Completed" ? "opacity-40 cursor-not-allowed" : "opacity-0 group-hover:opacity-100"
                                                    )}>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            title={item.status === "Completed" ? "Cannot edit completed task" : "Edit task"}
                                                            className={cn(
                                                                "h-8 w-8 rounded-full transition-colors",
                                                                item.status === "Completed"
                                                                    ? "text-slate-400 hover:text-slate-400 hover:bg-transparent"
                                                                    : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100/50"
                                                            )}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEdit && onEdit(item);
                                                            }}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* Rename Button (Both) */}
                                                <div className={cn(
                                                    "flex items-center transition-all duration-200",
                                                    item.status === "Completed" ? "opacity-40 cursor-not-allowed" : "opacity-0 group-hover:opacity-100"
                                                )}>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        title={item.status === "Completed" ? "Cannot rename completed task" : "Rename item"}
                                                        className={cn(
                                                            "h-8 w-8 rounded-full transition-colors",
                                                            item.status === "Completed"
                                                                ? "text-slate-400 hover:text-slate-400 hover:bg-transparent"
                                                                : "text-blue-500 hover:text-blue-700 hover:bg-blue-100/50"
                                                        )}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (item.status !== "Completed" && onRename) {
                                                                onRename(item);
                                                            }
                                                        }}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {/* Delete Button (Both) */}
                                                <div className={cn(
                                                    "flex items-center transition-all duration-200",
                                                    item.status === "Completed" ? "opacity-40 cursor-not-allowed" : "opacity-0 group-hover:opacity-100"
                                                )}>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        title={item.status === "Completed" ? "Cannot delete completed task" : "Delete item"}
                                                        className={cn(
                                                            "h-8 w-8 rounded-full transition-colors",
                                                            item.status === "Completed"
                                                                ? "text-slate-400 hover:text-slate-400 hover:bg-transparent"
                                                                : "text-red-500 hover:text-red-700 hover:bg-red-100/50"
                                                        )}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDelete && onDelete(item._id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {/* Action Button (Unscheduled Only) */}
                                                {type === "unscheduled" && (
                                                    <div className="flex items-center pl-1">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 rounded-full text-slate-100 hover:text-primary bg-primary/90 hover:bg-slate-100/80 transition-colors"
                                                            onClick={() => onAction && onAction(item)}
                                                        >
                                                            <ChevronRight className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </DataHandler>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}