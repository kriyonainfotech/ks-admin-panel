"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CalendarIcon } from "lucide-react";
import { format, startOfDay, isBefore, endOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

import { Task, TaskType } from "@/lib/taskdata";
import { Team } from "@/lib/teamdata";
import { Client } from "@/lib/clientdata";
import { ROLE_CONFIG } from "@/lib/role-configuration";

type Admin = any;

interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: Task | null;
    defaultType?: TaskType;
    lockType?: boolean;
    isLoading?: boolean;
    teamMembers: Team[];
    clients: Client[];
    admins: Admin[];
    defaultAssignee?: string;
    defaultDueDate?: string;
}

export function TaskDialog({
    open, onOpenChange, onSubmit, initialData, defaultType = "Personal", lockType = false, isLoading,
    teamMembers, clients, admins, defaultAssignee = "", defaultDueDate
}: TaskDialogProps) {

    const { register, handleSubmit, reset, setValue, watch } = useForm<Partial<Task>>();
    const taskType = watch("type") as TaskType;
    const dueDate = watch("dueDate");
    const assignedTo = watch("assignedTo");
    const selectedClientId = watch("client") as any;
    const [activeSubscription, setActiveSubscription] = useState<any>(null);

    // Dynamic Role Configuration based on Assignee
    const activeRoleConfig = useMemo(() => {
        if (!assignedTo || assignedTo === "none") return ROLE_CONFIG['default'].form;

        // Find the team member object
        const assigneeId = (assignedTo && typeof assignedTo === 'object') ? (assignedTo as any)._id : assignedTo;
        const member = teamMembers.find(m => m._id === assigneeId);

        if (!member) return ROLE_CONFIG['default'].form;

        const spec = (member.profile?.specialization || (member as any).specialization || "").toLowerCase().trim();
        if (spec.includes("design") || spec.includes("graphic") || spec.includes("art")) return ROLE_CONFIG['design'].form;
        if (spec.includes("video") || spec.includes("edit")) return ROLE_CONFIG['video'].form;
        if (spec.includes("marketing") || spec.includes("market")) return ROLE_CONFIG['marketing'].form;

        return ROLE_CONFIG['default'].form;
    }, [assignedTo, teamMembers]);

    // Filtered Team Members based on Client
    const filteredTeamMembers = useMemo(() => {
        const clientId = (selectedClientId && typeof selectedClientId === 'object') ? (selectedClientId as any)?._id : selectedClientId;
        if (!clientId || clientId === "all" || clientId === "none") return teamMembers;

        const client = clients.find(c => c.id === clientId || (c as any)._id === clientId);
        if (!client) return teamMembers;

        // Backend might send teamMembers as populated objects or IDs
        const assignedIds = client.assignedTeamIds || (client as any).teamMembers || [];
        if (!assignedIds || assignedIds.length === 0) return teamMembers; // Fallback to all if none assigned

        return teamMembers.filter(m => {
            const memberId = m._id;
            return assignedIds.some((id: any) => (typeof id === 'string' ? id : id?._id) === memberId);
        });
    }, [selectedClientId, teamMembers, clients]);

    // Auto-set taskCategory based on team member specialization
    useEffect(() => {
        if (assignedTo && assignedTo !== "none") {
            const assigneeId = (assignedTo && typeof assignedTo === 'object') ? (assignedTo as any)._id : assignedTo;
            const member = teamMembers.find(m => m._id === assigneeId);
            if (member) {
                const spec = member.profile?.specialization || (member as any).specialization;
                if (spec) {
                    setValue("taskCategory", spec as any);
                }
            }
        }
    }, [assignedTo, teamMembers, setValue]);

    // Fetch subscription when client changes
    useEffect(() => {
        const fetchSub = async () => {
            const clientId = (selectedClientId && typeof selectedClientId === 'object') ? (selectedClientId as any)?._id : selectedClientId;
            if (clientId && clientId !== "all") {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/subscriptions/client/${clientId}`);
                    const data = await res.json();
                    if (data.success && data.data) {
                        setActiveSubscription(data.data);
                    } else {
                        setActiveSubscription(null);
                    }
                } catch (error) {
                    console.error("Failed to fetch subscription:", error);
                    setActiveSubscription(null);
                }
            } else {
                setActiveSubscription(null);
            }
        };
        fetchSub();
    }, [selectedClientId]);

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset(initialData);
            } else {
                reset({
                    title: "",
                    description: "",
                    type: defaultType,
                    status: "Pending",
                    dueDate: defaultDueDate || new Date().toISOString(),
                    assignedTo: defaultAssignee, // Use defaultAssignee if provided
                });
            }
        }
    }, [open, initialData, defaultType, reset, defaultDueDate]);

    const handleFormSubmit = (data: Partial<Task>) => {
        // Construct notificationTime logic
        if (data.dueDate && data.notificationTime) {
            try {
                // dueDate is ISO string
                const dateObj = new Date(data.dueDate);

                // Validate dateObj
                if (isNaN(dateObj.getTime())) {
                    console.error("Invalid Due Date provided:", data.dueDate);
                } else {
                    const parts = (data.notificationTime as string).split(':');
                    if (parts.length === 2) {
                        const [hoursStr, minutesStr] = parts;
                        const hours = parseInt(hoursStr, 10);
                        const minutes = parseInt(minutesStr, 10);

                        if (!isNaN(hours) && !isNaN(minutes)) {
                            dateObj.setHours(hours);
                            dateObj.setMinutes(minutes);
                            // Update data with full ISO string
                            data.notificationTime = dateObj.toISOString();
                        }
                    }
                }
            } catch (e) {
                console.error("Error parsing notification time", e);
            }
        }

        // Set assignedModel based on task type
        if (data.type === "Team") {
            (data as any).assignedModel = "Team";
        } else if (data.type === "Admin") {
            (data as any).assignedModel = "Admin";
        } else if (data.type === "Personal") {
            // For personal tasks, the model depends on the creator's role
            // But usually, Admin's personal tasks are in the Admin model (if they use it for login)
            // or User model if they use that. 
            // Based on our context, admins are in Admin model.
            (data as any).assignedModel = "Admin"; 
        }

        onSubmit(data);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !isLoading && onOpenChange(val)}>
            <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Task" : "Create New Task"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">

                    {/* 2. TITLE */}
                    <div className="grid gap-2">
                        <Label>Task Title</Label>
                        <Input {...register("title", { required: true })} placeholder="e.g. Monthly Revenue Report" />
                    </div>

                    {/* 3. DESCRIPTION */}
                    <div className="grid gap-2">
                        <Label>Task Description</Label>
                        <Textarea
                            {...register("description")}
                            placeholder="Add detailed requirements here..."
                            className="min-h-[100px] resize-none"
                        />
                    </div>

                    {/* 5. TEAM ASSIGNMENT LOGIC */}
                    {taskType === "Team" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Assign To (Team)</Label>
                                <Select value={(watch("assignedTo") && typeof watch("assignedTo") === 'object') ? (watch("assignedTo") as any)?._id : watch("assignedTo")} onValueChange={(val) => {
                                    setValue("assignedTo", val);
                                    const member = teamMembers.find(m => m._id === val);
                                    if (member) setValue("assigneeName", member.name);
                                }}>
                                    <SelectTrigger className="w-full overflow-hidden"> <SelectValue placeholder="Select Member" /> </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Unassigned</SelectItem>
                                        {filteredTeamMembers.map(m => (
                                            <SelectItem key={m._id} value={m._id}>{m.name}
                                                ({(() => {
                                                    const role = m.profile.specialization;
                                                    if (role === "design") return "Designer";
                                                    if (role === "video") return "Video Editor";
                                                    if (role === "marketing") return "Marketing";
                                                    if (role === "web") return "Web Developer";
                                                    return role;
                                                })()})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Client (Optional)</Label>
                                <Select value={(watch("client") && typeof watch("client") === 'object') ? (watch("client") as any)?._id : watch("client")} onValueChange={(val) => {
                                    setValue("client", val);
                                    const client = clients.find(c => c.id === val);
                                    if (client) setValue("clientName", client.businessName);
                                }}>
                                    <SelectTrigger className="w-full overflow-hidden"> <SelectValue placeholder="Select Client" /> </SelectTrigger>
                                    <SelectContent>
                                        {clients.map(c => (
                                            <SelectItem key={c.id} value={c.id} className="">{c.businessName} </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* 6. TASK CATEGORY (Auto-filled but editable) */}
                    {(taskType === "Team" || taskType === "Admin" || taskType === "Superadmin") && (
                        <div className="grid gap-2">
                            <Label>Task Category</Label>
                            <Select value={watch("taskCategory")} onValueChange={(val) => setValue("taskCategory", val as any)}>
                                <SelectTrigger className="w-full"> <SelectValue placeholder="Select Category" /> </SelectTrigger>
                                <SelectContent>
                                    {["Creative", "Ads", "Report", "Posting", "Shooting", "design", "video", "marketing", "branding", "web", "Other"].map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* 6. ADMIN ASSIGNMENT LOGIC */}
                    {taskType === "Admin" && (
                        <div className="grid gap-2">
                            <Label>Assign To (Admin)</Label>
                            <Select value={(watch("assignedTo") && typeof watch("assignedTo") === 'object') ? (watch("assignedTo") as any)?._id : watch("assignedTo")}
                                onValueChange={(val) => {
                                    setValue("assignedTo", val);
                                    const admin = admins.find((a: any) => a._id === val);
                                    if (admin) setValue("assigneeName", admin.name);
                                }}>
                                <SelectTrigger className="w-full"> <SelectValue placeholder="Select Admin" /> </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Unassigned</SelectItem>
                                    {admins.map((a: any) => (
                                        <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* 7. DUE DATE AND TASK TIME */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>{activeRoleConfig.dueDateLabel}</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dueDate ? format(new Date(dueDate), "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 flex flex-col" side="top" align="start" sideOffset={4} avoidCollisions={false}>
                                    <Calendar
                                        mode="single"
                                        selected={dueDate ? new Date(dueDate) : undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                                const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                                                setValue("dueDate", utcDate.toISOString());
                                            }
                                        }}
                                        initialFocus
                                        disabled={(date) => {
                                            const today = startOfDay(new Date());
                                            const isPast = isBefore(date, today);

                                            if (activeSubscription) {
                                                const subStart = startOfDay(new Date(activeSubscription.startDate));
                                                const subEnd = endOfDay(new Date(activeSubscription.endDate));
                                                const outsideRange = isBefore(date, subStart) || isBefore(subEnd, date);
                                                return isPast || outsideRange;
                                            }

                                            return isPast;
                                        }}
                                    />
                                    {dueDate && (
                                        <div className="p-2 border-t">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => setValue("dueDate", undefined)}
                                            >
                                                Clear Date
                                            </Button>
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid gap-2">
                            <Label>Task Time</Label>
                            <Input
                                type="time"
                                {...register("notificationTime")}
                                className="w-full cursor-pointer"
                                onClick={(e) => (e.target as any).showPicker?.()}
                            />
                            {/* <p className="text-[10px] text-muted-foreground">
                                Push notification will be sent at this time on the due date.
                            </p> */}
                        </div>
                    </div>

                    {/* 8. POSTING DATE */}
                    {activeRoleConfig.showPostingDate && (
                        <div className="grid gap-2">
                            <Label>{activeRoleConfig.postingDateLabel || "Scheduled Posting Date (Optional)"}</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal", !watch("postingDate") && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {watch("postingDate") ? format(new Date(watch("postingDate")!), "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 flex flex-col" side="top" align="start" sideOffset={4} avoidCollisions={false}>
                                    <Calendar
                                        mode="single"
                                        selected={watch("postingDate") ? new Date(watch("postingDate")!) : undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                                const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                                                setValue("postingDate", utcDate.toISOString());
                                            }
                                        }}
                                        initialFocus
                                        disabled={(date) => {
                                            const today = startOfDay(new Date());
                                            return isBefore(date, today);
                                        }}
                                    />
                                    {watch("postingDate") && (
                                        <div className="p-2 border-t">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => setValue("postingDate", undefined)}
                                            >
                                                Clear Date
                                            </Button>
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Save Changes" : "Create Task"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}