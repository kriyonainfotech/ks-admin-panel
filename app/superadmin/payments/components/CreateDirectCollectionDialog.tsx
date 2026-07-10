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
import { useAppSelector } from "@/src/redux/hooks";
import { RootState } from "@/src/redux/store";

interface CreateDirectCollectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    isLoading: boolean;
    collection?: any;
}

export function CreateDirectCollectionDialog({ open, onOpenChange, onSubmit, isLoading, collection }: CreateDirectCollectionDialogProps) {
    const { selectedCompany: reduxCompany } = useAppSelector((state: RootState) => state.payment);
    const { user } = useAppSelector((state: RootState) => state.auth);
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
    const selectedAccount = watch("destinationAccount") || "Company Bank";
    const selectedCompany = watch("company");

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
            if (collection) {
                reset({
                    title: collection.title || collection.payerName || "",
                    amountCollected: collection.amountCollected || "",
                    company: collection.company || "Kriyona Studio",
                    destinationAccount: collection.destinationAccount || "Company Bank",
                    date: collection.collectionDate ? new Date(collection.collectionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    notes: collection.notes || ""
                });
            } else {
                reset({
                    title: "",
                    amountCollected: "",
                    company: (reduxCompany && reduxCompany !== "All Companies" ? reduxCompany : userCompany) || "Kriyona Studio",
                    destinationAccount: "Company Bank",
                    date: new Date().toISOString().split('T')[0],
                    notes: ""
                });
            }
        }
    }, [open, reset, userCompany, isGlobalAdmin, reduxCompany, collection]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (data: any) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                amountCollected: Number(data.amountCollected)
            };
            // If editing, pass ID back
            if (collection?._id) {
                await onSubmit({ id: collection._id, data: payload });
            } else {
                await onSubmit(payload);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{collection ? "Edit Direct Collection" : "Create Direct Collection"}</DialogTitle>
                    <DialogDescription>
                        {collection ? "Update details for this direct collection." : "Record income directly to a bank account without creating a sale entry."}
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[80vh] overflow-y-auto pr-2 -mr-2">
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">

                        {/* TITLE & AMOUNT */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Title / Payer</Label>
                                <Input
                                    {...register("title", { required: true })}
                                    placeholder="e.g. Ad-hoc payment"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Amount (₹)</Label>
                                <Input
                                    type="number"
                                    {...register("amountCollected", {
                                        required: "Required",
                                        min: { value: 1, message: "Min 1" }
                                    })}
                                    placeholder="0.00"
                                />
                                {errors.amountCollected && (
                                    <span className="text-[10px] text-red-500 font-bold">{errors.amountCollected.message as string}</span>
                                )}
                            </div>
                        </div>

                        {/* ACCOUNT SELECTION */}
                        <div className="grid gap-2">
                            <Label className="flex items-center gap-2">
                                <Wallet className="h-3 w-3" /> Destination Account
                            </Label>
                            <Select
                                value={selectedAccount}
                                onValueChange={(val) => {
                                    setValue("destinationAccount", val);
                                }}
                            >
                                <SelectTrigger className="w-full overflow-hidden border-emerald-200 bg-emerald-50/30">
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Company Bank">Company Bank</SelectItem>
                                    <SelectItem value="Personal Bank">Personal Bank</SelectItem>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* COMPANY & DATE */}
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
                            <Button type="submit" disabled={isLoading || isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {collection ? "Update Collection" : "Add Collection"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
