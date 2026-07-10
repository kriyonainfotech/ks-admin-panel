"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lead, defaultStatuses } from "@/lib/leadData";

interface LeadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: Lead | null;
    existingStatuses: string[]; // Pass all unique statuses currently in DB
    existingCities: string[];
    existingPurposes: string[];
    onAddConfig?: (name: string, label: string) => Promise<void>;
    isLoading?: boolean;
    companies?: any[]; // Pass companies list
}

export function LeadDialog({ open, onOpenChange, onSubmit, initialData, existingStatuses, existingCities, existingPurposes, onAddConfig, isLoading, companies }: LeadDialogProps) {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

    // Combine defaults with any new ones found in the DB
    const [statusOpen, setStatusOpen] = useState(false); // Popover state
    const [cityOpen, setCityOpen] = useState(false);
    const [purposeOpen, setPurposeOpen] = useState(false);
    const [newOption, setNewOption] = useState("");

    // Initial Default Values
    const defaultPurposes = ["Social Media"];

    // Init Form
    useEffect(() => {
        if (open) {
            if (initialData) reset(initialData);
            else reset({
                date: new Date().toISOString().split('T')[0], // Today YYYY-MM-DD
                status: "New Lead",
                purpose: "Social Media",
                city: "Surat",
                phone: ""
            });
        }
    }, [open, initialData, reset]);

    const currentStatus = watch("status");
    const currentCity = watch("city");
    const currentPurpose = watch("purpose");

    const renderDynamicSelect = (
        configName: string,
        currentValue: string,
        options: string[],
        isOpen: boolean,
        setOpen: (o: boolean) => void,
        placeholder: string,
        fieldName: string
    ) => {
        const handleSave = async (val: string) => {
            const trimmed = val.trim();
            if (trimmed) {
                setValue(fieldName, trimmed);
                if (onAddConfig) await onAddConfig(configName, trimmed);
                setNewOption("");
                setOpen(false);
            }
        };

        return (
            <Popover open={isOpen} onOpenChange={(open) => {
                setOpen(open);
                if (!open) setNewOption("");
            }}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={isOpen} className="justify-between w-full">
                        <span className="truncate">{currentValue || placeholder}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" side="bottom" align="start">
                    <Command>
                        <CommandInput placeholder={`Search ${fieldName}...`} />
                        <CommandList>
                            <CommandEmpty className="p-2">
                                <p className="text-sm text-muted-foreground">Not found.</p>
                            </CommandEmpty>
                            <CommandGroup>
                                {options.map((opt) => (
                                    <CommandItem
                                        key={opt}
                                        value={opt}
                                        onSelect={() => {
                                            setValue(fieldName, opt);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check className={cn("mr-2 h-4 w-4", currentValue === opt ? "opacity-100" : "opacity-0")} />
                                        {opt}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                        <div className="p-2 border-t flex items-center gap-2">
                            <Input
                                placeholder={`+ Add new ${fieldName}`}
                                className="h-8 text-xs"
                                value={newOption}
                                onChange={(e) => setNewOption(e.target.value)}
                                onKeyDown={async (e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        await handleSave(newOption);
                                    }
                                }}
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleSave(newOption)}
                                type="button"
                            >
                                <Check className="h-4 w-4 text-green-600" />
                            </Button>
                        </div>
                    </Command>
                </PopoverContent>
            </Popover>
        );
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !isLoading && onOpenChange(val)}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Lead" : "Add New Lead"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">

                    {/* Row 1: Date & Status (Dynamic) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" {...register("date", { required: true })} />
                        </div>

                        <div className="space-y-2 flex flex-col">
                            <Label>Status</Label>
                            {renderDynamicSelect("lead_status", currentStatus, Array.from(new Set([...defaultStatuses, ...existingStatuses])), statusOpen, setStatusOpen, "Select Status", "status")}
                        </div>
                    </div>

                    {/* Row: Company (Only for Superadmins) */}
                    {companies && companies.length > 0 && (
                        <div className="space-y-2">
                            <Label>Company</Label>
                            <Select onValueChange={(val) => setValue("company", val)} defaultValue={initialData?.company || ""}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Company" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map((c) => (
                                        <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Row 2: Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Client Name</Label><Input {...register("name", { required: "Name is required" })} /></div>
                        <div className="space-y-2"><Label>Business Name</Label><Input {...register("businessName")} /></div>
                    </div>

                    {/* Row 3: Contact & City */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input
                                {...register("phone", {
                                    required: "Phone number is required",
                                    pattern: {
                                        value: /^\d{10}$/,
                                        message: "Please enter a valid 10-digit phone number"
                                    }
                                })}
                                type="tel"
                                maxLength={10}
                                placeholder="10-digit phone number"
                            />
                            {errors.phone && (
                                <p className="text-xs text-red-500 font-medium">{errors.phone.message as string}</p>
                            )}
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <Label>City</Label>
                            {renderDynamicSelect("lead_city", currentCity, existingCities, cityOpen, setCityOpen, "Select City", "city")}
                        </div>
                    </div>


                    {/* Row 4: Purpose */}
                    <div className="space-y-2 flex flex-col">
                        <Label>Purpose / Service</Label>
                        {renderDynamicSelect("lead_purpose", currentPurpose, Array.from(new Set([...defaultPurposes, ...existingPurposes])), purposeOpen, setPurposeOpen, "Select Purpose", "purpose")}
                    </div>

                    {/* Row 5: Notes */}
                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea {...register("notes")} placeholder="Meeting details, budget, follow-up date..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Lead
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}