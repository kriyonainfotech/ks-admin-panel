"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchTeam } from "@/src/redux/slices/teamSlice";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";

interface AdminDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => void;
    initialData?: any | null;
    isLoading?: boolean;
    clients?: any[]; // Add this
}

export function AdminDialog({ open, onOpenChange, onSubmit, initialData, isLoading, clients = [] }: AdminDialogProps) {
    const dispatch = useAppDispatch();
    const { members: teamMembers } = useAppSelector((state) => state.team);
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
    const selectedTeamIds = watch("assignedTeamMembers") || [];
    const selectedClientIds = watch("assignedClients") || [];

    useEffect(() => {
        if (open) {
            dispatch(fetchTeam());
        }
    }, [open, dispatch]);

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    email: initialData.email,
                    phone: initialData.phone || "",
                    status: initialData.status,
                    role: initialData.role || "Admin",
                    specialization: initialData.profile?.specialization || "Management",
                    skills: initialData.profile?.skills?.join(", ") || "",
                    salary: initialData.profile?.salary?.amount || "",
                    experience: initialData.profile?.experience || "",
                    street: initialData.profile?.address?.street || "",
                    city: initialData.profile?.address?.city || "",
                    state: initialData.profile?.address?.state || "",
                    country: initialData.profile?.address?.country || "",
                    emergency1Name: initialData.profile?.emergencyContact1?.name || "",
                    emergency1Phone: initialData.profile?.emergencyContact1?.phone || "",
                    emergency2Name: initialData.profile?.emergencyContact2?.name || "",
                    emergency2Phone: initialData.profile?.emergencyContact2?.phone || "",
                    notes: typeof initialData.profile?.notes === 'string' ? initialData.profile.notes : initialData.profile?.notes?.type || "",
                    timingStart: initialData.profile?.timing?.start || "9:00 AM",
                    timingEnd: initialData.profile?.timing?.end || "7:00 PM",
                    bankName: initialData.profile?.bankInfo?.bankName || "",
                    accountNumber: initialData.profile?.bankInfo?.accountNumber || "",
                    ifscCode: initialData.profile?.bankInfo?.ifscCode || "",
                    assignedTeamMembers: initialData.assignedTeamMembers?.map((m: any) => m._id || m.id || m) || [],
                    assignedClients: initialData.assignedClients?.map((c: any) => c._id || c.id || c) || []
                });
            } else {
                reset({
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                    status: "Active",
                    role: "Admin",
                    specialization: "Management",
                    skills: "",
                    salary: "",
                    experience: "",
                    street: "",
                    city: "",
                    state: "",
                    country: "",
                    emergency1Name: "",
                    emergency1Phone: "",
                    emergency2Name: "",
                    emergency2Phone: "",
                    notes: "",
                    timingStart: "9:00 AM",
                    timingEnd: "7:00 PM",
                    bankName: "",
                    accountNumber: "",
                    ifscCode: "",
                    assignedTeamMembers: [],
                    assignedClients: []
                });
            }
        }
    }, [initialData, open, reset]);

    const onFormSubmit = (data: any) => {
        const formattedData = {
            ...data,
            skills: typeof data.skills === 'string' ? data.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : data.skills,
            salary: {
                amount: Number(data.salary),
                type: "Monthly",
                currency: "INR"
            },
            notes: data.notes || "",
            timing: {
                start: data.timingStart,
                end: data.timingEnd
            },
                bankInfo: {
                    bankName: data.bankName,
                    accountNumber: data.accountNumber,
                    ifscCode: data.ifscCode
                },
                assignedClients: data.assignedClients || []
            };
            onSubmit(formattedData);
        };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-[860px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Admin Member" : "Add New Admin"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onFormSubmit)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input {...register("name", { required: true })} placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" {...register("email", { required: true })} placeholder="admin@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                                {...register("phone", {
                                    required: true,
                                    pattern: /^[0-9]{10}$/
                                })}
                                maxLength={10}
                                placeholder="9876543210"
                            />
                        </div>
                        {!initialData && (
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <Input type="password" {...register("password", { required: true })} placeholder="••••••" autoComplete="new-password" />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select onValueChange={(val) => setValue("role", val)} defaultValue="Admin" disabled>
                                <SelectTrigger className="w-full overflow-hidden"><SelectValue placeholder="System Role" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Superadmin" disabled>Superadmin</SelectItem>
                                    <SelectItem value="Team" disabled>Team Member</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator className="my-2" />
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Address Details</Label>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>Street</Label>
                            <Input {...register("street")} placeholder="123 Main Street" />
                        </div>
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Input {...register("city")} />
                        </div>
                        <div className="space-y-2">
                            <Label>State</Label>
                            <Input {...register("state")} />
                        </div>
                        <div className="space-y-2">
                            <Label>Country</Label>
                            <Input {...register("country")} />
                        </div>
                    </div>

                    <Separator className="my-2" />
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Specialization</Label>
                            <Input {...register("specialization")} placeholder="e.g. Management" />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select onValueChange={(val) => setValue("status", val)} defaultValue={initialData?.status || "Active"}>
                                <SelectTrigger className="w-full overflow-hidden"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Monthly Salary (₹)</Label>
                            <Input type="number" {...register("salary")} />
                        </div>
                        <div className="space-y-2">
                            <Label>Experience</Label>
                            <Input {...register("experience")} />
                        </div>
                        <div className="space-y-2">
                            <Label>Skills</Label>
                            <Input {...register("skills")} placeholder="Management, Strategy" />
                        </div>
                    </div>

                    <Separator className="my-2" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Assign Team Members (Managers Only)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full justify-between min-h-[40px] h-auto"
                                        >
                                            <div className="flex flex-wrap gap-1 text-left">
                                                {selectedTeamIds.length > 0 ? (
                                                    selectedTeamIds.map((id: string) => {
                                                        const member = teamMembers.find((m: any) => m._id === id);
                                                        return (
                                                            <Badge key={id} variant="secondary" className="mr-1">
                                                                {member?.name || id}
                                                                <X
                                                                    className="ml-1 h-3 w-3 cursor-pointer"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const newVal = selectedTeamIds.filter((tid: string) => tid !== id);
                                                                        setValue("assignedTeamMembers", newVal);
                                                                    }}
                                                                />
                                                            </Badge>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-muted-foreground">Select team members to manage...</span>
                                                )}
                                            </div>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search team members..." />
                                            <CommandList>
                                                <CommandEmpty>No team member found.</CommandEmpty>
                                                <CommandGroup>
                                                    {teamMembers.map((member: any) => (
                                                        <CommandItem
                                                            key={member._id}
                                                            onSelect={() => {
                                                                const newVal = selectedTeamIds.includes(member._id)
                                                                    ? selectedTeamIds.filter((id: string) => id !== member._id)
                                                                    : [...selectedTeamIds, member._id];
                                                                setValue("assignedTeamMembers", newVal);
                                                            }}
                                                        >
                                                            <Checkbox
                                                                checked={selectedTeamIds.includes(member._id)}
                                                                className="mr-2"
                                                            />
                                                            <div className="flex flex-col">
                                                                <span>{member.name}</span>
                                                                <span className="text-xs text-muted-foreground">{member.email} - {member.specialization}</span>
                                                            </div>
                                                            <Check
                                                                className={cn(
                                                                    "ml-auto h-4 w-4",
                                                                    selectedTeamIds.includes(member._id) ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="space-y-4 pt-4 border-t mt-2">
                             <Label className="text-sm font-bold">Assign Clients (Account Management)</Label>
                             <Popover>
                                 <PopoverTrigger asChild>
                                     <Button
                                         variant="outline"
                                         role="combobox"
                                         className="w-full justify-between min-h-[40px] h-auto"
                                     >
                                         <div className="flex flex-wrap gap-1 text-left">
                                             {selectedClientIds.length > 0 ? (
                                                 selectedClientIds.map((id: string) => {
                                                     const client = clients.find((c: any) => c.id === id);
                                                     return (
                                                         <Badge key={id} variant="secondary" className="mr-1">
                                                             {client?.businessName || client?.name || id}
                                                             <X
                                                                 className="ml-1 h-3 w-3 cursor-pointer"
                                                                 onClick={(e) => {
                                                                     e.stopPropagation();
                                                                     const newVal = selectedClientIds.filter((cid: string) => cid !== id);
                                                                     setValue("assignedClients", newVal);
                                                                 }}
                                                             />
                                                         </Badge>
                                                     );
                                                 })
                                             ) : (
                                                 <span className="text-muted-foreground">Select clients to manage...</span>
                                             )}
                                         </div>
                                         <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                     </Button>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-[400px] p-0" align="start">
                                     <Command>
                                         <CommandInput placeholder="Search clients..." />
                                         <CommandList>
                                             <CommandEmpty>No client found.</CommandEmpty>
                                             <CommandGroup>
                                                 {clients.map((client: any) => (
                                                     <CommandItem
                                                         key={client.id}
                                                         onSelect={() => {
                                                             const newVal = selectedClientIds.includes(client.id)
                                                                 ? selectedClientIds.filter((id: string) => id !== client.id)
                                                                 : [...selectedClientIds, client.id];
                                                             setValue("assignedClients", newVal);
                                                         }}
                                                     >
                                                         <Checkbox
                                                             checked={selectedClientIds.includes(client.id)}
                                                             className="mr-2"
                                                         />
                                                         <div className="flex flex-col">
                                                             <span>{client.businessName || client.name}</span>
                                                             <span className="text-xs text-muted-foreground">{client.name} ({client.email})</span>
                                                         </div>
                                                         <Check
                                                             className={cn(
                                                                 "ml-auto h-4 w-4",
                                                                 selectedClientIds.includes(client.id) ? "opacity-100" : "opacity-0"
                                                             )}
                                                         />
                                                     </CommandItem>
                                                 ))}
                                             </CommandGroup>
                                         </CommandList>
                                     </Command>
                                 </PopoverContent>
                             </Popover>
                        </div>

                        <div className="space-y-4">
                             <Label>Internal Notes</Label>
                             <Textarea {...register("notes")} className="min-h-[100px]" placeholder="Add any technical or managerial notes here..." />
                        </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Timing & Bank Information</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Shift Start Time</Label>
                                <Input {...register("timingStart")} placeholder="9:00 AM" />
                            </div>
                            <div className="space-y-2">
                                <Label>Shift End Time</Label>
                                <Input {...register("timingEnd")} placeholder="7:00 PM" />
                            </div>
                            <div className="space-y-2">
                                <Label>Bank Name</Label>
                                <Input {...register("bankName")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Account Number</Label>
                                <Input {...register("accountNumber")} />
                            </div>
                            <div className="space-y-2">
                                <Label>IFSC Code</Label>
                                <Input {...register("ifscCode")} />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Update Admin" : "Create Admin"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}