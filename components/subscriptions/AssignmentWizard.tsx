"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Loader2, CheckCircle2, Package, User, Plus, Users, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Redux Imports
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { assignPackageToClient, resetSubscriptionState, updateClientSubscription } from "@/src/redux/slices/subscriptionSlice";
import { fetchInventory } from "@/src/redux/slices/packageSlice"; // To get templates
import { fetchClients } from "@/src/redux/slices/clientSlice";   // To get clients
import { fetchTeam } from "@/src/redux/slices/teamSlice";     // To get team members
import { ServiceItem } from "@/lib/packageData";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
// UI Imports
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Component Imports
import { DeliverableEditor } from "./DeliverableEditor";
import { DeliverableItem } from "@/src/types/subscription";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

interface AssignmentWizardProps {
    isOpen: boolean;
    onClose: () => void;
    initialClientId?: string; // Optional: If passed, skips Step 1
    initialData?: any;         // Optional: Load existing package for edit/renew
}

export function AssignmentWizard({ isOpen, onClose, initialClientId, initialData }: AssignmentWizardProps) {
    const dispatch = useAppDispatch();

    // -- Redux State --
    const { clients } = useAppSelector((state) => state.clients);
    const { packages: templates, services } = useAppSelector((state) => state.packages);
    const { members: teamMembers } = useAppSelector((state) => state.team);
    const { isLoading, isSuccess, isUpdating } = useAppSelector((state) => state.subscription);

    // -- Local State --
    const [step, setStep] = useState(1);
    const [selectedClientId, setSelectedClientId] = useState<string>(initialClientId || "");
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    // The Cart (Our customized deliverables)
    const [cartItems, setCartItems] = useState<DeliverableItem[]>([]);
    const [pkgName, setPkgName] = useState("");
    const [templateId, setTemplateId] = useState("");
    const [clientPopoverOpen, setClientPopoverOpen] = useState(false);

    const totalPrice = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + (item.basePrice * item.quantity), 0);
    }, [cartItems]);

    // -- Init --
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchClients());
            dispatch(fetchInventory());
            dispatch(fetchTeam());
            dispatch(resetSubscriptionState());

            if (initialData) {
                // EDIT / RENEW MODE
                setSelectedClientId(initialClientId || initialData.client || "");
                setPkgName(initialData.packageName || "");
                setTemplateId(initialData.packageTemplate?._id || initialData.packageTemplate || "");
                
                // Normalizing dates
                if (initialData.startDate) setStartDate(new Date(initialData.startDate));
                if (initialData.endDate) setEndDate(new Date(initialData.endDate));

                // Normalizing Cart Items
                if (initialData.deliverables) {
                    const normalized: DeliverableItem[] = initialData.deliverables.map((d: any) => ({
                        serviceId: d.serviceId?._id || d.serviceId || "",
                        name: d.serviceName || d.name || "Unknown Service",
                        basePrice: d.price || d.unitPrice || d.basePrice || 0,
                        price: d.price || d.unitPrice || d.basePrice || 0,
                        quantity: d.quantity || 1,
                        assignedTo: d.assignedTo?._id || d.assignedTo || null
                    }));
                    setCartItems(normalized);
                }
                setStep(3); // Jump straight to Editor
            } else {
                // FRESH ASSIGNMENT MODE
                setStep(initialClientId ? 2 : 1);
                if (initialClientId) setSelectedClientId(initialClientId);
                
                // Reset fields
                setClientPopoverOpen(false);
                setPkgName("");
                setTemplateId("");
                setCartItems([]);
                setStartDate(undefined);
                setEndDate(undefined);
            }
        }
    }, [isOpen, initialClientId, initialData, dispatch]);

    // Close on Success
    useEffect(() => {
        if (isSuccess) {
            dispatch(fetchClients()); // Refetch to sync main table
            setTimeout(() => {
                onClose();
                setStep(1);
            }, 1500);
        }
    }, [isSuccess, onClose, dispatch]);

    // -- Handlers --

    // Step 2: Load Template Logic
    const handleSelectTemplate = (pkgTemplate: any) => {
        setPkgName(pkgTemplate.templateName);
        setTemplateId(pkgTemplate._id);

        // Transform Template Items -> Deliverable Items (Add default Config)
        const activeItems: DeliverableItem[] = pkgTemplate.lineItems.map((li: any) => ({
            serviceId: li.item._id,
            name: li.item.name,
            basePrice: li.item.unitPrice,
            price: li.item.unitPrice,
            quantity: li.quantity
        }));

        setCartItems(activeItems);
        setStep(3); // Move to Editor
    };

    // Step 3: Editor Updates
    const updateCartItem = (index: number, updates: Partial<DeliverableItem>) => {
        const newCart = [...cartItems];
        newCart[index] = { ...newCart[index], ...updates };
        setCartItems(newCart);
    };

    const removeCartItem = (index: number) => {
        setCartItems(cartItems.filter((_, i) => i !== index));
    };

    const handleBuildCustom = () => {
        setPkgName("Custom Package"); // Default name
        setTemplateId(""); // No template ID linked
        setCartItems([]); // Start with empty cart
        setStep(3); // Go straight to Editor
    };

    // Step 4: Final Submit (Actually triggers API)
    const handleConfirm = () => {
        console.log("FINAL SUBMIT", { selectedClientId, startDate, pkgName, templateId, cartItems });
        
        if (initialData?._id) {
            // EDIT MODE
            dispatch(updateClientSubscription({
                id: initialData._id,
                packageName: pkgName,
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString(),
                deliverables: cartItems.map(item => ({
                    ...item,
                    serviceName: item.name || item.serviceName,
                    price: item.price ?? item.basePrice ?? item.unitPrice ?? 0
                }))
            }));
        } else {
            // CREATE MODE
            dispatch(assignPackageToClient({
                clientId: selectedClientId,
                startDate: startDate!.toISOString(),
                endDate: endDate?.toISOString(),
                billingCycle: "Monthly",
                packageData: {
                    templateId: templateId || null,
                    name: pkgName,
                    items: cartItems.map(item => ({
                        ...item,
                        serviceName: item.name || item.serviceName,
                        price: item.price ?? item.basePrice ?? item.unitPrice ?? 0
                    }))
                }
            }));
        }
    };

    // -- RENDER HELPERS --
    const renderStep1_Client = () => (
        <div className="space-y-4 py-4">
            <div className="bg-blue-500/10 p-4 rounded-md border border-blue-500/20 flex gap-3">
                <User className="text-blue-600" />
                <div>
                    <h4 className="font-semibold text-blue-600">Select Client</h4>
                    <p className="text-sm text-blue-600/80">Who is this package for?</p>
                </div>
            </div>
            <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={clientPopoverOpen}
                        className="w-full justify-between"
                    >
                        {selectedClientId
                            ? clients.find((c) => c.id === selectedClientId)?.businessName
                            : "Select client..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search client..." />
                        <CommandList>
                            <CommandEmpty>No client found.</CommandEmpty>
                            <CommandGroup heading="Clients">
                                {clients.map((c) => (
                                    <CommandItem
                                        key={c.id}
                                        value={c.businessName}
                                        onSelect={() => {
                                            setSelectedClientId(c.id);
                                            setClientPopoverOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedClientId === c.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {c.businessName}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );

    const renderStep2_Template = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 max-h-[400px] overflow-y-auto">
            {/* Existing Templates */}
            {templates.map((t) => {
                const calculatedPrice = t.lineItems.reduce((acc, li) => {
                    const itemPrice = (li.item as unknown as ServiceItem)?.unitPrice || 0;
                    return acc + (itemPrice * li.quantity);
                }, 0);

                return (
                    <Card
                        key={t._id}
                        className="p-4 cursor-pointer hover:border-primary hover:bg-muted/10 transition-all group"
                        onClick={() => handleSelectTemplate(t)}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <Package className="text-muted-foreground group-hover:text-primary" />
                            <span className="font-bold">₹{calculatedPrice}</span>
                        </div>
                        <h4 className="font-semibold">{t.packageName}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t.lineItems.length} items included
                        </p>
                    </Card>
                );
            })}

            {/* CUSTOM OPTION */}
            <Card
                className="p-4 cursor-pointer border-dashed flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:border-primary min-h-[100px]"
                onClick={handleBuildCustom}
            >
                <Plus size={32} className="mb-2 opacity-50" />
                <span className="font-semibold">+ Build Custom</span>
                <span className="text-xs text-muted-foreground mt-1">Start from scratch</span>
            </Card>
        </div>
    );

    const renderStep3_Editor = () => (
        <div className="space-y-4 py-2">
            <div className="flex justify-between items-end gap-4">
                <div className="grid grid-cols-2 gap-4 flex-1">
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label>End Date (Optional)</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="text-right min-w-fit space-y-2">
                    <div className="flex flex-col items-end">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Package Name</Label>
                        <Input
                            className="h-8 font-bold text-right w-48"
                            value={pkgName}
                            onChange={(e) => setPkgName(e.target.value)}
                            placeholder="e.g. Premium Bundle"
                        />
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-black text-primary">₹{totalPrice}</span>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            Total Package Value
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Add Service (For Custom Packages) */}
            <div className="bg-muted/30 p-3 rounded-lg flex items-center gap-4">
                <div className="flex-1">
                    <Select onValueChange={(val) => {
                        const service = services.find(s => s._id === val);
                        if (service) {
                            const newItem: DeliverableItem = {
                                serviceId: service._id!,
                                name: service.name,
                                basePrice: service.unitPrice,
                                price: service.unitPrice,
                                quantity: 1
                            };
                            setCartItems([...cartItems, newItem]);
                        }
                    }}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Add another service to this package..." />
                        </SelectTrigger>
                        <SelectContent>
                            {services.map(s => (
                                <SelectItem key={s._id} value={s._id!}>
                                    {s.name} (₹{s.unitPrice})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                    Select a service to add it to your custom list.
                </p>
            </div>

            <DeliverableEditor
                items={cartItems}
                onUpdate={updateCartItem}
                onRemove={removeCartItem}
            />
        </div>
    );


    // Step 4: Assign Team Logic
    const renderStep4_AssignTeam = () => {
        // Filter: Only show team members assigned to the selected client
        const selectedClient = clients.find(c => c.id === selectedClientId || (c as any)._id === selectedClientId);
        const allowedIds = selectedClient
            ? ((selectedClient as any).assignedTeamIds || (selectedClient as any).assignedTeam || []).map((m: any) => typeof m === 'object' ? m._id : m)
            : [];

        return (
            <div className="space-y-4 py-2 max-h-[500px] overflow-y-auto">
                <div className="bg-primary/10 p-3 rounded-md border border-primary/20 flex gap-3 mb-4">
                    <Users className="text-primary" />
                    <div>
                        <h4 className="font-semibold text-md text-primary">Assign Team Members</h4>
                        <p className="text-xs text-primary/80">Assign specific tasks to team members for {selectedClient?.businessName}</p>
                    </div>
                </div>

                {cartItems.map((item, index) => {
                    const clientAvailableMembers = teamMembers
                        .filter(m => m.isActive && allowedIds.includes(m._id))
                        .sort((a, b) => a.name.localeCompare(b.name));

                    return (
                        <Card key={index} className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-semibold">{item.name}</h5>
                                    <Badge variant="outline" className="text-xs">{item.quantity} tasks</Badge>
                                </div>
                            </div>

                            <div className="w-[250px]">
                                <Select
                                    value={item.assignedTo || ""}
                                    onValueChange={(val) => updateCartItem(index, { assignedTo: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Team Member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clientAvailableMembers.map(m => (
                                            <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </Card>
                    );
                })}
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(v) => !isLoading && onClose()}>
            <DialogContent className="sm:max-w-[850px] min-h-[500px] flex flex-col">
                <DialogHeader>
                    {/* Updated Step Count to 4 */}
                    <DialogTitle>Assign Package (Step {step}/4)</DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex flex-col">
                    {isSuccess ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in">
                            <CheckCircle2 size={64} className="text-green-500" />
                            <h2 className="text-xl font-bold">Success!</h2>
                            <p className="text-muted-foreground">Package assigned & tasks generated.</p>
                        </div>
                    ) : (
                        <>
                            {step === 1 && renderStep1_Client()}
                            {step === 2 && renderStep2_Template()}
                            {step === 3 && renderStep3_Editor()}
                            {step === 4 && renderStep4_AssignTeam()}
                        </>
                    )}
                </div>

                <DialogFooter className="mt-4">
                    {!isSuccess && (
                        <>
                            {step > 1 && (
                                <Button variant="outline" onClick={() => setStep(step - 1)} disabled={isLoading}>
                                    Back
                                </Button>
                            )}

                            {step === 1 && (
                                <Button onClick={() => setStep(2)} disabled={!selectedClientId}>Next: Select Package</Button>
                            )}

                            {step === 3 && (
                                <Button onClick={() => setStep(4)} disabled={!startDate || cartItems.length === 0}>
                                    Next: Assign Team
                                </Button>
                            )}

                            {step === 4 && (
                                <Button onClick={handleConfirm} disabled={isLoading || isUpdating}>
                                    {(isLoading || isUpdating) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Confirm & Assign Package
                                </Button>
                            )}
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}