"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchClientSubscriptions } from "@/src/redux/slices/subscriptionSlice";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Calendar,
    Briefcase,
    ChevronRight,
    Edit2,
    Package,
    Trash2
} from "lucide-react";
import { format } from "date-fns";
import { EditPlanDialog } from "./EditPlanDialog";
import { DeleteSubscriptionModal } from "./DeleteSubscriptionModal";
import { Subscription } from "@/lib/subscriptionData";
import { deleteSubscription, resetSubscriptionState } from "@/src/redux/slices/subscriptionSlice";
import { toast } from "sonner";

interface AssignedPackagesModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: string;
    clientName: string;
}

export function AssignedPackagesModal({
    isOpen,
    onClose,
    clientId,
    clientName
}: AssignedPackagesModalProps) {
    const dispatch = useAppDispatch();
    const { activeSubscriptions, isLoading } = useAppSelector((state) => state.subscription);
    const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const { isUpdating, isSuccess, message } = useAppSelector((state) => state.subscription);

    // Find the actual sub from Redux state to ensure we always have the latest data (e.g. after an edit)
    const currentSelectedSub = activeSubscriptions.find(s => s._id === selectedSubId) || null;

    useEffect(() => {
        if (isOpen && clientId) {
            dispatch(fetchClientSubscriptions(clientId));
        }
    }, [isOpen, clientId, dispatch]);

    const handleEdit = (sub: Subscription) => {
        setSelectedSubId(sub._id);
        setIsEditOpen(true);
    };

    const handleDeleteClick = (sub: Subscription) => {
        setSelectedSubId(sub._id);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async (id: string, options: any) => {
        try {
            await dispatch(deleteSubscription({ id, options })).unwrap();
            setIsDeleteOpen(false);
            toast.success("Package deleted successfully");
        } catch (error: any) {
            toast.error(error || "Failed to delete package");
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Assigned Packages - {clientName}
                        </DialogTitle>
                        <DialogDescription>
                            All active subscription plans for this client.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : activeSubscriptions.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                <Package className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-2" />
                                <p className="text-muted-foreground">No active packages found for this client.</p>
                            </div>
                        ) : (
                            activeSubscriptions.map((sub) => (
                                <Card key={sub._id} className="p-4 hover:border-primary/50 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-lg text-primary">{sub.packageName || "Unnamed Package"}</h4>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {format(new Date(sub.startDate), "MMM d")} - {format(new Date(sub.endDate), "MMM d, yyyy")}
                                                </span>
                                                <Badge variant="outline" className="h-5 text-[10px] uppercase font-bold text-green-600 border-green-200 bg-green-50">
                                                    {sub.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 gap-2 text-primary hover:text-primary hover:bg-primary/10"
                                                onClick={() => handleEdit(sub)}
                                            >
                                                <Edit2 size={14} />
                                                Edit Plan
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDeleteClick(sub)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 border-t pt-3">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Items Included</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {sub.deliverables.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm bg-muted/30 px-2 py-1.5 rounded border border-transparent hover:border-border transition-all">
                                                    <span className="flex items-center gap-2 font-medium">
                                                        <ChevronRight size={12} className="text-primary/50" />
                                                        {item.serviceName || item.name}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-bold text-muted-foreground mr-1">
                                                            ₹{item.price ?? item.basePrice ?? item.unitPrice ?? 0}
                                                        </span>
                                                        <Badge variant="secondary" className="h-5 text-[10px] font-bold">
                                                            × {item.quantity}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {currentSelectedSub && (
                <EditPlanDialog
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    subscription={currentSelectedSub}
                />
            )}

            <DeleteSubscriptionModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                subscriptionId={selectedSubId}
                onConfirm={confirmDelete}
                isDeleting={isUpdating}
            />
        </>
    );
}
