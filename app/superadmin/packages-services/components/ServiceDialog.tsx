"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ServiceCategory } from "@/lib/packageData";

interface ServiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    isLoading?: boolean;
}

export function ServiceDialog({ open, onOpenChange, onSubmit, initialData, isLoading }: ServiceDialogProps) {
    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            name: "", category: ServiceCategory.Marketing, unitPrice: 0, unitName: "Per Item"
        }
    });

    useEffect(() => {
        if (open) {
            reset(initialData || { name: "", category: ServiceCategory.Marketing, unitPrice: 0, unitName: "Per Item" });
        }
    }, [open, initialData, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Service" : "Add New Service"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <Label>Service Name</Label>
                        <Input {...register("name", { required: true })} placeholder="e.g. Reel Editing" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Unit Price (₹)</Label>
                            <Input type="number" {...register("unitPrice", { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Unit Name</Label>
                            <Input {...register("unitName")} placeholder="Per Item" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                            onValueChange={(val) => setValue("category", val as ServiceCategory)}
                            defaultValue={initialData?.category || ServiceCategory.Marketing}
                        >
                            <SelectTrigger className="w-full"><SelectValue placeholder="Select Category" /></SelectTrigger>
                            <SelectContent>
                                {Object.values(ServiceCategory).map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Save Changes" : "Create Service"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
