"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { createService, updateService, deleteService } from "@/src/redux/slices/packageSlice";
import { ServiceDialog } from "./ServiceDialog"; // Updated import
import { toast } from 'sonner'
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash, Search, Layers } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataHandler } from "@/components/DataHandler";

export function ServicesManager() {
    const dispatch = useAppDispatch();
    const { services, loading } = useAppSelector(state => state.packages);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false); // Renamed state
    const [currentService, setCurrentService] = useState<any>(null);
    const [filter, setFilter] = useState("");
    const [catFilter, setCatFilter] = useState("all");

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await dispatch(deleteService(deleteId)).unwrap();
            toast.success("Service removed successfully");
            setDeleteDialogOpen(false);
            setDeleteId(null);
        } catch (error) {
            toast.error("Failed to remove service");
        }
    };

    const handleSave = async (data: any) => {
        if (currentService) await dispatch(updateService({ id: currentService._id, data }));
        else await dispatch(createService(data));
        setDialogOpen(false);
    };

    const filteredServices = services.filter(s => {
        const matchesText = s.name.toLowerCase().includes(filter.toLowerCase());
        const matchesCat = catFilter === "all" ? true : s.category === catFilter;
        return matchesText && matchesCat;
    });

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-muted/20 p-3 rounded-lg border">
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 w-full sm:w-[250px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search services..."
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            className="pl-9 h-9 bg-background w-full"
                        />
                    </div>
                    <Select value={catFilter} onValueChange={setCatFilter}>
                        <SelectTrigger className="w-full sm:w-[150px] h-9 bg-background"><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="SMM">SMM</SelectItem>
                            <SelectItem value="Video">Video</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Ads">Ads</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button size="sm" className="w-full sm:w-auto" onClick={() => { setCurrentService(null); setDialogOpen(true); }}>
                    <Plus size={16} className="mr-2" /> Add Service
                </Button>
            </div>

            {/* Table */}
            <div className="border rounded-md bg-card overflow-x-auto">
                <Table className="min-w-[600px]">
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Service Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Base Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <DataHandler
                            loading={loading && services.length === 0}
                            isEmpty={!loading && filteredServices.length === 0}
                            variant="table-row"
                            colSpan={4}
                            emptyText="No services found."
                        >
                            {filteredServices.map(s => (
                                <TableRow key={s._id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Layers size={14} className="text-muted-foreground" />
                                            {s.name}
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{s.category}</Badge></TableCell>
                                    <TableCell>₹{s.unitPrice} <span className="text-xs text-muted-foreground">/ {s.unitName}</span></TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setCurrentService(s); setDialogOpen(true); }}><Edit size={14} /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(s._id)}><Trash size={14} /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </DataHandler>
                    </TableBody>
                </Table>
            </div>

            <ServiceDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSave}
                initialData={currentService}
            />


            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                isLoading={loading}
                title="Archive Service?"
                description="Are you sure you want to archive this service? This action cannot be undone."
                confirmText="Archive Service"
            />

        </div>
    );
}