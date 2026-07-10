"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { deleteSubscription, fetchClientSubscriptions } from "@/src/redux/slices/subscriptionSlice";
import { fetchClients } from "@/src/redux/slices/clientSlice";

interface DeleteSubscriptionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subscriptionId: string;
    packageName: string;
}

export function DeleteSubscriptionDialog({
    open,
    onOpenChange,
    subscriptionId,
    packageName
}: DeleteSubscriptionDialogProps) {
    const dispatch = useAppDispatch();
    const { isUpdating } = useAppSelector((state) => state.subscription);
    const [deleteScheduled, setDeleteScheduled] = useState(true);

    const handleDelete = async () => {
        try {
            await dispatch(deleteSubscription({
                id: subscriptionId,
                options: { 
                    deleteSchedules: deleteScheduled,
                    deleteTasks: deleteScheduled 
                }
            })).unwrap();
            
            // Refetch to sync UI
            dispatch(fetchClients());
            
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to delete subscription:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                        <AlertTriangle size={24} />
                        <DialogTitle>Delete Package Assignment</DialogTitle>
                    </div>
                    <DialogDescription>
                        Are you sure you want to delete the package <span className="font-bold text-slate-900">"{packageName}"</span>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                        <Checkbox 
                            id="delete-forms" 
                            checked={deleteScheduled} 
                            onCheckedChange={(checked) => setDeleteScheduled(!!checked)}
                            className="mt-1 border-red-200 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label 
                                htmlFor="delete-forms" 
                                className="text-sm font-bold text-red-900 cursor-pointer"
                            >
                                Delete Scheduled Forms
                            </Label>
                            <p className="text-[11px] text-red-700 font-medium">
                                If checked, all future tasks and forms scheduled under this package will also be deleted.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isUpdating}
                        className="font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isUpdating}
                        className="bg-red-600 hover:bg-red-700 font-bold gap-2"
                    >
                        {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        Delete Permanently
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
