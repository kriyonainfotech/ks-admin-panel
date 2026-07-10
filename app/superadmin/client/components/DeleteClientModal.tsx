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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Trash2, AlertTriangle, Calendar, ListTodo, CreditCard, Package, Layers } from "lucide-react";
import { clientAPI } from "@/src/services/clientService";

interface DeletionCounts {
    scheduledContent: number;
    unscheduledContent: number;
    completedContent: number;
    pendingTasks: number;
    completedTasks: number;
    paymentSales: number;
    paymentCollections: number;
    subscriptions: number;
    packages: number;
}

interface DeleteClientModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: string | null;
    onConfirm: (id: string, options: Record<string, boolean>) => void;
    isDeleting: boolean;
}

const CATEGORIES = [
    {
        key: "deleteScheduled",
        label: "Scheduled Content",
        icon: Calendar,
        color: "text-blue-600",
        getTotal: (c: DeletionCounts) => c.scheduledContent + c.completedContent,
        getLabel: (c: DeletionCounts) => {
            const total = c.scheduledContent + c.completedContent;
            return `${total} total (${c.scheduledContent} pending and ${c.completedContent} completed)`;
        },
    },
    {
        key: "deleteUnscheduled",
        label: "Unscheduled Content",
        icon: Calendar,
        color: "text-orange-500",
        getTotal: (c: DeletionCounts) => c.unscheduledContent,
        getLabel: (c: DeletionCounts) => {
            const count = c.unscheduledContent;
            return `${count} item${count !== 1 ? "s" : ""}`;
        },
    },
    {
        key: "deleteTasks",
        label: "Tasks",
        icon: ListTodo,
        color: "text-purple-600",
        getTotal: (c: DeletionCounts) => c.pendingTasks + c.completedTasks,
        getLabel: (c: DeletionCounts) => {
            const total = c.pendingTasks + c.completedTasks;
            return `${total} total (${c.pendingTasks} pending and ${c.completedTasks} done)`;
        },
    },
    { key: "deletePaymentSales", label: "Payment Sales", countKey: "paymentSales" as keyof DeletionCounts, icon: CreditCard, color: "text-green-600" },
    { key: "deleteCollections", label: "Payment Collections", countKey: "paymentCollections" as keyof DeletionCounts, icon: CreditCard, color: "text-emerald-500" },
    { key: "deleteSubscriptions", label: "Subscriptions", countKey: "subscriptions" as keyof DeletionCounts, icon: Layers, color: "text-indigo-500" },
    { key: "deletePackages", label: "Packages", countKey: "packages" as keyof DeletionCounts, icon: Package, color: "text-rose-500" },
] as const;

export function DeleteClientModal({ open, onOpenChange, clientId, onConfirm, isDeleting }: DeleteClientModalProps) {
    const [loading, setLoading] = useState(false);
    const [counts, setCounts] = useState<DeletionCounts | null>(null);
    const [clientName, setClientName] = useState("");

    const [selections, setSelections] = useState<Record<string, boolean>>({
        deleteScheduled: true,
        deleteUnscheduled: true,
        deleteTasks: true,
        deletePaymentSales: true,
        deleteCollections: true,
        deleteSubscriptions: true,
        deletePackages: true,
    });

    // Fetch preview data when modal opens
    useEffect(() => {
        if (open && clientId) {
            setLoading(true);
            clientAPI.getDeletionPreview(clientId)
                .then((res) => {
                    setCounts(res.data.counts);
                    setClientName(res.data.clientName);
                })
                .catch(() => {
                    setCounts(null);
                })
                .finally(() => setLoading(false));
        }
    }, [open, clientId]);

    const toggleAll = (checked: boolean) => {
        setSelections({
            deleteScheduled: checked,
            deleteUnscheduled: checked,
            deleteTasks: checked,
            deletePaymentSales: checked,
            deleteCollections: checked,
            deleteSubscriptions: checked,
            deletePackages: checked,
        });
    };

    const toggle = (key: string) => {
        setSelections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const allChecked = Object.values(selections).every(Boolean);
    const noneChecked = Object.values(selections).every((v) => !v);

    const getCount = (cat: typeof CATEGORIES[number]) => {
        if (!counts) return 0;
        if ("getTotal" in cat) return cat.getTotal(counts);
        if ("countKey" in cat) return counts[cat.countKey] || 0;
        return 0;
    };

    const getCountLabel = (cat: typeof CATEGORIES[number]) => {
        if (!counts) return "";
        if ("getLabel" in cat) return cat.getLabel(counts);
        if ("countKey" in cat) {
            const count = counts[cat.countKey] || 0;
            return `${count} item${count !== 1 ? "s" : ""}`;
        }
        return "";
    };

    const totalSelected = CATEGORIES.reduce((sum, cat) => {
        if (selections[cat.key]) return sum + getCount(cat);
        return sum;
    }, 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Client
                    </DialogTitle>
                    <DialogDescription>
                        {clientName
                            ? <>You are about to permanently delete <strong>{clientName}</strong>. Select the associated data you want to remove:</>
                            : "Select what data to delete along with this client."
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
                        {/* Select All */}
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1.5 -mx-2 transition-colors">
                            <Checkbox
                                checked={allChecked}
                                onCheckedChange={(checked) => toggleAll(!!checked)}
                            />
                            <span className="text-sm font-semibold select-none">Select All</span>
                        </label>

                        <Separator />

                        {/* Category checkboxes */}
                        <div className="space-y-1 max-h-[320px] overflow-y-auto">
                            {CATEGORIES.map((cat) => {
                                const count = getCount(cat);
                                const Icon = cat.icon;
                                return (
                                    <label
                                        key={cat.key}
                                        className={`flex items-center gap-3 cursor-pointer rounded-md px-2 py-2 -mx-2 transition-colors hover:bg-muted/50 ${count === 0 ? "opacity-50" : ""}`}
                                    >
                                        <Checkbox
                                            checked={selections[cat.key]}
                                            onCheckedChange={() => toggle(cat.key)}
                                            disabled={count === 0}
                                        />
                                        <Icon className={`h-4 w-4 ${cat.color}`} />
                                        <div className="flex flex-1 items-center justify-between">
                                            <span className="text-sm font-medium select-none">{cat.label}</span>
                                            <span className="text-xs text-muted-foreground">{getCountLabel(cat)}</span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>

                        <Separator />

                        {/* Always deleted notice */}
                        <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2.5 flex items-start gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />
                            <span>
                                <strong>Client profile & user account</strong> will always be deleted regardless of the above selections.
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                        Failed to load associated data. You can still proceed — all data will be deleted.
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => clientId && onConfirm(clientId, selections)}
                        disabled={isDeleting || loading}
                        className="gap-2"
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        {isDeleting ? "Deleting..." : `Delete Client${totalSelected > 0 ? ` & ${totalSelected} items` : ""}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
