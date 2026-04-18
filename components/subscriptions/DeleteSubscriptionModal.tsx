"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Loader2, Trash2, AlertTriangle, Calendar, ListTodo, Package } from "lucide-react";
import { subscriptionAPI } from "@/src/services/subscriptionService";

interface DeletionCounts {
    scheduledContent: number;
    unscheduledContent: number;
    pendingTasks: number;
    completedTasks: number;
}

interface DeleteSubscriptionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subscriptionId: string | null;
    onConfirm: (id: string, options: Record<string, boolean>) => void;
    isDeleting: boolean;
}

export function DeleteSubscriptionModal({ open, onOpenChange, subscriptionId, onConfirm, isDeleting }: DeleteSubscriptionModalProps) {
    const [loading, setLoading] = useState(false);
    const [counts, setCounts] = useState<DeletionCounts | null>(null);
    const [packageName, setPackageName] = useState("");

    const [selections, setSelections] = useState<Record<string, boolean>>({
        deleteSchedules: true,
        deleteTasks: true,
    });

    // Fetch preview data when modal opens
    useEffect(() => {
        if (open && subscriptionId) {
            setLoading(true);
            subscriptionAPI.getDeletionPreview(subscriptionId)
                .then((res) => {
                    setCounts(res.data.counts);
                    setPackageName(res.data.packageName);
                })
                .catch(() => {
                    setCounts(null);
                })
                .finally(() => setLoading(false));
        }
    }, [open, subscriptionId]);

    const toggle = (key: string) => {
        setSelections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const getScheduledLabel = () => {
        if (!counts) return "";
        const total = counts.scheduledContent + counts.unscheduledContent;
        return `${total} total (${counts.scheduledContent} scheduled, ${counts.unscheduledContent} unscheduled)`;
    };

    const getTasksLabel = () => {
        if (!counts) return "";
        const total = counts.pendingTasks + counts.completedTasks;
        return `${total} total (${counts.pendingTasks} pending, ${counts.completedTasks} done)`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Package
                    </DialogTitle>
                    <DialogDescription>
                        {packageName
                            ? <>You are deleting <strong>{packageName}</strong>. Select associated data to clear:</>
                            : "Select what data to delete along with this package."
                        }
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading associated data...</span>
                    </div>
                ) : counts ? (
                    <div className="space-y-3 py-2">
                        {/* Schedules */}
                        <label className={`flex items-center gap-3 cursor-pointer rounded-md px-2 py-2 -mx-2 transition-colors hover:bg-muted/50`}>
                            <Checkbox
                                checked={selections.deleteSchedules}
                                onCheckedChange={() => toggle("deleteSchedules")}
                            />
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <div className="flex flex-1 items-center justify-between">
                                <span className="text-sm font-medium select-none">Schedule & Quota Items</span>
                                <span className="text-xs text-muted-foreground">{getScheduledLabel()}</span>
                            </div>
                        </label>

                        {/* Tasks */}
                        <label className={`flex items-center gap-3 cursor-pointer rounded-md px-2 py-2 -mx-2 transition-colors hover:bg-muted/50`}>
                            <Checkbox
                                checked={selections.deleteTasks}
                                onCheckedChange={() => toggle("deleteTasks")}
                            />
                            <ListTodo className="h-4 w-4 text-purple-600" />
                            <div className="flex flex-1 items-center justify-between">
                                <span className="text-sm font-medium select-none">Related Tasks</span>
                                <span className="text-xs text-muted-foreground">{getTasksLabel()}</span>
                            </div>
                        </label>

                        <Separator />

                        <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2.5 flex items-start gap-2">
                            <Package className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />
                            <span>
                                <strong>Subscription & Billing record</strong> will be permanently deleted.
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                        Failed to load associated data preview.
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => subscriptionId && onConfirm(subscriptionId, selections)}
                        disabled={isDeleting || loading}
                        className="gap-2"
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        {isDeleting ? "Deleting..." : "Delete Package"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
