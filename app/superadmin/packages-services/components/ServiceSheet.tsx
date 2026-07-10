"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ServiceSheet({ open, onOpenChange, onSubmit, initialData }: any) {
    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        if (open) reset(initialData || { name: "", category: "SMM", basePrice: 0, unit: "Per Item" });
    }, [open, initialData, reset]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{initialData ? "Edit Service" : "Add New Service"}</SheetTitle>
                </SheetHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
                    <div className="space-y-2">
                        <Label>Service Name</Label>
                        <Input {...register("name", { required: true })} placeholder="e.g. Reel Editing" />
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select onValueChange={(val) => setValue("category", val)} defaultValue={initialData?.category || "SMM"}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SMM">SMM</SelectItem>
                                <SelectItem value="Video">Video</SelectItem>
                                <SelectItem value="Design">Design</SelectItem>
                                <SelectItem value="Ads">Ads</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Base Price (₹)</Label>
                            <Input type="number" {...register("basePrice", { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Unit</Label>
                            <Input {...register("unit")} placeholder="Per Item" />
                        </div>
                    </div>
                    <SheetFooter>
                        <Button type="submit">Save Service</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}