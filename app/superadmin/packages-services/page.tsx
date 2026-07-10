"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchInventory, createPackage, updatePackage, deletePackage } from "@/src/redux/slices/packageSlice";
import { PackageTemplate } from "@/lib/packageData";
import { toast } from "sonner";
import { Plus, Edit, Trash, Package as PackageIcon, Search, Component } from "lucide-react";

// Components
import { PackageBuilder } from "./components/PackageBuilder";
import { ServicesManager } from "./components/ServicesManager"; // <--- NEW IMPORT
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataHandler } from "@/components/DataHandler";

export default function PackagesPage() {
    const dispatch = useAppDispatch();
    const { packages, services, loading } = useAppSelector(state => state.packages);

    const [builderOpen, setBuilderOpen] = useState(false);
    const [currentPkg, setCurrentPkg] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("packages");
    const [pkgFilter, setPkgFilter] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        const savedTab = localStorage.getItem("packages-tab");
        if (savedTab) setActiveTab(savedTab);
    }, []);


    useEffect(() => { dispatch(fetchInventory()); }, [dispatch]);

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await dispatch(deletePackage(deleteId)).unwrap();
            toast.success("Package removed successfully");
            setDeleteDialogOpen(false);
            setDeleteId(null);
        } catch (error) {
            toast.error("Failed to remove package");
        }
    };


    const handlePackageSave = async (data: any) => {
        console.log(data, "data");
        if (currentPkg) await dispatch(updatePackage({ id: currentPkg._id, data: data }));
        else await dispatch(createPackage(data));
        setBuilderOpen(false);
    };

    const filteredPackages = packages.filter(p => p.packageName.toLowerCase().includes(pkgFilter.toLowerCase()));

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-2rem)]">

            <Tabs value={activeTab}
                onValueChange={(val) => {
                    setActiveTab(val);
                    localStorage.setItem("packages-tab", val);
                }}
                // defaultValue="packages"
                className="flex-1 flex flex-col overflow-hidden">

                <div className="flex justify-between items-center mb-4">
                    <TabsList>
                        <TabsTrigger value="packages" className="gap-2"><PackageIcon size={16} /> Packages</TabsTrigger>
                        <TabsTrigger value="services" className="gap-2"><Component size={16} /> Services</TabsTrigger>
                    </TabsList>
                </div>

                {/* --- TAB 1: PACKAGES --- */}
                <TabsContent value="packages" className="flex-1 overflow-y-auto mt-0 pr-1 flex flex-col">
                    <div className="space-y-6 flex-1 flex flex-col">
                        {/* Package Toolbar */}
                        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-card p-4 rounded-lg border">
                            <div className="relative w-full sm:w-[300px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search packages..."
                                    value={pkgFilter}
                                    onChange={e => setPkgFilter(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button className="w-full sm:w-auto" onClick={() => { setCurrentPkg(null); setBuilderOpen(true); }}>
                                <Plus size={16} className="mr-2" /> Build Package
                            </Button>
                        </div>

                        {/* Package Grid */}
                        {/* Package Grid */}
                        <DataHandler
                            loading={loading && packages.length === 0}
                            isEmpty={!loading && filteredPackages.length === 0}
                            emptyText={pkgFilter ? "No packages match your search." : "No packages found."}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredPackages.map(pkg => (
                                    <div key={pkg._id} className="border rounded-lg p-5 bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                                        {/* Header: Title Only */}
                                        <div className="mb-4">
                                            <h3 className="font-bold text-lg leading-tight">{pkg.packageName}</h3>
                                        </div>

                                        {/* Body: Deliverables List */}
                                        <div className="space-y-3 mb-4 flex-1">
                                            <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 border-b pb-1">
                                                <span>Item</span>
                                                <span>Unit Price / Qty</span>
                                            </div>

                                            {pkg.lineItems.slice(0, 4).map((lineItem, i) => {
                                                const item = typeof lineItem.item === 'object' ? lineItem.item : null;
                                                const itemName = item?.name || 'Unknown Service';

                                                return (
                                                    <div key={i} className="flex justify-between items-center text-sm">
                                                        <span className="text-muted-foreground truncate pr-2">{itemName}</span>
                                                        <div className="flex items-center gap-3">

                                                            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground font-medium">
                                                                {lineItem.quantity}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            {pkg.lineItems.length > 4 && <div className="text-xs text-muted-foreground italic pt-2">+ {pkg.lineItems.length - 4} more items</div>}
                                        </div>

                                        {/* Footer: Price & Actions */}
                                        <div className="flex items-end justify-between mt-auto pt-4 border-t">
                                            <div>
                                                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total Package Price</p>
                                                <p className="text-xl font-bold text-primary">₹{pkg.sellingPrice.toLocaleString()}</p>
                                            </div>

                                            <div className="flex gap-2">
                                                {/* Edit Button: Icon Only */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 "
                                                    onClick={() => { setCurrentPkg(pkg); setBuilderOpen(true); }}
                                                >
                                                    <Edit size={14} />
                                                </Button>

                                                {/* Delete Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(pkg._id)}
                                                >
                                                    <Trash size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </DataHandler>
                    </div>
                </TabsContent>

                {/* --- TAB 2: SERVICES --- */}
                <TabsContent value="services" className="flex-1 overflow-y-auto mt-0 pr-1">
                    <ServicesManager />
                </TabsContent>
            </Tabs>

            {/* Package Builder Modal */}
            <PackageBuilder
                open={builderOpen}
                onOpenChange={setBuilderOpen}
                onSubmit={handlePackageSave}
                initialData={currentPkg}
                services={services}
                isLoading={loading}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                isLoading={loading}
                title="Archive Package?"
                description="Are you sure you want to archive this package? This action cannot be undone."
                confirmText="Archive Package"
            />

        </div >
    );
}