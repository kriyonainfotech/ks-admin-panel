"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { updateClientSubscription } from "@/src/redux/slices/subscriptionSlice";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Package } from "lucide-react";
import { DeliverableEditor } from "./DeliverableEditor";
import { Subscription } from "@/lib/subscriptionData";
import { DeliverableItem } from "@/src/types/subscription";

interface EditPlanDialogProps {
    isOpen: boolean;
    onClose: () => void;
    subscription: Subscription;
}

export function EditPlanDialog({ isOpen, onClose, subscription }: EditPlanDialogProps) {
    const dispatch = useAppDispatch();
    const { isUpdating } = useAppSelector((state) => state.subscription);

    const [pkgName, setPkgName] = useState(subscription.packageName || "");
    const [items, setItems] = useState<DeliverableItem[]>(subscription.deliverables);

    const handleUpdateItem = (index: number, updates: Partial<DeliverableItem>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        await dispatch(updateClientSubscription({
            id: subscription._id,
            packageName: pkgName,
            deliverables: items
        }));
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] flex flex-col max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Save className="h-5 w-5 text-primary" />
                        Edit Subscription Plan
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 gap-4 bg-muted/20 p-4 rounded-lg border">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-muted-foreground">Package Nickname</Label>
                            <Input
                                value={pkgName}
                                onChange={(e) => setPkgName(e.target.value)}
                                placeholder="e.g. Content Plan - Jan 2024"
                                className="font-semibold"
                            />
                        </div>
                    </div>

                    {/* Deliverables */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs uppercase font-bold text-muted-foreground">Active Deliverables</Label>
                            <span className="text-[10px] text-muted-foreground">Changes here affect the current active subscription.</span>
                        </div>
                        <DeliverableEditor
                            items={items}
                            onUpdate={handleUpdateItem}
                            onRemove={handleRemoveItem}
                        />
                    </div>
                </div>

                <DialogFooter className="pt-4 border-t gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isUpdating}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isUpdating || items.length === 0}>
                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
