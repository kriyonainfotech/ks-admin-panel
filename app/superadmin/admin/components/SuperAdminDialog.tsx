"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Loader2, ShieldCheck, Mail, Phone, User, Lock } from "lucide-react";

interface SuperAdminDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
    initialData?: any | null;
}

export function SuperAdminDialog({ open, onOpenChange, onSubmit, isLoading, initialData }: SuperAdminDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm();

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    email: initialData.email,
                    phone: initialData.phone || "",
                });
            } else {
                reset({
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                });
            }
        }
    }, [open, initialData, reset]);

    const onFormSubmit = (data: any) => {
        // If it's an edit and password is empty, don't send it
        if (initialData && !data.password) {
            const { password, ...rest } = data;
            onSubmit(rest);
        } else {
            onSubmit(data);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-0 shadow-2xl">
                {/* Visual Header Accent */}
                <div className="h-2 bg-primary" />
                
                <div className="p-6 space-y-6">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold">
                                    {initialData ? "Edit Superadmin" : "Add New Superadmin"}
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    {initialData 
                                        ? "Update account details for this top-level admin." 
                                        : "Create a new top-level administrator account."}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
                        <div className="space-y-4">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <Label htmlFor="sa-name" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <User size={12} /> Full Name
                                </Label>
                                <Input
                                    id="sa-name"
                                    {...register("name", { required: "Name is required" })}
                                    placeholder="e.g. John Doe"
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                />
                                {errors.name && <p className="text-[10px] font-medium text-destructive mt-1">{(errors.name as any).message}</p>}
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="sa-email" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <Mail size={12} /> Email Address
                                </Label>
                                <Input
                                    id="sa-email"
                                    type="email"
                                    {...register("email", { required: "Email is required" })}
                                    placeholder="admin@company.com"
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                />
                                {errors.email && <p className="text-[10px] font-medium text-destructive mt-1">{(errors.email as any).message}</p>}
                            </div>

                            {/* Phone Field */}
                            <div className="space-y-2">
                                <Label htmlFor="sa-phone" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <Phone size={12} /> Phone Number (Optional)
                                </Label>
                                <Input
                                    id="sa-phone"
                                    {...register("phone")}
                                    placeholder="9876543210"
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                />
                            </div>

                            {/* Password Field - Optional on Edit */}
                            <div className="space-y-2">
                                <Label htmlFor="sa-password" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <Lock size={12} /> {initialData ? "New Password (Leave blank to keep current)" : "Password"}
                                </Label>
                                <Input
                                    id="sa-password"
                                    type="password"
                                    autoComplete="new-password"
                                    {...register("password", {
                                        required: initialData ? false : "Password is required",
                                        minLength: { value: 6, message: "Min 6 characters" }
                                    })}
                                    placeholder="••••••••"
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                />
                                {errors.password && <p className="text-[10px] font-medium text-destructive mt-1">{(errors.password as any).message}</p>}
                            </div>
                        </div>

                        <DialogFooter className="pt-4 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                                className="flex-1 h-11 font-semibold border-slate-200 hover:bg-slate-50 text-slate-600"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 h-11 font-bold shadow-lg shadow-primary/20"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                                        Please wait
                                    </>
                                ) : (
                                    initialData ? "Update Account" : "Create Account"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
