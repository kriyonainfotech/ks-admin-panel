"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/lib/userData"; // Importing User interface

interface UserViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
}

export function UserViewModal({ open, onOpenChange, user }: UserViewModalProps) {
    // Using useForm just for layout convenience, but inputs will be readOnly
    const { register, reset } = useForm();

    useEffect(() => {
        if (open && user) {
            reset(user);
        }
    }, [open, user, reset]);

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>View User Details</DialogTitle>
                </DialogHeader>

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
                                <Input value={user.name} readOnly />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={user.email} readOnly />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input value={user.phone} readOnly />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Input value={user.status} readOnly />
                            </div>
                            <div className="space-y-2">
                                <Label>Source</Label>
                                <Input value={user.source} readOnly />
                            </div>
                            <div className="space-y-2">
                                <Label>Joined Date</Label>
                                <Input value={user.joinedDate} readOnly />
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB 2: BUSINESS */}
                    <TabsContent value="business" className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Business Name</Label>
                                <Input value={user.businessName || "-"} readOnly />
                            </div>
                            <div className="space-y-2">
                                <Label>Industry</Label>
                                <Input value={user.industry || "-"} readOnly />
                            </div>
                            <div className="space-y-2">
                                <Label>Business Phone</Label>
                                <Input value={user.businessPhone || "-"} readOnly />
                            </div>
                            <div className="space-y-2">
                                <Label>Website</Label>
                                <Input value={user.website || "-"} readOnly />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Address</Label>
                                <Textarea value={user.businessAddress || "-"} readOnly className="resize-none" />
                            </div>
                        </div>
                    </TabsContent>

                    <DialogFooter>
                        <Button type="button" onClick={() => onOpenChange(false)}>Close</Button>
                    </DialogFooter>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
