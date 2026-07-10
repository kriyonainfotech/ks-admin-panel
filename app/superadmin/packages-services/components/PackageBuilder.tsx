"use client";
import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash, Search, ArrowRight, Settings2, Loader2 } from "lucide-react";
import { ServiceItem } from "@/lib/packageData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface PackageBuilderProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => void;
    initialData?: any;
    services: ServiceItem[]; // Passed from Redux
    isLoading?: boolean;
}

export function PackageBuilder({ open, onOpenChange, onSubmit, initialData, services, isLoading }: PackageBuilderProps) {
    const { register, control, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: {
            packageName: "",
            billingCycle: "Monthly",
            items: [] as any[],
            sellingPrice: 0,
            active: true
        }
    });

    const { fields, append, remove, update } = useFieldArray({ control, name: "items" });

    // Search State for adding items
    const [searchTerm, setSearchTerm] = useState("");

    // Populate Form on Open
    useEffect(() => {
        if (open) {
            if (initialData) {
                // Transform backend data to form structure
                const formItems = (initialData.lineItems || []).map((li: any) => {
                    const serviceObj = typeof li.item === 'object' ? li.item : {};
                    const serviceId = serviceObj._id || li.item;
                    // Try to find in services list to get latest price/name if possible, otherwise use what's in lineItem
                    const foundService = services.find(s => s._id === serviceId);

                    return {
                        serviceId: serviceId,
                        name: foundService?.name || serviceObj.name || "Unknown Service",
                        basePrice: foundService?.unitPrice || serviceObj.unitPrice || 0,
                        quantity: li.quantity
                    };
                });

                reset({
                    packageName: initialData.packageName || "",
                    billingCycle: initialData.billingCycle || "Monthly",
                    items: formItems,
                    sellingPrice: initialData.sellingPrice || 0,
                    active: initialData.active ?? true
                });
            } else {
                reset({
                    packageName: "",
                    billingCycle: "Monthly",
                    items: [],
                    sellingPrice: 0,
                    active: true
                });
            }
            setSearchTerm("");
        }
    }, [open, initialData, reset, services]);

    // Calculate "Calculated Price" (Sum of ingredients)
    const watchedItems = watch("items");
    const calculatedTotal = useMemo(() => {
        return (watchedItems || []).reduce((acc, item) => acc + (Number(item.basePrice) * Number(item.quantity)), 0);
    }, [watchedItems]);

    // Add Item Logic
    const addItemToCart = (serviceId: string) => {
        const service = services.find(s => s._id === serviceId);
        if (!service) return;

        // Check if already exists
        const items = watchedItems || [];
        const existingIdx = items.findIndex(i => i.serviceId === serviceId);
        if (existingIdx !== -1) {
            // Increment Qty
            update(existingIdx, { ...watchedItems[existingIdx], quantity: watchedItems[existingIdx].quantity + 1 });
        } else {
            // Add New
            append({
                serviceId: service._id,
                name: service.name,
                basePrice: service.unitPrice, // Changed from basePrice to unitPrice
                quantity: 1,
                // scheduleConfig removed
            });
        }
        setSearchTerm(""); // Clear search
    };

    // Filter Services for Search Dropdown
    const filteredServices = services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <Dialog open={open} onOpenChange={(val) => !isLoading && onOpenChange(val)}>
            <DialogContent
                className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 gap-0"
                onInteractOutside={(event) => event.preventDefault()}
            >
                <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle>{initialData ? "Edit Package Template" : "Build New Package"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit((data) => {
                    // Transform for backend
                    const payload = {
                        ...data,
                        sellingPrice: calculatedTotal,
                        calculatedPrice: calculatedTotal,
                        lineItems: data.items.map((i: any) => ({
                            item: i.serviceId,
                            quantity: i.quantity
                        }))
                    };
                    onSubmit(payload);
                })} className="flex flex-col flex-1 overflow-hidden">
                    <ScrollArea className="flex-1">
                        <div className="p-6 space-y-6">
                            {/* 1. Header Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label>Package Name</Label>
                                    <Input {...register("packageName", { required: true })} placeholder="e.g. SMM Standard Plan" />
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label>Billing Cycle</Label>
                                    <Select onValueChange={(val) => setValue("billingCycle", val)} value={watch("billingCycle")}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Monthly">Monthly Recurring</SelectItem>
                                            <SelectItem value="One-Time">One-Time Project</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* 2. The Service Picker (Search Bar) */}
                            <div className="space-y-2">
                                <Label>Add Services</Label>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search services to add (e.g. 'Reel')..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                    {/* Dropdown Results */}
                                    {searchTerm && (
                                        <div className="absolute top-full left-0 right-0 bg-popover border shadow-md rounded-md mt-1 z-10 max-h-[200px] overflow-y-auto">
                                            {filteredServices.length > 0 ? filteredServices.map(s => (
                                                <div
                                                    key={s._id}
                                                    className="p-2 hover:bg-accent cursor-pointer flex justify-between text-sm"
                                                    onClick={() => addItemToCart(s._id)}
                                                >
                                                    <span>{s.name}</span>
                                                    <span className="font-mono">₹{s.unitPrice}</span>
                                                </div>
                                            )) : <div className="p-2 text-sm text-muted-foreground">No services found.</div>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3. The Bundle Table */}
                            <div className="border rounded-md overflow-x-auto">
                                <Table className="min-w-[600px]">
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Service</TableHead>
                                            <TableHead className="w-[100px] text-center">Unit Price</TableHead>
                                            <TableHead className="w-[120px] text-center">Qty</TableHead>
                                            <TableHead className="w-[100px] text-right">Total</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.length === 0 ? (
                                            <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No items added yet.</TableCell></TableRow>
                                        ) : fields.map((field, index) => (
                                            <TableRow key={field.id}>
                                                <TableCell className="font-medium">{watch(`items.${index}.name`)}</TableCell>
                                                <TableCell className="text-center text-muted-foreground">₹{watch(`items.${index}.basePrice`)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => {
                                                            const current = watch(`items.${index}.quantity`);
                                                            if (current > 1) update(index, { ...watchedItems[index], quantity: current - 1 });
                                                        }}>-</Button>
                                                        <span className="w-4 text-center text-sm">{watch(`items.${index}.quantity`)}</span>
                                                        <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => {
                                                            const current = watch(`items.${index}.quantity`);
                                                            update(index, { ...watchedItems[index], quantity: current + 1 });
                                                        }}>+</Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">₹{watch(`items.${index}.basePrice`) * watch(`items.${index}.quantity`)}</TableCell>

                                                <TableCell>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive h-8 w-8"><Trash size={14} /></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* 4. The Price Logic Footer */}
                    <div className="p-4 bg-muted/20 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-6">
                            <div>
                                <Label className="text-xs text-primary uppercase font-bold">Total Price</Label>
                                <div className="text-2xl font-bold text-primary">₹{calculatedTotal.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none" disabled={isLoading}>Cancel</Button>
                            <Button type="submit" className="flex-1 sm:flex-none" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Package
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}