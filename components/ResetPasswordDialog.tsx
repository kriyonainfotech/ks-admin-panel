"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

interface ResetPasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    id: string | null;
    title?: string;
    description?: string;
    onSubmit: (id: string, data: any) => void;
    isLoading?: boolean;
}

export function ResetPasswordDialog({
    open,
    onOpenChange,
    id,
    title = "Reset Password",
    description = "Enter a new password. This action cannot be undone.",
    onSubmit,
    isLoading,
}: ResetPasswordDialogProps) {
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            reset({ password: "", confirmPassword: "" });
        }
    }, [open, reset]);

    const onFormSubmit = (data: any) => {
        console.log(data);
        if (id) {
            console.log(id);
            // We only send 'password' to the backend, but we validated 'confirmPassword'
            onSubmit(id, { password: data.password });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <Lock size={18} />
                        </div>
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onFormSubmit)} className="grid gap-4 py-4">
                    {/* New Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                            <Input
                                id="new-password"
                                type={showPassword ? "text" : "password"}
                                // placeholder="••••••••"
                                className="pr-10"
                                autoComplete="new-password"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 6, message: "Must be at least 6 characters" }
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && (
                            <span className="text-xs text-red-500">
                                {errors.password.message as string}
                            </span>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <div className="relative">
                            <Input
                                id="confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                // placeholder="••••••••"
                                className="pr-10"
                                autoComplete="new-password"
                                {...register("confirmPassword", {
                                    required: "Please confirm the password",
                                    validate: (val: string) => {
                                        if (watch("password") !== val) {
                                            return "Passwords do not match";
                                        }
                                    },
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <span className="text-xs text-red-500">
                                {errors.confirmPassword.message as string}
                            </span>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Updating..." : "Reset Password"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
