"use client";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchInventory, createService, updateService, deleteService } from "@/src/redux/slices/packageSlice";
import { ServiceDialog } from "./ServiceDialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash } from "lucide-react";

export default function ServicesPage() {
    const dispatch = useAppDispatch();
    const { services } = useAppSelector(state => state.packages);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentService, setCurrentService] = useState<any>(null);

    useEffect(() => { dispatch(fetchInventory()); }, [dispatch]);

    const handleSave = async (data: any) => {
        if (currentService) await dispatch(updateService({ id: currentService._id, data }));
        else await dispatch(createService(data));
        setDialogOpen(false);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Service Inventory</h1>
                <Button onClick={() => { setCurrentService(null); setDialogOpen(true); }}><Plus size={16} className="mr-2" /> Add Service</Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Service Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Base Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services.map(s => (
                            <TableRow key={s._id}>
                                <TableCell className="font-medium">{s.name}</TableCell>
                                <TableCell><Badge variant="secondary">{s.category}</Badge></TableCell>
                                <TableCell>₹{s.unitPrice} <span className="text-xs text-muted-foreground">/ {s.unitName}</span></TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => { setCurrentService(s); setDialogOpen(true); }}><Edit size={14} /></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => dispatch(deleteService(s._id))}><Trash size={14} /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <ServiceDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleSave} initialData={currentService} />
        </div>
    );
}