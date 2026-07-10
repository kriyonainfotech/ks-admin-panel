"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import {
    fetchOptionSets,
    addOptionToSet,
    updateOptionInSet,
    deleteOptionFromSet,
} from "@/src/redux/slices/optionSetSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Loader2, ListPlus, Settings } from "lucide-react";
import { toast } from "sonner";
import { CreateOptionSetDialog } from "@/components/admin/CreateOptionSetDialog";

export function OptionSetManager() {
    const dispatch = useAppDispatch();
    const { optionSets, isLoading } = useAppSelector((state) => state.optionSet);
    const [selectedSetId, setSelectedSetId] = useState<string>("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingOption, setEditingOption] = useState<any>(null);
    const [formData, setFormData] = useState({ label: "", value: "", color: "#000000" });

    useEffect(() => {
        dispatch(fetchOptionSets());
    }, [dispatch]);

    useEffect(() => {
        if (optionSets.length > 0 && !selectedSetId) {
            setSelectedSetId(optionSets[0]._id);
        }
    }, [optionSets, selectedSetId]);

    const currentSet = optionSets.find((s) => s._id === selectedSetId);

    const handleOpenDialog = (option: any = null) => {
        if (option) {
            setEditingOption(option);
            setFormData({ label: option.label, value: option.value, color: option.color });
        } else {
            setEditingOption(null);
            setFormData({ label: "", value: "", color: "#000000" });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSetId) return;

        const submissionData = {
            ...formData,
            value: formData.value.trim().toUpperCase()
        };

        try {
            if (editingOption) {
                await dispatch(
                    updateOptionInSet({
                        setId: selectedSetId,
                        optionId: editingOption._id,
                        data: submissionData,
                    })
                ).unwrap();
                toast.success("Option updated successfully");
            } else {
                await dispatch(
                    addOptionToSet({
                        setId: selectedSetId,
                        option: submissionData as any,
                    })
                ).unwrap();
                toast.success("Option added successfully");
            }
            setIsDialogOpen(false);
        } catch (error: any) {
            toast.error(error || "An error occurred");
        }
    };

    const handleDelete = async (optionId: string) => {
        if (!confirm("Are you sure you want to delete this option?")) return;
        try {
            await dispatch(
                deleteOptionFromSet({
                    setId: selectedSetId,
                    optionId,
                })
            ).unwrap();
            toast.success("Option deleted successfully");
        } catch (error: any) {
            toast.error(error || "An error occurred");
        }
    };

    return (
        <div className="space-y-6">
            {/* NEW: Top Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-lg border border-border/50">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        System Configurations
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Create and manage global option sets for the system.
                    </p>
                </div>
                <CreateOptionSetDialog />
            </div>

            <Card className="w-full border-t-4 border-t-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 border-b bg-muted/10">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold flex items-center gap-3">
                            <span className="bg-primary/10 text-primary p-2 rounded-md">
                                <ListPlus className="h-6 w-6" />
                            </span>
                            {currentSet ? currentSet.name : "Select a Set"}
                        </CardTitle>
                        <CardDescription>
                            Configure values and colors for this specific option set.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Switch Set</Label>
                            <Select value={selectedSetId} onValueChange={setSelectedSetId}>
                                <SelectTrigger className="w-[240px] bg-background">
                                    <SelectValue placeholder="Select Option Set" />
                                </SelectTrigger>
                                <SelectContent>
                                    {optionSets.map((set) => (
                                        <SelectItem key={set._id} value={set._id} className="font-medium">
                                            {set.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground italic">
                            {currentSet?.options.length || 0} options defined in this set
                        </div>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleOpenDialog()}
                            disabled={!selectedSetId}
                            className="h-9 px-4 shadow-sm"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Row to {currentSet?.name.replace(/_/g, " ").toUpperCase() || "Set"}
                        </Button>
                    </div>
                    {isLoading ? (
                        <div className="flex h-[200px] items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : currentSet ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Label</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Preview</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentSet.options.map((option) => (
                                    <TableRow key={option._id}>
                                        <TableCell className="font-medium">{option.label}</TableCell>
                                        <TableCell>{option.value}</TableCell>
                                        <TableCell>
                                            <Badge style={{ backgroundColor: option.color }}>
                                                {option.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenDialog(option)}
                                                    disabled={option.isSystem}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(option._id!)}
                                                    disabled={option.isSystem}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="py-10 text-center text-muted-foreground">
                            No option set selected or found.
                        </div>
                    )}
                </CardContent>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingOption ? "Edit Option" : "Add New Option"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="label">Label</Label>
                                <Input
                                    id="label"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    placeholder="e.g. In Progress"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">Value</Label>
                                <Input
                                    id="value"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value.toUpperCase().replace(/\s+/g, "_") })}
                                    placeholder="e.g. IN_PROGRESS"
                                    className="uppercase"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="color">Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="color"
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="w-12 p-1"
                                    />
                                    <Input
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingOption ? "Save Changes" : "Create Option"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </Card>
        </div>
    );
}
