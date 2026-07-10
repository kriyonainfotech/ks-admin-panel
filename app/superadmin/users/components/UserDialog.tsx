"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User as UserIcon, Briefcase } from "lucide-react";

interface UserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    isLoading?: boolean;
}

export function UserDialog({ open, onOpenChange, onSubmit, initialData, isLoading }: UserDialogProps) {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

    useEffect(() => {
        if (open) {
            if (initialData) reset(initialData);
            else reset({ status: "Active", source: "Admin Created" });
        }
    }, [open, initialData, reset]);

    return (
        <Dialog open={open} onOpenChange={(val) => !isLoading && onOpenChange(val)}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit App User" : "Create New User"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="personal">Personal Info</TabsTrigger>
                            <TabsTrigger value="business">Business Info</TabsTrigger>
                        </TabsList>

                        {/* TAB 1: PERSONAL */}
                        <TabsContent value="personal" className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input {...register("name", { required: true })} placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input {...register("email", { required: true })} type="email" placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
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
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select onValueChange={(val) => setValue("status", val)} defaultValue={initialData?.status || "Active"}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Blocked">Blocked</SelectItem>
                                            <SelectItem value="Unverified">Unverified</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {!initialData && (
                                    <div className="col-span-2 space-y-2">
                                        <Label>Temporary Password</Label>
                                        <Input {...register("password", { required: true })} type="password" autoComplete="new-password" />
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* TAB 2: BUSINESS */}
                        <TabsContent value="business" className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Business Name</Label>
                                    <Input {...register("businessName")} placeholder="Acme Corp" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Industry</Label>
                                    <Input {...register("industry")} placeholder="Retail" />
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
                                <div className="space-y-2">
                                    <Label>Website</Label>
                                    <Input {...register("website")} placeholder="www.acme.com" />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Address</Label>
                                    <Textarea {...register("businessAddress")} placeholder="Full office address..." />
                                </div>
                            </div>
                        </TabsContent>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? "Update User" : "Create User"}
                            </Button>
                        </DialogFooter>
                    </Tabs>
                </form>
            </DialogContent>
        </Dialog>
    );
}