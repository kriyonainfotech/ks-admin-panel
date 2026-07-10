"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/src/redux/hooks";
import { addLeadConfigOption, deleteLeadConfigOption } from "@/src/redux/slices/leadSlice";
import { cn } from "@/lib/utils";

interface LeadSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    configs: any[];
}

export function LeadSettingsDialog({ open, onOpenChange, configs }: LeadSettingsDialogProps) {
    const dispatch = useAppDispatch();
    const [isSaving, setIsSaving] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [newColor, setNewColor] = useState("#000000");

    const getOptions = (name: string) => {
        return configs.find(c => c.name === name)?.options || [];
    };

    const handleAdd = async (name: string) => {
        if (!newLabel.trim()) return;
        setIsSaving(true);
        try {
            await dispatch(addLeadConfigOption({ name, label: newLabel.trim() })).unwrap();
            setNewLabel("");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (name: string, optionId: string) => {
        if (confirm("Are you sure you want to delete this option?")) {
            await dispatch(deleteLeadConfigOption({ name, optionId })).unwrap();
        }
    };

    const renderSection = (name: string, title: string) => {
        const options = getOptions(name);
        return (
            <div className="space-y-4 py-4">
                <div className="flex gap-2 items-end border-b pb-4">
                    <div className="flex-1 space-y-2">
                        <Label>Add New {title}</Label>
                        <Input
                            placeholder={`e.g. ${name === 'lead_city' ? 'Mumbai' : name === 'lead_status' ? 'Follow Up' : 'SEO'}`}
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => handleAdd(name)} disabled={isSaving || !newLabel.trim()}>
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                        <span className="ml-2">Add</span>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                    {options.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No options found.</p>
                    ) : (
                        options.map((opt: any) => (
                            <div key={opt._id} className="flex items-center justify-between p-2 rounded-md border bg-muted/30 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.color || '#000' }} />
                                    <span className="text-sm font-medium">{opt.label}</span>
                                    {opt.isSystem && (
                                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 rounded uppercase font-bold">System</span>
                                    )}
                                </div>
                                {!opt.isSystem && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDelete(name, opt._id)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Lead Configuration Settings</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="status" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="status">Statuses</TabsTrigger>
                        <TabsTrigger value="city">Cities</TabsTrigger>
                        <TabsTrigger value="purpose">Purposes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="status">
                        {renderSection("lead_status", "Status")}
                    </TabsContent>

                    <TabsContent value="city">
                        {renderSection("lead_city", "City")}
                    </TabsContent>

                    <TabsContent value="purpose">
                        {renderSection("lead_purpose", "Purpose")}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
