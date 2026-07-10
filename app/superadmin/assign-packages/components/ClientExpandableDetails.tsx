"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchClientSubscriptions } from "@/src/redux/slices/subscriptionSlice";
import { fetchChutakItemsByClient, deleteChutakItem } from "@/src/redux/slices/scheduleSlice";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Package,
    Calendar,
    ChevronRight,
    ReceiptText,
    Plus,
    History,
    TrendingUp,
    LayoutGrid,
    AlertCircle,
    Trash2,
    Pencil
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DeleteSubscriptionDialog } from "./DeleteSubscriptionDialog";
import { ChutakDialog } from "./ChutakDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface ClientExpandableDetailsProps {
    client: { id: string; businessName: string };
    activeTab: string;
    onAssignFixed: (subscription?: any) => void;
    onAddChutak: () => void;
    onViewAllChutak: () => void;
    onDownloadBilling: () => void;
}

export function ClientExpandableDetails({
    client,
    activeTab,
    onAssignFixed,
    onAddChutak,
    onViewAllChutak,
    onDownloadBilling
}: ClientExpandableDetailsProps) {
    const dispatch = useAppDispatch();

    // Redux Selectors
    const { activeSubscriptions, isLoading: isSubLoading } = useAppSelector((state) => state.subscription);
    const { items: chutakItems, isLoading: isChutakLoading } = useAppSelector((state) => state.schedule);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [subToDelete, setSubToDelete] = useState<{ id: string; name: string } | null>(null);

    const [editChutakOpen, setEditChutakOpen] = useState(false);
    const [editChutakItem, setEditChutakItem] = useState<any>(null);

    const [deleteChutakId, setDeleteChutakId] = useState<string | null>(null);
    const [deleteChutakDialogOpen, setDeleteChutakDialogOpen] = useState(false);

    const handleDeleteChutak = (id: string) => {
        setDeleteChutakId(id);
        setDeleteChutakDialogOpen(true);
    };

    const confirmDeleteChutak = async () => {
        if (!deleteChutakId) return;
        try {
            await dispatch(deleteChutakItem(deleteChutakId) as any);
        } finally {
            setDeleteChutakDialogOpen(false);
            setDeleteChutakId(null);
        }
    };

    useEffect(() => {
        if (client.id) {
            dispatch(fetchClientSubscriptions(client.id));
            dispatch(fetchChutakItemsByClient({ clientId: client.id }));
        }
    }, [client.id, dispatch]);

    const totalFixedValue = useMemo(() => {
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return activeSubscriptions.reduce((acc, sub) => {
            if (sub.status !== "Active") return acc;

            const startDate = new Date(sub.startDate);
            const endDate = new Date(sub.endDate);

            // Strictly check if the package dates overlap with the current calendar month
            const overlapsCurrentMonth = (startDate <= endOfCurrentMonth && endDate >= startOfCurrentMonth);

            if (!overlapsCurrentMonth) return acc;

            const subTotal = (sub.deliverables || []).reduce((sAcc, item) => {
                const price = item?.price ?? item?.basePrice ?? item?.unitPrice ?? 0;
                return sAcc + (price * (item?.quantity || 0));
            }, 0);
            return acc + subTotal;
        }, 0);
    }, [activeSubscriptions]);

    const totalChutakValue = useMemo(() => {
        return (chutakItems || []).reduce((acc, item) => acc + (item?.price || 0), 0);
    }, [chutakItems]);

    const isLoading = isSubLoading || isChutakLoading;

    return (
        <div className="p-2 bg-white rounded-b-lg border-x border-b border-t-0 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className={cn("grid gap-8", activeTab === "fixed" || activeTab === "chutak" ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2")}>
                {/* --- FIXED PACKAGE SECTION --- */}
                {activeTab === "fixed" && (
                    <Card className="border border-slate-100 shadow-sm bg-white p-6 space-y-6">
                        <div className="flex justify-between items-center pb-0 mb-2 border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-red-50 rounded-xl text-red-600">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-800 uppercase tracking-tight">Active Fixed Packages</h4>
                                    <p className="text-xs text-muted-foreground font-medium">Recurring monthly deliverables</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-4 text-xs font-bold gap-2 bg-white border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all shadow-sm"
                                onClick={() => onAssignFixed()}
                            >
                                <Plus size={14} /> Assign New Package
                            </Button>
                        </div>

                        {isSubLoading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="animate-spin h-6 w-6 text-red-400" />
                            </div>
                        ) : activeSubscriptions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                                <AlertCircle size={24} className="text-red-100" />
                                <p className="text-sm text-muted-foreground italic">No active fixed packages assigned.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {(activeSubscriptions || []).map((sub) => (
                                    <div key={sub?._id || Math.random()} className="group relative space-y-4 p-4 rounded-2xl border border-slate-500 bg-slate-50/30 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                                        <div className="flex justify-between items-center gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-base font-black text-slate-800 tracking-tight">
                                                        {sub?.packageName || "Unnamed Package"}
                                                    </div>
                                                    <Badge className={cn(
                                                        "text-[10px] uppercase h-5 px-2 font-black border",
                                                        sub?.status === "Active" ? "bg-red-50 text-red-700 border-red-100" :
                                                            sub?.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                                "bg-slate-50 text-slate-600 border-slate-100"
                                                    )}>
                                                        {sub?.status}
                                                    </Badge>
                                                    {/* Price moved here with better font size */}
                                                    <span className="ml-2 text-sm font-black text-red-600">
                                                        ₹{(sub?.deliverables || []).reduce((sAcc, item) => {
                                                            const price = item?.price ?? item?.basePrice ?? item?.unitPrice ?? 0;
                                                            return sAcc + (price * (item?.quantity || 0));
                                                        }, 0).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                                                    <Calendar size={12} className="text-slate-300" />
                                                    {sub?.startDate ? format(new Date(sub.startDate), "MMM d") : "N/A"} - {sub?.endDate ? format(new Date(sub.endDate), "MMM d, yyyy") : "N/A"}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 px-4 text-xs font-bold gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all rounded-lg"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAssignFixed(sub);
                                                    }}
                                                >
                                                    <Pencil size={14} />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 px-4 text-xs font-bold gap-2 text-red-600 bg-red-50 hover:bg-red-100 transition-all rounded-lg"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        sub?._id && setSubToDelete({ id: sub._id, name: sub.packageName || "Unnamed Package" });
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {(sub.deliverables || []).map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-xs bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                                                    <span className="flex items-center gap-2 font-bold text-slate-500">
                                                        <ChevronRight size={12} className="text-red-400" />
                                                        {item?.serviceName || item?.name}
                                                    </span>
                                                    <Badge variant="secondary" className="h-5 text-[10px] font-black px-2 bg-slate-50 text-slate-600 border-none">
                                                        ×{item?.quantity || 0}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                        }
                    </Card>
                )}

                {/* --- CHUTAK SECTION --- */}
                {activeTab === "chutak" && (
                    <Card className="border border-slate-100 shadow-sm bg-white p-6 space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-800 uppercase tracking-tight">Recent Chutak Items</h4>
                                    <p className="text-xs text-muted-foreground font-medium">One-off service requests</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 px-4 text-xs font-bold gap-2 bg-red-50 border-red-100 text-red-600 hover:bg-red-100 transition-all shadow-sm"
                                    onClick={onAddChutak}
                                >
                                    <Plus size={14} /> Add Item
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 px-4 text-xs font-bold gap-2 text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                                    onClick={onViewAllChutak}
                                >
                                    <History size={14} /> History
                                </Button>
                            </div>
                        </div>

                        {isChutakLoading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="animate-spin h-6 w-6 text-red-400" />
                            </div>
                        ) : chutakItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                                <LayoutGrid size={24} className="text-slate-100" />
                                <p className="text-sm text-muted-foreground italic">No recent Chutak entries.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                                    {(chutakItems || []).slice(0, 5).map((item) => (
                                        <div key={item?._id || Math.random()} className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <Badge variant="outline" className="text-[10px] font-black uppercase whitespace-nowrap border-slate-200 bg-slate-50 text-slate-500">
                                                    {item?.postType}
                                                </Badge>
                                                <div className="text-sm font-bold text-slate-700 truncate">{item?.content}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-sm font-black text-slate-900 tabular-nums ml-2">₹{item?.price?.toLocaleString() || 0}</div>
                                                <div className="flex items-center gap-2 border-l border-slate-100 pl-3 ml-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100"
                                                        onClick={(e) => { e.stopPropagation(); setEditChutakItem(item); setEditChutakOpen(true); }}
                                                    >
                                                        <Pencil size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100"
                                                        onClick={(e) => { e.stopPropagation(); item?._id && handleDeleteChutak(item._id); }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {chutakItems.length > 5 && (
                                    <p className="text-xs text-center text-muted-foreground font-medium italic pt-2">
                                        + {chutakItems.length - 5} more entries in full history
                                    </p>
                                )}
                            </div>
                        )}
                    </Card>
                )}
            </div>

            {subToDelete && (
                <DeleteSubscriptionDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    subscriptionId={subToDelete.id}
                    packageName={subToDelete.name || "Unnamed Package"}
                />
            )}

            <ChutakDialog open={editChutakOpen} onOpenChange={setEditChutakOpen} client={client} itemToEdit={editChutakItem} />
            <ConfirmDialog
                open={deleteChutakDialogOpen}
                onOpenChange={setDeleteChutakDialogOpen}
                onConfirm={confirmDeleteChutak}
                title="Delete Chutak Item"
                description="Are you sure you want to delete this Chutak item? This action cannot be undone."
            />
        </div>
    );
}
