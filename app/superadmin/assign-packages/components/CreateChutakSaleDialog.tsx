"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAppDispatch } from "@/src/redux/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import axios from "axios";
import { Loader2, ReceiptEuro } from "lucide-react";

interface CreateChutakSaleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: { id: string; businessName: string } | null;
    items: any[];
    dateRange: { from: Date; to: Date } | null;
    onSuccess: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function CreateChutakSaleDialog({ open, onOpenChange, client, items, dateRange, onSuccess }: CreateChutakSaleDialogProps) {
    const [title, setTitle] = useState(
        dateRange
            ? `Chutak Services: ${client?.businessName} ${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
            : "Chutak Services"
    );
    const [company, setCompany] = useState("Kriyona Studio");
    const [destinationAccount, setDestinationAccount] = useState("Company Bank");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalAmount = items.reduce((sum, item) => sum + (item.price || 0), 0);

    const handleSubmit = async () => {
        if (!client || !dateRange) return;

        setIsSubmitting(true);
        try {
            const payload = {
                clientId: client.id,
                title,
                totalAmount,
                company,
                destinationAccount,
                notes: `Generated from ${items.length} Chutak items. ${notes}`,
                saleDate: new Date(), // Using current date for the sale entry
            };

            const response = await axios.post(`${API_URL}/api/payments/sales`, payload, { withCredentials: true });

            if (response.data.success) {
                toast.success("Sale entry created successfully!");
                onSuccess();
                onOpenChange(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create sale entry");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ReceiptEuro className="text-primary" size={20} />
                        Create Sale Entry
                    </DialogTitle>
                    <DialogDescription>
                        Record a financial entry in Payment and Finances for {items.length} items.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="p-4 bg-slate-50 border rounded-lg space-y-1">
                        <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-bold tracking-wider">
                            <span>Client</span>
                            <span>Total Amount</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="font-bold text-slate-800">{client?.businessName}</span>
                            <span className="text-2xl font-black text-primary">₹{totalAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Sale Title / description</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Chutak Services - Jan Week 1"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Company</Label>
                            <Select value={company} onValueChange={setCompany}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select company" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Kriyona Studio">Kriyona Studio</SelectItem>
                                    <SelectItem value="PrimeAdwork">PrimeAdwork</SelectItem>
                                    <SelectItem value="Kriyona Infotech">Kriyona Infotech</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* <div className="space-y-2">
                            <Label>Account</Label>
                            <Select value={destinationAccount} onValueChange={setDestinationAccount}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Company Bank">Company Bank</SelectItem>
                                    <SelectItem value="Personal Bank">Personal Bank</SelectItem>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                </SelectContent>
                            </Select>
                        </div> */}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional details for this sale..."
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !title}
                        className="bg-primary hover:bg-primary/90 text-white"
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Record Sale Entry
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
