"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { addOptionToSet, deleteOptionFromSet } from "@/src/redux/slices/optionSetSlice";
import { toast } from "sonner";

interface ClientSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ClientSettingsDialog({ open, onOpenChange }: ClientSettingsDialogProps) {
    const dispatch = useAppDispatch();
    const { optionSets } = useAppSelector((state) => state.optionSet);
    const [isSaving, setIsSaving] = useState(false);
    const [newLabel, setNewLabel] = useState("");

    const getOptions = (setName: string) => {
        return optionSets.find(s => s.name === setName)?.options || [];
    };

    const handleAdd = async (setName: string) => {
        if (!newLabel.trim()) return;

        const set = optionSets.find(s => s.name === setName);
        if (!set) {
            toast.error(`OptionSet "${setName}" not found. Please create it first.`);
            return;
        }

        setIsSaving(true);
        try {
            const newOption = {
                label: newLabel.trim(),
                value: newLabel.trim().toUpperCase().replace(/\s+/g, "_"),
                color: "#6b7280"
            };

            await dispatch(addOptionToSet({
                setId: set._id,
                option: newOption as any
            })).unwrap();

            setNewLabel("");
            toast.success("Option added successfully");
        } catch (error: any) {
            toast.error(error || "Failed to add option");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (setName: string, optionId: string) => {
        const set = optionSets.find(s => s.name === setName);
        if (!set) return;

        if (confirm("Are you sure you want to delete this option?")) {
            try {
                await dispatch(deleteOptionFromSet({
                    setId: set._id,
                    optionId
                })).unwrap();
                toast.success("Option deleted successfully");
            } catch (error: any) {
                toast.error(error || "Failed to delete option");
            }
        }
    };

    const renderSection = (setName: string, title: string) => {
        const options = getOptions(setName);
        return (
            <div className="space-y-4 py-4">
                <div className="flex gap-2 items-end border-b pb-4">
                    <div className="flex-1 space-y-2">
                        <Label>Add New {title}</Label>
                        <Input
                            placeholder={`e.g. ${title}`}
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAdd(setName);
                                }
                            }}
                        />
                    </div>
                    <Button onClick={() => handleAdd(setName)} disabled={isSaving || !newLabel.trim()}>
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                        <span className="ml-2">Add</span>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                    {options.length === 0 ? (
                        <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed">
                            <p className="text-sm text-muted-foreground">No options found.</p>
                        </div>
                    ) : (
                        options.map((opt: any) => (
                            <div key={opt._id} className="flex items-center justify-between p-2.5 rounded-md border bg-card hover:bg-accent/50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: opt.color || '#6b7280' }} />
                                    <span className="text-sm font-medium">{opt.label}</span>
                                    {opt.isSystem && (
                                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">System</span>
                                    )}
                                </div>
                                {!opt.isSystem && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDelete(setName, opt._id)}
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
            <DialogContent className="w-full sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Client Configuration Settings</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="industries" className="w-full">
                    <TabsList className="grid w-full grid-cols-1">
                        <TabsTrigger value="industries">Industries</TabsTrigger>
                        {/* Future tabs can be added here */}
                    </TabsList>

                    <TabsContent value="industries">
                        {renderSection("industries", "Industry")}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
