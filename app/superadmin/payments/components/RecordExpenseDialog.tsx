"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/src/redux/hooks";
import { RootState } from "@/src/redux/store";

interface RecordExpenseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    isLoading: boolean;
    expense?: any; // Added for editing
}

export function RecordExpenseDialog({ open, onOpenChange, onSubmit, isLoading, expense }: RecordExpenseDialogProps) {
    const { stats, selectedCompany: reduxCompany } = useAppSelector((state: RootState) => state.payment);
    const { user } = useAppSelector((state: RootState) => state.auth);
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
    const selectedAccount = watch("destinationAccount") || "Company Bank";
    const selectedCompany = watch("company");

    // Determine the relevant balance for validation based on selected account
    // For editing, we should add back the original expense amount to the available balance
    const originalAmount = (expense && expense.destinationAccount === selectedAccount) ? Number(expense.amountCollected) : 0;

    const availableBalance = stats ? (
        (selectedAccount === "Cash" ? stats.byAccount.cash :
            selectedAccount === "Company Bank" ? stats.byAccount.company :
                stats.byAccount.personal) + originalAmount
    ) : 0;

    // Ownership Mapping
    const ownerMap: Record<string, string> = {
        "nayanbhisara@kriyonastudio.com": "Kriyona Studio",
        "prarthanavaghani@kriyonastudio.com": "PrimeAdwork",
        "kirtannarola@kriyonastudio.com": "Kriyona Infotech",
    };

    const userCompany = ownerMap[user?.email || ""] || null;
    const isSuperadmin = user?.role === "Superadmin";
    const isGlobalAdmin = user?.role === "Superadmin";
    const canSwitchCompany = isGlobalAdmin || isSuperadmin;

    const allowedCompanies = useMemo(() => {
        if (!user) return [];
        if (isGlobalAdmin) return ["Kriyona Studio", "PrimeAdwork", "Kriyona Infotech"];

        const list: string[] = [];
        if (user.company) {
            const name = typeof user.company === 'string' ? user.company : user.company.name;
            if (name) list.push(name);
        }
        if (user.accessibleCompanies) {
            user.accessibleCompanies.forEach((c: any) => {
                if (c.name && !list.includes(c.name)) list.push(c.name);
            });
        }
        return list;
    }, [user, isGlobalAdmin]);

    useEffect(() => {
        if (open) {
            if (expense) {
                reset({
                    partyName: expense.payerName || "",
                    amountPaid: expense.amountCollected || "",
                    company: expense.company || "Kriyona Studio",
                    destinationAccount: expense.destinationAccount || "Cash",
                    expenseCategory: expense.expenseCategory || "Operational",
                    paymentMode: expense.paymentMode || "Cash",
                    date: expense.collectionDate ? new Date(expense.collectionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    notes: expense.notes || ""
                });
            } else {
                reset({
                    partyName: "",
                    amountPaid: "",
                    company: (reduxCompany && reduxCompany !== "All Companies" ? reduxCompany : userCompany) || "Kriyona Studio",
                    destinationAccount: "Company Bank",
                    expenseCategory: "Operational",
                    paymentMode: "Online",
                    date: new Date().toISOString().split('T')[0],
                    notes: ""
                });
            }
        }
    }, [open, reset, userCompany, isGlobalAdmin, reduxCompany, expense]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (data: any) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                amountPaid: Number(data.amountPaid)
            };
            // If editing, we pass the ID back
            if (expense?._id) {
                await onSubmit({ id: expense._id, data: payload });
            } else {
                await onSubmit(payload);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatINR = (amt: number) => new Intl.NumberFormat('en-IN').format(amt);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Record Expense (Spending)</DialogTitle>
                    <DialogDescription>
                        Deduct amount from your collection for office work, petrol, etc.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[80vh] overflow-y-auto pr-2 -mr-2">
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">

                        {/* 1. PAID FROM (ACCOUNT SELECTION) - MOVED TO TOP */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="flex items-center gap-2">
                                    <Wallet className="h-3 w-3" /> Paid From (Method)
                                </Label>
                                <Select
                                    value={selectedAccount}
                                    onValueChange={(val) => {
                                        setValue("destinationAccount", val);
                                        if (val === "Cash") setValue("paymentMode", "Cash");
                                        else setValue("paymentMode", "Online");
                                    }}
                                >
                                    <SelectTrigger className="w-full overflow-hidden border-blue-200 bg-blue-50/30">
                                        <SelectValue placeholder="Select account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Company Bank">Company Bank (₹{formatINR(stats?.byAccount.company || 0)})</SelectItem>
                                        <SelectItem value="Personal Bank">Personal Bank (₹{formatINR(stats?.byAccount.personal || 0)})</SelectItem>
                                        <SelectItem value="Cash">Cash (₹{formatINR(stats?.byAccount.cash || 0)})</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Expense Category</Label>
                                <Select
                                    defaultValue="Operational"
                                    onValueChange={(val) => setValue("expenseCategory", val)}
                                >
                                    <SelectTrigger className="w-full overflow-hidden">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Operational">Operational Expense</SelectItem>
                                        <SelectItem value="Salary">Salary / Payout</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 2. AMOUNT & PAID TO */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Paid To / Purpose</Label>
                                <Input
                                    {...register("partyName", { required: true })}
                                    placeholder="e.g. Petrol, Tea..."
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex justify-between items-center">
                                    <Label>Amount (₹)</Label>
                                    <span className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                        availableBalance <= 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                                    )}>
                                        Avail: ₹{formatINR(availableBalance)}
                                    </span>
                                </div>
                                <Input
                                    type="number"
                                    {...register("amountPaid", {
                                        required: "Required",
                                        min: { value: 1, message: "Min 1" },
                                        validate: (val) => Number(val) <= availableBalance || "Insufficient Balance"
                                    })}
                                    placeholder="0.00"
                                    className={errors.amountPaid ? "border-red-500 focus-visible:ring-red-500" : "border-emerald-200 focus-visible:ring-emerald-500"}
                                />
                                {errors.amountPaid && (
                                    <span className="text-[10px] text-red-500 font-bold">{errors.amountPaid.message as string}</span>
                                )}
                            </div>
                        </div>

                        {/* 3. COMPANY & DATE */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="flex items-center gap-2">
                                    <Building2 className="h-3 w-3" /> Company
                                </Label>
                                <Select
                                    value={selectedCompany}
                                    onValueChange={(val) => setValue("company", val)}
                                    disabled={!canSwitchCompany || allowedCompanies.length <= 1}
                                >
                                    <SelectTrigger className={(!canSwitchCompany || allowedCompanies.length <= 1) ? "bg-slate-50 opacity-80 overflow-hidden w-full" : ""}>
                                        <SelectValue placeholder="Select company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allowedCompanies.map((name) => (
                                            <SelectItem key={name} value={name}>{name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Date</Label>
                                <Input type="date" {...register("date")} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Notes (Optional)</Label>
                            <Textarea {...register("notes")} placeholder="Any extra details..." />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={isLoading || isSubmitting || availableBalance <= 0} className="bg-red-600 hover:bg-red-700 text-white">
                                {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Record Spending
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
