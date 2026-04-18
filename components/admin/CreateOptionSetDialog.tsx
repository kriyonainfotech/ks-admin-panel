"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { ColorPicker } from "@/components/ui/color-picker";
import { createOptionSet } from "@/src/redux/slices/optionSetSlice";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Loader2 } from "lucide-react";

export function CreateOptionSetDialog() {
    const dispatch = useAppDispatch();
    const { isLoading } = useAppSelector((state) => state.optionSet || { isLoading: false });

    const [open, setOpen] = useState(false);
    const [setName, setSetName] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Local state for the list of options being built
    const [options, setOptions] = useState([
        { label: "Pending", value: "PENDING", color: "#f59e0b" }, // Default example
    ]);

    // Helper: Add a new empty row
    const addRow = () => {
        setOptions([...options, { label: "", value: "", color: "#000000" }]);
    };

    // Helper: Update a specific row
    const updateRow = (index: number, field: string, val: string) => {
        const newOptions = [...options];
        let finalizedVal = val;

        // Auto-format Value to uppercase
        if (field === "value") {
            finalizedVal = val.toUpperCase().replace(/\s+/g, "_");
        }

        newOptions[index] = { ...newOptions[index], [field]: finalizedVal };

        // Auto-generate Value from Label if Value is empty
        if (field === "label" && newOptions[index].value === "") {
            newOptions[index].value = val.toUpperCase().replace(/\s+/g, "_");
        }

        setOptions(newOptions);
    };

    // Helper: Remove a row
    const removeRow = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    // Submit Handler
    const handleSubmit = async () => {
        setError(null);
        if (!setName) return setError("Please provide a Set Name (e.g., task_status)");

        // Strict snake_case validation: no spaces, only lowercase and underscores
        const nameRegex = /^[a-z0-9]+(_[a-z0-9]+)*$/;
        if (!nameRegex.test(setName)) {
            return setError("Set Name must be lowercase and use underscores instead of spaces (e.g. task_status)");
        }

        // Ensure all values are uppercase before submission
        const formattedOptions = options.map(opt => ({
            ...opt,
            value: opt.value.trim().toUpperCase()
        }));

        // Dispatch Redux Action
        const result = await dispatch(createOptionSet({ name: setName, options: formattedOptions }));

        if (createOptionSet.fulfilled.match(result)) {
            setOpen(false);
            setSetName("");
            setOptions([{ label: "", value: "", color: "#000000" }]); // Reset
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" /> Create Option Set
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Dynamic Option Set</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                            {error}
                        </div>
                    )}

                    {/* 1. Set Name Input */}
                    <div className="grid gap-2">
                        <Label>Set Name (Unique ID)</Label>
                        <Input
                            placeholder="e.g. task_status, priority_level"
                            value={setName}
                            onChange={(e) => {
                                setSetName(e.target.value);
                                if (error) setError(null);
                            }}
                        />
                        <p className="text-xs text-muted-foreground">
                            This is the key you will use in your Task Schema (e.g., "task_status").
                        </p>
                    </div>

                    {/* 2. Options Builder Table */}
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Label (Visible)</TableHead>
                                    <TableHead>Value (Database)</TableHead>
                                    <TableHead>Color</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {options.map((opt, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Input
                                                value={opt.label}
                                                onChange={(e) => updateRow(index, "label", e.target.value)}
                                                placeholder="e.g. Done"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                value={opt.value}
                                                onChange={(e) => updateRow(index, "value", e.target.value)}
                                                placeholder="DONE"
                                                className="uppercase"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {/* OUR NEW COLOR PICKER */}
                                            <ColorPicker
                                                color={opt.color}
                                                onChange={(val) => updateRow(index, "color", val)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => removeRow(index)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="p-2 bg-gray-50 border-t flex justify-center">
                            <Button variant="outline" size="sm" onClick={addRow}>
                                <Plus className="w-4 h-4 mr-2" /> Add Option
                            </Button>
                        </div>
                    </div>

                    <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Option Set
                    </Button>

                </div>
            </DialogContent>
        </Dialog>
    );
}