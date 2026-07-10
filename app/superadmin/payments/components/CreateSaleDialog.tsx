"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Loader2, Building2, Wallet, CalendarIcon } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/src/redux/hooks";
import { fetchClients } from "@/src/redux/slices/clientSlice";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Controller } from "react-hook-form";
import { RootState } from "@/src/redux/store";

interface CreateSaleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    isLoading: boolean;
    sale?: any;
}

export function CreateSaleDialog({ open, onOpenChange, onSubmit, isLoading, sale }: CreateSaleDialogProps) {
    const dispatch = useAppDispatch();
    const { clients } = useAppSelector((state: RootState) => state.clients);
    const { user } = useAppSelector((state: RootState) => state.auth);
    const [customerType, setCustomerType] = useState<"client" | "guest">("client");

    const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm();
    const isEdit = !!sale;
    const selectedClientId = watch("clientId");
    const selectedCompany = watch("company");
    const [selectedClientSub, setSelectedClientSub] = useState<any>(null);

    const currentClient = clients.find(c => c.id === selectedClientId);
    const clientSubscriptions = currentClient?.subscriptions || [];

    const isKriyonaStudio = selectedCompany === "Kriyona Studio";

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

    const { selectedCompany: reduxCompany } = useAppSelector((state: RootState) => state.payment);

    useEffect(() => {
        if (open) {
            dispatch(fetchClients());
            if (sale) {
                setCustomerType(sale.isGuest ? "guest" : "client");
                reset({
                    title: sale.title,
                    totalAmount: sale.totalAmount,
                    saleDate: new Date(sale.saleDate),
                    notes: sale.notes || "",
                    company: sale.company,
                    destinationAccount: sale.destinationAccount,
                    clientId: sale.client?.id || sale.client?._id || sale.client,
                    guestName: sale.guestName || "",
                    guestPhone: sale.guestPhone || ""
                });
            } else {
                setCustomerType("client");
                reset({
                    title: "",
                    totalAmount: "",
                    saleDate: (() => {
                        const d = new Date();
                        d.setHours(0, 0, 0, 0);
                        return d;
                    })(),
                    notes: "",
                    company: (reduxCompany && reduxCompany !== "All Companies" ? reduxCompany : userCompany) || "Kriyona Studio",
                    destinationAccount: "Company Bank",
                    clientId: "",
                    guestName: "",
                    guestPhone: ""
                });
            }
        }
    }, [open, dispatch, reset, userCompany, sale, reduxCompany]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (data: any) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const finalCustomerType = customerType;
            // Prepare payload based on tabs
            const payload = {
                ...data,
                totalAmount: Number(data.totalAmount),
                clientId: finalCustomerType === "client" ? data.clientId : null,
                guestName: finalCustomerType === "guest" ? data.guestName : null,
                guestPhone: finalCustomerType === "guest" ? data.guestPhone : null,
            };
            await onSubmit(payload);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Sale Entry" : "New Sale Entry"}</DialogTitle>
                    <DialogDescription>{isEdit ? "Update existing invoice details." : "Create a new invoice or record a deal."}</DialogDescription>
                </DialogHeader>

                <div className="max-h-[80vh] overflow-y-auto pr-2 -mr-2">
                    <Tabs value={customerType} onValueChange={(v) => setCustomerType(v as "client" | "guest")} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="client">Registered Client</TabsTrigger>
                            <TabsTrigger value="guest">Guest / One-Time</TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                            {/* CUSTOMER SELECTION */}
                            {customerType === "client" ? (
                                <>
                                    <div className="grid gap-2">
                                        <Label>Select Client</Label>
                                        <Select
                                            onValueChange={(val) => setValue("clientId", val)}
                                            value={watch("clientId")}
                                        >
                                            <SelectTrigger className="w-full overflow-hidden">
                                                <SelectValue placeholder="Choose a client..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clients.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>{c.businessName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {selectedClientId && clientSubscriptions.length > 0 && (
                                        <div className="grid gap-2 mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                            <Label className="text-blue-700">Select Active Package (Auto-fills Title & Price)</Label>
                                            <div className="space-y-3">
                                                <Select
                                                    onValueChange={(val) => {
                                                        const sub = clientSubscriptions.find((s: any) => s.id === val);
                                                        if (sub) {
                                                            setValue("title", sub.packageName);
                                                            setValue("totalAmount", sub.packagePrice);
                                                            setSelectedClientSub(sub);
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="bg-white overflow-hidden w-full">
                                                        <SelectValue placeholder="Choose a package..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {clientSubscriptions.map((sub: any) => (
                                                            <SelectItem key={sub.id} value={sub.id}>
                                                                {sub.packageName} (₹{sub.packagePrice})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                {selectedClientSub && (
                                                    <div className="flex justify-between items-center p-2 bg-white/50 rounded border border-blue-200 text-xs">
                                                        <span className="font-semibold text-blue-800">Selected: {selectedClientSub.packageName}</span>
                                                        <span className="font-bold text-blue-900">₹{selectedClientSub.packagePrice}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Customer Name</Label>
                                        <Input {...register("guestName", { required: customerType === "guest" })} placeholder="e.g. Rahul" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Phone (Optional)</Label>
                                        <Input
                                            {...register("guestPhone", {
                                                pattern: {
                                                    value: /^[0-9]{10}$/,
                                                    message: "Please enter exactly 10 digits"
                                                }
                                            })}
                                            type="tel"
                                            maxLength={10}
                                            placeholder="9876543210"
                                        />
                                        {/* @ts-ignore */}
                                        {errors.guestPhone && <p className="text-[10px] text-red-500 font-medium">{errors.guestPhone.message}</p>}
                                    </div>
                                </div>
                            )}

                            {/* COMMON FIELDS */}
                            <div className="grid gap-2">
                                <Label>Work Title / Description</Label>
                                <Input {...register("title", { required: true })} placeholder="e.g. Logo Design" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Total Amount (₹)</Label>
                                    <Input type="number" {...register("totalAmount", { required: true, min: 1 })} placeholder="0.00" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Date</Label>
                                    <Controller
                                        control={control}
                                        name="saleDate"
                                        render={({ field }) => (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "dd MMM yyyy, hh:mm a")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 flex flex-col" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={(date) => {
                                                            if (!date) return;
                                                            const newDate = new Date(date);
                                                            if (field.value) {
                                                                newDate.setHours(field.value.getHours());
                                                                newDate.setMinutes(field.value.getMinutes());
                                                            } else {
                                                                newDate.setHours(0, 0, 0, 0);
                                                            }
                                                            field.onChange(newDate);
                                                        }}
                                                        disabled={(date) =>
                                                            date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                    <div className="p-3 border-t border-border flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <Label className="text-xs">Time</Label>
                                                            <div className="flex items-center gap-1">
                                                                <Select
                                                                    value={field.value ? field.value.getHours().toString().padStart(2, '0') : "00"}
                                                                    onValueChange={(h) => {
                                                                        const newDate = new Date(field.value || new Date());
                                                                        newDate.setHours(parseInt(h));
                                                                        field.onChange(newDate);
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="h-8 w-[65px] text-xs">
                                                                        <SelectValue placeholder="HH" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Array.from({ length: 24 }).map((_, i) => (
                                                                            <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                                                                {i.toString().padStart(2, '0')}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <span className="text-xs">:</span>
                                                                <Select
                                                                    value={field.value ? field.value.getMinutes().toString().padStart(2, '0') : "00"}
                                                                    onValueChange={(m) => {
                                                                        const newDate = new Date(field.value || new Date());
                                                                        newDate.setMinutes(parseInt(m));
                                                                        field.onChange(newDate);
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="h-8 w-[65px] text-xs">
                                                                        <SelectValue placeholder="MM" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Array.from({ length: 60 }).map((_, i) => (
                                                                            <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                                                                {i.toString().padStart(2, '0')}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* COMPANY & ACCOUNT SELECTION */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="flex items-center gap-2">
                                        <Building2 className="h-3 w-3" /> Company
                                    </Label>
                                    <Select
                                        onValueChange={(val) => setValue("company", val)}
                                        value={selectedCompany}
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
                            </div>

                            <div className="grid gap-2">
                                <Label>Notes (Optional)</Label>
                                <Textarea {...register("notes")} placeholder="Any details..." />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                                <Button type="submit" disabled={isLoading || isSubmitting}>
                                    {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isEdit ? "Update Entry" : "Create Entry"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}