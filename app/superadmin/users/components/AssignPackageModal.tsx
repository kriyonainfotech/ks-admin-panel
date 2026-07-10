// "use client";

// import { useState, useEffect, useMemo } from "react";
// import { useForm, useFieldArray } from "react-hook-form";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Trash, Plus, Calculator, ArrowRight, Loader2 } from "lucide-react";
// import { format, addMonths } from "date-fns";

// // Types from your Inventory
// import { ServiceItem, PackageTemplate } from "@/lib/packageData";

// interface AssignPackageModalProps {
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
//     onSubmit: (data: any) => Promise<void>;
//     targetUser: any; // The User or Client being assigned to
//     templates: PackageTemplate[]; // From Redux
//     services: ServiceItem[];      // From Redux
//     isLoading?: boolean;
// }

// export function AssignPackageModal({
//     open, onOpenChange, onSubmit, targetUser, templates, services, isLoading
// }: AssignPackageModalProps) {

//     const { register, control, handleSubmit, setValue, watch, reset } = useForm({
//         defaultValues: {
//             packageName: "",
//             billingCycle: "Monthly",
//             startDate: format(new Date(), "yyyy-MM-dd"),
//             endDate: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
//             items: [] as any[],
//             manualDiscount: 0,
//         }
//     });

//     const { fields, append, remove, update } = useFieldArray({ control, name: "items" });

//     // --- CALCULATOR LOGIC ---
//     const watchedItems = watch("items");
//     const manualDiscount = watch("manualDiscount");

//     const { subTotal, grandTotal } = useMemo(() => {
//         const sub = watchedItems.reduce((acc, item) => acc + (Number(item.unitPrice) * Number(item.quantity)), 0);
//         const total = sub - Number(manualDiscount);
//         return { subTotal: sub, grandTotal: total > 0 ? total : 0 };
//     }, [watchedItems, manualDiscount]);

//     // --- TEMPLATE LOADER ---
//     const handleTemplateSelect = (templateId: string) => {
//         const template = templates.find(t => t.id === templateId);
//         if (!template) return;

//         setValue("packageName", template.name);
//         setValue("billingCycle", template.billingCycle);

//         // Map Template Items to Editable Lines
//         // Note: In real app, template items might link to Service IDs. We try to match them.
//         const newItems = template.items.map(tItem => {
//             // Find original service to get latest data if needed, or use snapshot
//             const originalService = services.find(s => s.id === tItem.serviceId);
//             return {
//                 serviceId: tItem.serviceId,
//                 name: tItem.name,
//                 unitPrice: tItem.basePrice, // Pre-fill with template price
//                 quantity: tItem.quantity
//             };
//         });
//         setValue("items", newItems);
//     };

//     // --- SERVICE ADDER ---
//     const handleAddService = (serviceId: string) => {
//         const service = services.find(s => s.id === serviceId);
//         if (!service) return;
//         append({ serviceId: service.id, name: service.name, unitPrice: service.basePrice, quantity: 1 });
//     };

//     return (
//         <Dialog open={open} onOpenChange={onOpenChange}>
//             <DialogContent className="sm:max-w-[850px] max-h-[90vh] flex flex-col p-0 gap-0">
//                 <DialogHeader className="p-6 pb-2 border-b bg-muted/10">
//                     <div className="flex justify-between items-start">
//                         <div>
//                             <DialogTitle>Assign Package</DialogTitle>
//                             <p className="text-sm text-muted-foreground mt-1">
//                                 Assigning to: <span className="font-semibold text-primary">{targetUser?.name}</span> ({targetUser?.businessName})
//                             </p>
//                         </div>
//                         {/* Template Quick Load */}
//                         <div className="w-[250px]">
//                             <Select onValueChange={handleTemplateSelect}>
//                                 <SelectTrigger className="bg-background"><SelectValue placeholder="Load Template..." /></SelectTrigger>
//                                 <SelectContent>
//                                     {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                     </div>
//                 </DialogHeader>

//                 <form onSubmit={handleSubmit((data) => onSubmit({ ...data, grandTotal }))} className="flex flex-col flex-1 overflow-hidden">
//                     <ScrollArea className="flex-1">
//                         <div className="p-6 space-y-6">

//                             {/* 1. Contract Terms */}
//                             <div className="grid grid-cols-4 gap-4">
//                                 <div className="col-span-2 space-y-2">
//                                     <Label>Custom Package Name</Label>
//                                     <Input {...register("packageName", { required: true })} placeholder="e.g. SMM Startup Plan" />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label>Start Date</Label>
//                                     <Input type="date" {...register("startDate")} />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label>Billing Cycle</Label>
//                                     <Select onValueChange={(v) => setValue("billingCycle", v)} defaultValue="Monthly">
//                                         <SelectTrigger><SelectValue /></SelectTrigger>
//                                         <SelectContent>
//                                             <SelectItem value="Monthly">Monthly</SelectItem>
//                                             <SelectItem value="One-Time">One-Time</SelectItem>
//                                         </SelectContent>
//                                     </Select>
//                                 </div>
//                             </div>

