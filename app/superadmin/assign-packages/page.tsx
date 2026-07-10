"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchClients } from "@/src/redux/slices/clientSlice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Package, Plus, Loader2, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AssignmentWizard } from "@/components/subscriptions/AssignmentWizard";
import { ChutakDialog } from "./components/ChutakDialog";
import { DataHandler } from "@/components/DataHandler";
import { Badge } from "@/components/ui/badge";
import { ChutakViewDialog } from "./components/ChutakViewDialog";
import { CreateChutakSaleDialog } from "./components/CreateChutakSaleDialog";
import { ClientExpandableDetails } from "./components/ClientExpandableDetails";
import { BillingDownloadDialog } from "./components/BillingDownloadDialog";
import { cn } from "@/lib/utils";

export default function AssignPackagesPage() {
    const dispatch = useAppDispatch();
    const { clients, isLoading } = useAppSelector((state) => state.clients);

    // Filters for Tabs
    const [filter, setFilter] = useState("");
    const [activeTab, setActiveTab] = useState("fixed");

    // Modals state
    const [assignWizardOpen, setAssignWizardOpen] = useState(false);
    const [chutakOpen, setChutakOpen] = useState(false);
    const [viewChutakOpen, setViewChutakOpen] = useState(false);
    const [createSaleOpen, setCreateSaleOpen] = useState(false);
    const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
    const [selectedClient, setSelectedClient] = useState<{ id: string; businessName: string } | null>(null);
    const [editingSubscription, setEditingSubscription] = useState<any | null>(null);
    const [billingDownloadOpen, setBillingDownloadOpen] = useState(false);
    const [chutakItemsForSale, setChutakItemsForSale] = useState<any[]>([]);
    const [saleDateRange, setSaleDateRange] = useState<{ from: Date; to: Date } | null>(null);

    useEffect(() => {
        dispatch(fetchClients());
    }, [dispatch]);

    // 1. FIXED TAB CLIENTS: Show all clients (filtered by search)
    const fixedClients = useMemo(() => {
        return clients.filter(c => {
            const matchesSearch = c.businessName?.toLowerCase().includes(filter.toLowerCase()) ||
                c.name?.toLowerCase().includes(filter.toLowerCase());
            return matchesSearch;
        });
    }, [clients, filter]);

    // 2. CHUTAK TAB CLIENTS: Show only clients who have chutak items (filtered by search)
    const chutakClients = useMemo(() => {
        return clients.filter(c => {
            if (!c.hasChutakItems) return false;
            const matchesSearch = c.businessName?.toLowerCase().includes(filter.toLowerCase()) ||
                c.name?.toLowerCase().includes(filter.toLowerCase());
            return matchesSearch;
        });
    }, [clients, filter]);

    const toggleExpand = (clientId: string) => {
        setExpandedClientId(expandedClientId === clientId ? null : clientId);
    };

    const handleAssignFixed = (client?: any, subscription?: any) => {
        setSelectedClient(client ? { id: client.id, businessName: client.businessName } : null);
        setEditingSubscription(subscription || null);
        setAssignWizardOpen(true);
    };

    const handleDownloadBilling = (client: any) => {
        setSelectedClient({ id: client.id, businessName: client.businessName });
        setBillingDownloadOpen(true);
    };

    const handleAddChutak = (client?: any) => {
        setSelectedClient(client ? { id: client.id, businessName: client.businessName } : null);
        setChutakOpen(true);
    };

    const handleViewChutak = (client: any) => {
        setSelectedClient({ id: client.id, businessName: client.businessName });
        setViewChutakOpen(true);
    };

    const handleTriggerSaleFlow = (items: any[], range: { from: Date; to: Date }) => {
        setChutakItemsForSale(items);
        setSaleDateRange(range);
        setCreateSaleOpen(true);
    };

    return (
        <div className="flex flex-col gap-6">
            <Tabs defaultValue="fixed" className="w-full" onValueChange={setActiveTab}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                        <TabsTrigger value="fixed">Fixed Packages</TabsTrigger>
                        <TabsTrigger value="chutak">Chutak Clients</TabsTrigger>
                    </TabsList>

                    <div className="relative w-full md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search active clients..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-9 bg-card"
                        />
                    </div>
                </div>

                <TabsContent value="fixed">
                    <Card className="shadow-sm border-slate-100 pb-0">
                        {/* Modified Card Header with Assign Package Button */}
                        <CardHeader className="flex flex-row items-center justify-between pb-6">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-black text-slate-800">Fixed Client Management</CardTitle>
                                <CardDescription className="text-sm">View and manage already assigned recurring monthly packages.</CardDescription>
                            </div>
                            <Button
                                onClick={() => handleAssignFixed()}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold h-10 px-6 gap-2 shadow-sm"
                            >
                                <Plus size={18} /> Assign New Package
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 border-t border-slate-100">
                            <div className="overflow-hidden bg-card">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="hover:bg-transparent border-b border-slate-100">
                                            <TableHead className="py-4 px-6 text-xs font-black uppercase text-slate-500 tracking-wider">Client Business</TableHead>
                                            <TableHead className="py-4 text-xs font-black uppercase text-slate-500 tracking-wider">Active Package</TableHead>
                                            <TableHead className="py-4 text-xs font-black uppercase text-slate-500 tracking-wider">Status</TableHead>
                                            <TableHead className="py-4 px-6 text-right text-xs font-black uppercase text-slate-500 tracking-wider">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <DataHandler
                                            loading={isLoading && clients.length === 0}
                                            isEmpty={!isLoading && fixedClients.length === 0}
                                            variant="table-row"
                                            colSpan={4}
                                            emptyText="No fixed packages assigned yet."
                                        >
                                            {fixedClients.map((client) => {
                                                const isExpanded = expandedClientId === client.id;
                                                return (
                                                    <React.Fragment key={client.id}>
                                                        <TableRow
                                                            className={cn(
                                                                "cursor-pointer transition-all duration-200 border-b border-slate-50",
                                                                isExpanded ? "bg-slate-50/50" : "hover:bg-slate-50/30"
                                                            )}
                                                            onClick={() => toggleExpand(client.id)}
                                                        >
                                                            <TableCell className="py-5 px-6">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={cn(
                                                                        "p-2 rounded-lg transition-all",
                                                                        isExpanded ? "bg-red-600 text-white shadow-md shadow-red-200" : "bg-slate-100 text-slate-400"
                                                                    )}>
                                                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-slate-800 text-md">{client.businessName}</div>
                                                                        <div className="text-xs text-muted-foreground  mt-0.5">{client.name}</div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-5">
                                                                {(() => {
                                                                    const displaySub = (client.subscriptions || []).find((s: any) => s.status === "Active") ||
                                                                        (client.subscriptions || []).find((s: any) => s.status === "Completed");
                                                                    if (!displaySub) return null;
                                                                    return (
                                                                        <Badge
                                                                            variant="secondary"
                                                                            className={cn(
                                                                                "font-bold h-6 px-3 text-[10px] uppercase border",
                                                                                displaySub.status === "Active" ? "bg-white text-red-600 border-red-100 shadow-sm" : "bg-slate-50 text-slate-500 border-slate-200"
                                                                            )}
                                                                        >
                                                                            {displaySub.packageName}
                                                                        </Badge>
                                                                    );
                                                                })()}
                                                            </TableCell>
                                                            <TableCell className="py-5">
                                                                <Badge
                                                                    className={cn(
                                                                        "capitalize text-[10px] h-6 px-3 font-black",
                                                                        client.status === 'Active' ? 'bg-red-600 text-white border-none shadow-sm' : 'bg-red-100 text-red-800'
                                                                    )}
                                                                    variant="outline"
                                                                >
                                                                    {client.status || 'Onboarding'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="py-5 px-6 text-right">
                                                                <div className="flex justify-end pr-2">
                                                                    <ChevronRight size={18} className={cn("transition-transform duration-300 text-slate-300", isExpanded && "rotate-90 text-red-600")} />
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                        {isExpanded && (
                                                            <TableRow className="hover:bg-transparent border-t-0">
                                                                <TableCell colSpan={4} className="p-0 border-t-0 bg-white">
                                                                    <ClientExpandableDetails
                                                                        client={{ id: client.id, businessName: client.businessName }}
                                                                        activeTab={activeTab}
                                                                        onAssignFixed={(sub) => handleAssignFixed(client, sub)}
                                                                        onAddChutak={() => handleAddChutak(client)}
                                                                        onViewAllChutak={() => handleViewChutak(client)}
                                                                        onDownloadBilling={() => handleDownloadBilling(client)}
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </DataHandler>
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="chutak">
                    <Card className="shadow-sm pb-0">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div className="space-y-1">
                                <CardTitle className="text-slate-800">Chutak Services History</CardTitle>
                                <CardDescription>View clients who have requested one-off services.</CardDescription>
                            </div>
                            <Button
                                onClick={() => handleAddChutak()}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold gap-2 shadow-sm"
                            >
                                <Plus size={16} /> Add Chutak Item
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border bg-card">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Client Business</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <DataHandler
                                            loading={isLoading}
                                            isEmpty={chutakClients.length === 0}
                                            variant="table-row"
                                            colSpan={3}
                                            emptyText="No existing chutak clients found."
                                        >
                                            {chutakClients.map((client) => {
                                                const isExpanded = expandedClientId === client.id;
                                                return (
                                                    <React.Fragment key={client.id}>
                                                        <TableRow
                                                            className={cn(
                                                                "cursor-pointer transition-all duration-200 hover:bg-red-50/50",
                                                                isExpanded && "bg-red-50/30 border-b-0 shadow-sm"
                                                            )}
                                                            onClick={() => toggleExpand(client.id)}
                                                        >
                                                            <TableCell>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-1.5 rounded-md bg-slate-100/50 transition-colors">
                                                                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-slate-800">{client.businessName}</div>
                                                                        <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{client.name}</div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-xs font-bold text-slate-500">
                                                                {client.phone}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end pr-2">
                                                                    <div className={cn(
                                                                        "p-2 rounded-full transition-all",
                                                                        isExpanded ? "text-red-600" : "text-slate-300"
                                                                    )}>
                                                                        <ChevronRight size={16} className={cn("transition-transform duration-300", isExpanded && "rotate-90")} />
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                        {isExpanded && (
                                                            <TableRow className="hover:bg-transparent border-t-0">
                                                                <TableCell colSpan={3} className="p-0 border-t-0">
                                                                    <ClientExpandableDetails
                                                                        client={{ id: client.id, businessName: client.businessName }}
                                                                        activeTab={activeTab}
                                                                        onAssignFixed={(sub) => handleAssignFixed(client, sub)}
                                                                        onAddChutak={() => handleAddChutak(client)}
                                                                        onViewAllChutak={() => handleViewChutak(client)}
                                                                        onDownloadBilling={() => handleDownloadBilling(client)}
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </DataHandler>
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Existing Modals */}
            {assignWizardOpen && (
                <AssignmentWizard
                    isOpen={assignWizardOpen}
                    onClose={() => {
                        setAssignWizardOpen(false);
                        setEditingSubscription(null);
                    }}
                    initialClientId={selectedClient?.id}
                    initialData={editingSubscription}
                />
            )}

            <ChutakDialog open={chutakOpen} onOpenChange={setChutakOpen} client={selectedClient} />

            <ChutakViewDialog open={viewChutakOpen} onOpenChange={setViewChutakOpen} client={selectedClient} onCreateSale={handleTriggerSaleFlow} />

            <BillingDownloadDialog open={billingDownloadOpen} onOpenChange={setBillingDownloadOpen} client={selectedClient} />

            <CreateChutakSaleDialog
                open={createSaleOpen}
                onOpenChange={setCreateSaleOpen}
                client={selectedClient}
                items={chutakItemsForSale}
                dateRange={saleDateRange}
                onSuccess={() => { setViewChutakOpen(false); }}
            />
        </div>
    );
}