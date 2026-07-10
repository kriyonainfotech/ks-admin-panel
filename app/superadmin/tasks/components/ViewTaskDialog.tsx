"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, User, Briefcase, Tag, Clock, AlignLeft } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Task } from "@/lib/taskdata";
import { cn } from "@/lib/utils";

interface ViewTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: Task | null;
}

export function ViewTaskDialog({ open, onOpenChange, task }: ViewTaskDialogProps) {
    if (!task) return null;

    const statusColors: Record<string, string> = {
        Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
        Done: "bg-green-100 text-green-800 border-green-200",
        Approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
        Posted: "bg-purple-100 text-purple-800 border-purple-200",
        Overdue: "bg-red-100 text-red-800 border-red-200",
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 gap-0">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold leading-tight">
                                {task.title}
                            </DialogTitle>
                            <div className="flex flex-wrap gap-2 items-center text-sm">
                                <Badge variant="outline" className={cn("capitalize px-2 py-0", statusColors[task.status] || "bg-gray-100")}>
                                    {task.status}
                                </Badge>
                                <span className="text-muted-foreground text-xs flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    {task.type} Task
                                </span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 pt-4 space-y-6">
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 rounded-xl p-4 border border-muted-foreground/10">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border shadow-sm">
                                    <CalendarIcon className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Due Date</p>
                                    <p className="font-medium">{format(parseISO(task.dueDate), "PPP")}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border shadow-sm">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Assigned To</p>
                                    <p className="font-medium">{task.assigneeName || "Unassigned"}</p>
                                </div>
                            </div>
                        </div>

                        {task.type === "Team" && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border shadow-sm">
                                        <Briefcase className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Client</p>
                                        <p className="font-medium">
                                            {typeof task.client === 'object' ? task.client?.businessName : (task.clientName || "-")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary/80">
                            <AlignLeft className="h-4 w-4" />
                            <h3>Task Description</h3>
                        </div>
                        <div className="bg-card border rounded-xl p-5 shadow-sm min-h-[120px]">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                                {task.description || "No description provided."}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t bg-muted/20">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close Details
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}
