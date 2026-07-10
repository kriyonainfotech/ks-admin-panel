"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Briefcase, User, Instagram, Facebook, ArrowLeft, ArrowRight, Check, ChevronsUpDown, Plus } from "lucide-react";
import { Team } from "@/lib/teamdata";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchOptionSetByName, addOptionToSet } from "@/src/redux/slices/optionSetSlice";
import { cn } from "@/lib/utils";

interface ClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    teamMembers: Team[];
    admins: any[]; // Add this
    isLoading?: boolean;
}

// Hardcoded fallback removed to use dynamic settings

const STEPS = [
    { id: 1, title: "Basic Info", icon: User },
    { id: 2, title: "Business Info", icon: Briefcase },
    { id: 3, title: "Socials", icon: Facebook },
    { id: 4, title: "Team", icon: User },
];

export function ClientDialog({ open, onOpenChange, onSubmit, initialData, teamMembers, admins, isLoading }: ClientDialogProps) {
    const dispatch = useAppDispatch();
    const { optionSets } = useAppSelector((state) => state.optionSet);
    const [step, setStep] = useState(1);
    const [industryOpen, setIndustryOpen] = useState(false);
    const [newIndustry, setNewIndustry] = useState("");
    const { register, control, handleSubmit, reset, watch, setValue, trigger, formState: { errors } } = useForm();

    // Find the industries option set
    const industrySet = optionSets.find(s => s.name === "industries");
    const industries = industrySet?.options || [];

    useEffect(() => {
        if (open) {
            dispatch(fetchOptionSetByName("industries"));
            setStep(1); // Reset to step 1 on open
            if (initialData) {
                const formData = { ...initialData };
                if (Array.isArray(formData.assignedTeam)) {
                    formData.assignedTeamIds = formData.assignedTeam.map((member: any) =>
                        typeof member === 'object' ? member._id : member
                    );
                    delete formData.assignedTeam;
                }
                // Map assignedAdminId to assignedAdmin if needed
                if (formData.assignedAdminId) {
                    formData.assignedAdmin = formData.assignedAdminId;
                }
                reset(formData);
            } else {
                reset({
                    name: "", email: "", phone: "", businessName: "", businessEmail: "", city: "", state: "", country: "", businessPhone: "", address: "", industry: "", website: "",
                    assignedTeamIds: [],
                    assignedAdmin: "",
                    status: "Active",
                    socials: { facebookId: "", facebookPassword: "", instagramId: "", instagramPassword: "" }
                });
            }
        }
    }, [open, initialData, reset]);

    const handleNext = async (e: React.MouseEvent) => {
        e.preventDefault();
        let fieldsToValidate: string[] = [];

        // Validate required fields based on current step
        if (step === 1) fieldsToValidate = ['name', 'email', 'phone'];
        if (step === 2) fieldsToValidate = ['businessName'];

        let isValid = true;
        if (fieldsToValidate.length > 0) {
            isValid = await trigger(fieldsToValidate);
        }

        if (isValid) {
            setStep((s) => Math.min(s + 1, 4));
        }
    };

    const handleBack = () => {
        setStep((s) => Math.max(s - 1, 1));
    };

    const handleFormSubmit = (data: any) => {
        const payload = { ...data };
        if (payload.assignedTeamIds) {
            payload.assignedTeam = payload.assignedTeamIds;
            delete payload.assignedTeamIds;
        }
        onSubmit(payload);
    };

    const handleSaveIndustry = async () => {
        const trimmed = newIndustry.trim();
        if (!trimmed) return;

        try {
            // Find the industries set ID
            if (!industrySet) return;

            const newOption = {
                label: trimmed,
                value: trimmed.toUpperCase().replace(/\s+/g, "_"),
                color: "#6b7280" // Default gray color
            };

            await dispatch(addOptionToSet({
                setId: industrySet._id,
                option: newOption as any
            })).unwrap();

            setValue("industry", newOption.value);
            setNewIndustry("");
            setIndustryOpen(false);
        } catch (error) {
            console.error("Failed to add industry:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !isLoading && onOpenChange(val)}>
            <DialogContent className="w-full sm:max-w-[600px] h-[90vh] sm:h-auto flex flex-col">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Client Profile" : "Onboard New Client"}</DialogTitle>

                    {/* Progress Indicator */}
                    <div className="pt-4 ">
                        <div className="flex items-center justify-between mb-2 px-1">
                            {STEPS.map((s) => (
                                <div key={s.id} className={cn("flex flex-col items-center gap-1", step === s.id ? "text-primary" : "text-muted-foreground")}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all",
                                        step === s.id ? "bg-primary text-primary-foreground border-primary" :
                                            step > s.id ? "bg-primary/20 text-primary border-primary" : "bg-background"
                                    )}>
                                        {step > s.id ? "✓" : s.id}
                                    </div>
                                    <span className="text-[10px] font-medium hidden sm:block">{s.title}</span>
                                </div>
                            ))}
                        </div>
                        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300 ease-in-out"
                                style={{ width: `${((step - 1) / 3) * 100}%` }}
                            />
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1 pr-4 -mr-4">
                        <div className="p-1 space-y-6">

                            {/* --- STEP 1: BASIC INFO --- */}
                            {step === 1 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center gap-2 text-primary font-semibold">
                                        <User size={18} /> Personal Details
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Name <span className="text-red-500">*</span></Label>
                                            <Input {...register("name", { required: true })} placeholder="John Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email <span className="text-red-500">*</span></Label>
                                            <Input {...register("email", { required: true })} placeholder="john@example.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone <span className="text-red-500">*</span></Label>
                                            <Input
                                                {...register("phone", {
                                                    required: "Phone is required",
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
                                            {errors.phone && <p className="text-[10px] text-red-500 font-medium">{errors.phone.message}</p>}
                                        </div>
                                        {!initialData && (
                                            <div className="space-y-2">
                                                <Label>Password</Label>
                                                <Input {...register("password")} type="password" placeholder="••••••" autoComplete="new-password" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* --- STEP 2: BUSINESS INFO --- */}
                            {step === 2 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center gap-2 pb-2 border-b text-primary font-semibold">
                                        <Briefcase size={18} /> Business Info
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Business Name <span className="text-red-500">*</span></Label>
                                            <Input {...register("businessName", { required: true })} placeholder="Acme Corp" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Business Email</Label>
                                            <Input {...register("businessEmail")} placeholder="info@acme.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Business Phone</Label>
                                            <Input
                                                {...register("businessPhone", {
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
                                            {errors.businessPhone && <p className="text-[10px] text-red-500 font-medium">{errors.businessPhone.message}</p>}
                                        </div>
                                        <div className="space-y-2 flex flex-col">
                                            <Label>Industry</Label>
                                            <Popover open={industryOpen} onOpenChange={setIndustryOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={industryOpen}
                                                        className="justify-between w-full font-normal"
                                                    >
                                                        <span className="truncate">
                                                            {industries.find(i => i.value === watch("industry"))?.label || watch("industry") || "Select industry..."}
                                                        </span>
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-0 sm:w-[280px]" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Search industry..." />
                                                        <CommandList>
                                                            <CommandEmpty className="p-2 text-xs text-muted-foreground text-center">
                                                                No industry found.
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {industries.map((item) => (
                                                                    <CommandItem
                                                                        key={item.value}
                                                                        value={item.label}
                                                                        onSelect={() => {
                                                                            setValue("industry", item.value);
                                                                            setIndustryOpen(false);
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                watch("industry") === item.value ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {item.label}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                        <div className="p-2 border-t flex items-center gap-2">
                                                            <Input
                                                                placeholder="+ Add new industry"
                                                                className="h-8 text-xs"
                                                                value={newIndustry}
                                                                onChange={(e) => setNewIndustry(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") {
                                                                        e.preventDefault();
                                                                        handleSaveIndustry();
                                                                    }
                                                                }}
                                                            />
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8"
                                                                onClick={handleSaveIndustry}
                                                                type="button"
                                                                disabled={!newIndustry.trim()}
                                                            >
                                                                <Check className="h-4 w-4 text-green-600" />
                                                            </Button>
                                                        </div>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="col-span-1 sm:col-span-2 space-y-2">
                                            <Label>Address</Label>
                                            <Input {...register("businessAddress")} placeholder="Full office address..." />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-2"><Label>City</Label><Input {...register("city")} /></div>
                                        <div className="space-y-2"><Label>State</Label><Input {...register("state")} /></div>
                                        <div className="space-y-2"><Label>Country</Label><Input {...register("country")} /></div>
                                    </div>
                                </div>
                            )}

                            {/* --- STEP 3: SOCIAL CREDENTIALS --- */}
                            {step === 3 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-lg space-y-4">
                                        <div className="flex items-center gap-2 text-blue-700 font-semibold">
                                            <Facebook size={18} /> Facebook Assets
                                        </div>
                                        <div className="grid gap-3">
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Facebook Id</Label>
                                                <Input {...register("socials.facebookId")} placeholder="Mirosa Official Page" className="bg-white" />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Facebook Password</Label>
                                                <Input {...register("socials.facebookPassword")} placeholder="1234567890" className="bg-white" autoComplete="off" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border border-pink-100 bg-pink-50/50 rounded-lg space-y-4">
                                        <div className="flex items-center gap-2 text-pink-700 font-semibold">
                                            <Instagram size={18} /> Instagram Access
                                        </div>
                                        <div className="grid gap-3">
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Instagram Id</Label>
                                                <Input {...register("socials.instagramId")} placeholder="@mirosajewels" className="bg-white" />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Instagram Password</Label>
                                                <Input {...register("socials.instagramPassword")} type="text" placeholder="Password123" className="bg-white" autoComplete="off" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- STEP 4: TEAM ASSIGNMENT --- */}
                            {step === 4 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center gap-2 pb-2 border-b text-primary font-semibold">
                                        <User size={18} /> Assignments
                                    </div>

                                    {/* Admin Assignment (Managing Admin) */}
                                    <div className="space-y-4 pt-2">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold">Account Manager (Admin)</Label>
                                            <p className="text-[10px] text-muted-foreground">Select the primary admin responsible for this client.</p>
                                        </div>
                                        <Controller
                                            name="assignedAdmin"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select an Admin" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {admins.map((admin) => (
                                                            <SelectItem key={admin._id} value={admin._id}>
                                                                {admin.name} ({admin.email})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <div className="space-y-1 pb-2">
                                            <Label className="text-sm font-bold">Production Team</Label>
                                            <p className="text-[10px] text-muted-foreground">Select team members who will work on this client's tasks.</p>
                                        </div>

                                        <Controller
                                            name="assignedTeamIds"
                                            control={control}
                                            defaultValue={[]}
                                            render={({ field }) => (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {teamMembers.map((member) => {
                                                        const isChecked = field.value?.includes(member._id);
                                                        return (
                                                            <div
                                                                key={member._id}
                                                                className={cn(
                                                                    "p-3 border rounded-md transition-colors cursor-pointer hover:bg-accent",
                                                                    isChecked && "border-primary bg-accent"
                                                                )}
                                                            >
                                                                <label
                                                                    htmlFor={member._id}
                                                                    className="flex items-start space-x-3 cursor-pointer"
                                                                >
                                                                    <Checkbox
                                                                        id={member._id}
                                                                        checked={isChecked}
                                                                        onCheckedChange={(checked) => {
                                                                            const current = field.value || [];
                                                                            field.onChange(
                                                                                checked
                                                                                    ? [...current, member._id]
                                                                                    : current.filter((id: string) => id !== member._id)
                                                                            );
                                                                        }}
                                                                    />
                                                                    <div className="space-y-1">
                                                                        <span className="text-sm font-medium leading-none block">
                                                                            {member.name}
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground block">
                                                                            {member.profile?.specialization || "Team Member"}
                                                                        </span>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                        </div>
                    </ScrollArea>

                    <DialogFooter className="pt-6 mt-auto">
                        <div className="flex w-full justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={step === 1 ? () => onOpenChange(false) : handleBack}
                                disabled={isLoading}
                            >
                                {step === 1 ? "Cancel" : <><ArrowLeft className="mr-2 h-4 w-4" /> Back</>}
                            </Button>

                            {step < 4 ? (
                                <Button type="button" onClick={handleNext}>
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {initialData ? "Update Client" : "Create Client"}
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}