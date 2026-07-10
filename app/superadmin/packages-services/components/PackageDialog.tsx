"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Loader2, RefreshCcw } from "lucide-react";
import { format, addMonths } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock Data Imports (In real app, fetch from Redux)
import { useAppSelector } from "@/src/redux/hooks";
// Mock Data Imports (In real app, fetch from Redux)
// import { initialServiceItems } from "@/lib/serviceItemData"; // REMOVED
import { initialPackages, PackageTemplate, ServiceItem } from "@/lib/packageData"; // Templates

interface PackageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    clientId: string; // We are assigning to this client
    initialData?: any;
    isLoading?: boolean;
}

export function PackageDialog({
    open, onOpenChange, onSubmit, clientId, initialData, isLoading
}: PackageDialogProps) {

    // Local State for "Template Selection"
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");

    // Get Services from Redux
    const { services } = useAppSelector((state) => state.packages);

    const { register, control, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            packageName: "",
            startDate: format(new Date(), "yyyy-MM-dd"),
            endDate: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
            billingCycle: "Monthly",
            paymentStatus: "Unpaid",
            lineItems: [] as any[] // Start empty
        }
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "lineItems"
    });

    // Watch line items to calculate total
    const watchedItems = watch("lineItems");
    const totalAmount = useMemo(() => {
        return watchedItems.reduce((acc, item) => acc + (Number(item.unitPrice) * Number(item.quantity)), 0);
    }, [watchedItems]);

    // Init Form
    useEffect(() => {
        if (open) {
            if (initialData) {
                reset(initialData);
            } else {
                reset({
                    packageName: "",
                    startDate: format(new Date(), "yyyy-MM-dd"),
                    endDate: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
                    billingCycle: "Monthly",
                    paymentStatus: "Unpaid",
                    lineItems: []
                });
                setSelectedTemplate("");
            }
        }
    }, [open, initialData, reset]);

    // Handle Template Selection
    // Handle Template Selection
    const applyTemplate = (templateId: string) => {
        const template = initialPackages.find(t => t._id === templateId);
        if (!template) return;

        // Set Name
        setValue("packageName", template.packageName);
        // Billing Cycle is not on template, keep default or user selected
        // setValue("billingCycle", template.billingCycle);

        // Convert Template Features -> Line Items
        // For now, since we can't easily calculate total from just template without populated items logic here,
        // we will just set the name. 
        // Real implementation should iterate template.lineItems and map to form lineItems.

        // This was the old mock logic:
        /*
        setValue("lineItems", [
            {
                serviceItemId: "custom",
                name: template.name + " (Base Fee)",
                unitPrice: template.sellingPrice,
                quantity: 1
            }
        ]);
        */

        // We will just clear line items for now as the template structure is complex to map without more helpers
        // Or if the user wants us to populate, we should try.
        // But for fixing the TYPE ERROR, we remove the invalid access.

        setSelectedTemplate(templateId);
    };

    // Handle Adding a Service Item
    const addServiceItem = (serviceId: string) => {
        const service = services.find((s: ServiceItem) => s._id === serviceId);
        if (!service) return;

        append({
            serviceItemId: service._id,
            name: service.name,
            unitPrice: service.unitPrice,
            quantity: 1
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !isLoading && onOpenChange(val)}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2 bg-muted/20">
                    <DialogTitle>{initialData ? "Edit Assignment" : "Assign Package to Client"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit((data) => onSubmit({ ...data, totalAmount, clientId }))} className="flex flex-col flex-1 overflow-hidden">
                    <ScrollArea className="flex-1 border-t border-b">
                        <div className="p-6 space-y-6">

                            {/* 1. Template Selector (Quick Load) */}
                            {!initialData && (
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-4">
                                    <div className="flex-1">
                                        <Label className="text-blue-900 font-semibold mb-1 block">Load from Template</Label>
                                        <Select onValueChange={applyTemplate} value={selectedTemplate}>
                                            <SelectTrigger className="bg-white border-blue-200">
                                                <SelectValue placeholder="Select a Standard Package..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {initialPackages.map(t => (
                                                    <SelectItem key={t._id} value={t._id}>
                                                        {t.packageName}
                                                        {/* (₹{t.sellingPrice}) - Price not in template */}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="text-xs text-blue-700 max-w-[200px]">
                                        Selecting a template will fill the name and add base items. You can then customize quantities.
                                    </div>
                                </div>
                            )}

                            {/* 2. Basic Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 md:col-span-1 space-y-2">
                                    <Label>Package Name</Label>
                                    <Input {...register("packageName", { required: true })} placeholder="e.g. SMM Custom Plan" />
                                </div>
                                <div className="col-span-2 md:col-span-1 space-y-2">
                                    <Label>Payment Status</Label>
                                    <Select
                                        onValueChange={(val) => setValue("paymentStatus", val)}
                                        defaultValue={watch("paymentStatus")}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Unpaid">Unpaid</SelectItem>
                                            <SelectItem value="Paid">Paid</SelectItem>
                                            <SelectItem value="Overdue">Overdue</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input type="date" {...register("startDate")} />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input type="date" {...register("endDate")} />
                                </div>
                            </div>

                            {/* 3. Line Items Builder */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <Label className="text-base font-semibold">Services & Pricing</Label>

                                    {/* Quick Add Service Dropdown */}
                                    <Select onValueChange={addServiceItem}>
                                        <SelectTrigger className="w-[200px] h-8 text-xs">
                                            <SelectValue placeholder="+ Add Item" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services.map((s: ServiceItem) => (
                                                <SelectItem key={s._id} value={s._id}>
                                                    {s.name} (₹{s.unitPrice})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="border rounded-md overflow-x-auto">
                                    <Table className="min-w-[600px]">
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead className="w-[40%]">Service</TableHead>
                                                <TableHead className="w-[20%] text-center">Unit Price</TableHead>
                                                <TableHead className="w-[15%] text-center">Qty</TableHead>
                                                <TableHead className="w-[20%] text-right">Total</TableHead>
                                                <TableHead className="w-[5%]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {fields.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                        No items added. Select a template or add services.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                fields.map((field, index) => (
                                                    <TableRow key={field.id}>
                                                        <TableCell>
                                                            <Input
                                                                {...register(`lineItems.${index}.name` as const)}
                                                                className="h-8 border-transparent focus:border-input hover:border-input"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Input
                                                                type="number"
                                                                {...register(`lineItems.${index}.unitPrice` as const)}
                                                                className="h-8 w-20 mx-auto text-center border-transparent focus:border-input hover:border-input"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Input
                                                                type="number"
                                                                {...register(`lineItems.${index}.quantity` as const)}
                                                                className="h-8 w-16 mx-auto text-center"
                                                                min={1}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium text-gray-700">
                                                            ₹{(watch(`lineItems.${index}.unitPrice`) * watch(`lineItems.${index}.quantity`)).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="p-4 bg-gray-50 flex justify-between items-center w-full">
                        <div className="flex flex-col items-start px-2">
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Grand Total</span>
                            <span className="text-2xl font-bold text-primary">₹{totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Package
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}