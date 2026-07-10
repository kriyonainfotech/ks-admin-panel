"use client";

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UiField } from "@/lib/uiSchemaData";

const fieldTypes = [
    { value: "text", label: "Text Input" },
    { value: "number", label: "Number Input" },
    { value: "textarea", label: "Long Text (Textarea)" },
    { value: "date", label: "Date Picker" },
    { value: "select", label: "Dropdown Select" },
    { value: "boolean", label: "Checkbox (True/False)" },
];

interface FieldDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (field: UiField) => void;
    fieldToEdit: UiField | null;
}

export function FieldDialog({ isOpen, onClose, onSave, fieldToEdit }: FieldDialogProps) {
    const [formData, setFormData] = useState<Partial<UiField>>({
        label: "",
        key: "",
        type: "text",
        required: false,
        placeholder: "",
        order: 0,
    });

    useEffect(() => {
        if (fieldToEdit) {
            setFormData(fieldToEdit);
        } else {
            setFormData({
                label: "",
                key: "",
                type: "text",
                required: false,
                placeholder: "",
                order: 0,
            });
        }
    }, [fieldToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.label && formData.key && formData.type) {
            onSave(formData as UiField);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{fieldToEdit ? "Edit Field" : "Add New Field"}</DialogTitle>
                    <DialogDescription>
                        Configure the properties for this UI field.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="label">Field Label</Label>
                        <Input
                            id="label"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            placeholder="e.g., Client Name"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="key">System Key (Variable Name)</Label>
                        <Input
                            id="key"
                            value={formData.key}
                            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                            placeholder="e.g., clientName"
                            required
                        />
                        <p className="text-[10px] text-muted-foreground italic">
                            Use camelCase, no spaces. This will be the key in the database.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type">Field Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {fieldTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="placeholder">Placeholder (Optional)</Label>
                        <Input
                            id="placeholder"
                            value={formData.placeholder}
                            onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                            placeholder="e.g., Enter name..."
                        />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <Checkbox
                            id="required"
                            checked={formData.required}
                            onCheckedChange={(checked) => setFormData({ ...formData, required: !!checked })}
                        />
                        <Label htmlFor="required" className="cursor-pointer">Is this field required?</Label>
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
