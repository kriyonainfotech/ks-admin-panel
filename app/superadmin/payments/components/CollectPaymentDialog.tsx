"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wallet, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CollectPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    isLoading: boolean;
    sale: any; // The selected sale object
}

export function CollectPaymentDialog({ open, onOpenChange, onSubmit, isLoading, sale }: CollectPaymentDialogProps) {
    const { register, handleSubmit, reset, setValue, watch } = useForm();
    const amountCollected = watch("amountCollected");

    useEffect(() => {
        if (open && sale) {
            reset({
                amountCollected: sale.remainingAmount,
                amountLoss: 0,
                destinationAccount: "Company Bank",
                date: new Date().toISOString().split('T')[0],
                notes: ""
            });
        }
    }, [open, sale, reset]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (data: any) => {
        if (isSubmitting || isLoading) return;

        const collected = Number(data.amountCollected);
        const loss = Number(data.amountLoss);

        // 1. Validation: Amount should not exceed remaining balance
        if (collected > sale.remainingAmount) {
            toast.error(`Cannot collect more than ₹${sale.remainingAmount}`);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                ...data,
                saleId: sale._id,
                amountCollected: collected,
                amountLoss: loss
            });
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!sale) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Collect Payment</DialogTitle>
                    <DialogDescription>
                        Recording payment for <span className="font-bold text-foreground">{sale.title}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[80vh] overflow-y-auto pr-2 -mr-2">
                    <div className="bg-muted/50 p-3 rounded-md text-sm mb-4 flex justify-between">
                        <span>Total Pending: <strong>₹{sale.remainingAmount}</strong></span>
                        <span>Total Deal: ₹{sale.totalAmount}</span>
                    </div>

                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Amount Received (₹)</Label>
                                <Input
                                    type="number"
                                    {...register("amountCollected", { required: true, min: 1 })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Loss / Discount (₹)</Label>
                                <Input
                                    type="number"
                                    {...register("amountLoss")}
                                    placeholder="0.00"
                                />
                                <p className="text-[10px] text-muted-foreground">Amount you won't recover.</p>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label className="flex items-center gap-2">
                                <Wallet className="h-3 w-3" /> Account Type
                            </Label>
                            <Select
                                onValueChange={(val) => {
                                    setValue("destinationAccount", val);
                                    // Automatically set a default payment mode based on account if needed, 
                                    // but the backend handles this via the merged destinationAccount field now.
                                    if (val === "Cash") setValue("paymentMode", "Cash");
                                    else setValue("paymentMode", "Online");
                                }}
                                defaultValue="Company Bank"
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Company Bank">Company Bank</SelectItem>
                                    <SelectItem value="Personal Bank">Personal Bank</SelectItem>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Date</Label>
                            <Input type="date" {...register("date")} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Notes</Label>
                            <Textarea {...register("notes")} placeholder="Transaction ID, etc." />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={isLoading || isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                                {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm Payment
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}