//                             {/* 2. Line Items (The Cart) */}
//                             <div className="border rounded-md overflow-hidden">
//                                 <div className="bg-muted/30 p-2 border-b flex justify-between items-center">
//                                     <span className="text-sm font-semibold pl-2">Services & Deliverables</span>
//                                     <Select onValueChange={handleAddService}>
//                                         <SelectTrigger className="w-[200px] h-8 text-xs bg-background">
//                                             <SelectValue placeholder="+ Add Service Item" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name} (₹{s.basePrice})</SelectItem>)}
//                                         </SelectContent>
//                                     </Select>
//                                 </div>

//                                 <Table>
//                                     <TableHeader>
//                                         <TableRow>
//                                             <TableHead className="w-[40%]">Service Name</TableHead>
//                                             <TableHead className="w-[15%] text-center">Price (₹)</TableHead>
//                                             <TableHead className="w-[15%] text-center">Qty</TableHead>
//                                             <TableHead className="w-[20%] text-right">Total</TableHead>
//                                             <TableHead className="w-[10%]"></TableHead>
//                                         </TableRow>
//                                     </TableHeader>
//                                     <TableBody>
//                                         {fields.length === 0 ? (
//                                             <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No services added. Select a template or add items manually.</TableCell></TableRow>
//                                         ) : fields.map((field, index) => (
//                                             <TableRow key={field.id}>
//                                                 <TableCell>
//                                                     <Input {...register(`items.${index}.name`)} className="h-8 border-transparent focus:border-input hover:border-input" />
//                                                 </TableCell>
//                                                 <TableCell>
//                                                     <Input type="number" {...register(`items.${index}.unitPrice`)} className="h-8 text-center border-transparent focus:border-input hover:border-input" />
//                                                 </TableCell>
//                                                 <TableCell>
//                                                     <div className="flex items-center justify-center gap-1">
//                                                         <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => {
//                                                             const cur = watch(`items.${index}.quantity`);
//                                                             if (cur > 1) update(index, { ...watchedItems[index], quantity: cur - 1 });
//                                                         }}>-</Button>
//                                                         <span className="w-6 text-center text-sm">{watch(`items.${index}.quantity`)}</span>
//                                                         <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => {
//                                                             const cur = watch(`items.${index}.quantity`);
//                                                             update(index, { ...watchedItems[index], quantity: cur + 1 });
//                                                         }}>+</Button>
//                                                     </div>
//                                                 </TableCell>
//                                                 <TableCell className="text-right font-medium">
//                                                     ₹{(watch(`items.${index}.unitPrice`) * watch(`items.${index}.quantity`)).toLocaleString()}
//                                                 </TableCell>
//                                                 <TableCell>
//                                                     <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(index)}>
//                                                         <Trash size={14} />
//                                                     </Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))}
//                                     </TableBody>
//                                 </Table>
//                             </div>
//                         </div>
//                     </ScrollArea>

//                     {/* 3. The Bill Footer */}
//                     <div className="p-4 border-t bg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-4">
//                         <div className="flex items-center gap-4 text-sm">
//                             <div className="text-right">
//                                 <p className="text-muted-foreground">Subtotal</p>
//                                 <p className="font-medium">₹{subTotal.toLocaleString()}</p>
//                             </div>
//                             <span className="text-muted-foreground">-</span>
//                             <div>
//                                 <Label className="text-muted-foreground text-xs block mb-1">Discount (₹)</Label>
//                                 <Input
//                                     type="number"
//                                     {...register("manualDiscount")}
//                                     className="w-20 h-8 text-right"
//                                     placeholder="0"
//                                 />
//                             </div>
//                             <ArrowRight className="text-muted-foreground" size={16} />
//                             <div className="bg-card p-2 px-4 rounded border shadow-sm">
//                                 <p className="text-xs text-muted-foreground uppercase font-bold">Grand Total</p>
//                                 <p className="text-xl font-bold text-primary">₹{grandTotal.toLocaleString()}</p>
//                             </div>
//                         </div>

//                         <div className="flex gap-2">
//                             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
//                             <Button type="submit" disabled={isLoading}>
//                                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                                 Confirm Assignment
//                             </Button>
//                         </div>
//                     </div>
//                 </form>
//             </DialogContent>
//         </Dialog>
//     );
// }