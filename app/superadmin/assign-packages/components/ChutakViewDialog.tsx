"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchChutakItemsByClient, deleteChutakItem } from "@/src/redux/slices/scheduleSlice";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, ReceiptText, Search, Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";
import { CustomDateRangePicker } from "./CustomDateRangePicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { ChutakDialog } from "./ChutakDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface ChutakViewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: { id: string; businessName: string } | null;
    onCreateSale: (items: any[], dateRange: { from: Date; to: Date }) => void;
}

export function ChutakViewDialog({ open, onOpenChange, client, onCreateSale }: ChutakViewDialogProps) {
    const dispatch = useAppDispatch();
    const { items, isLoading } = useAppSelector((state) => state.schedule);
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);
    const [editItem, setEditItem] = useState<any>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        if (open && client) {
            dispatch(fetchChutakItemsByClient({
                clientId: client.id,
                startDate: dateRange?.from?.toISOString(),
                endDate: dateRange?.to?.toISOString()
            }));
        }
    }, [open, client, dateRange, dispatch]);

    const handleRangeSelect = (range: { from: Date; to: Date } | null) => {
        setDateRange(range);
    };

    const totalAmount = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.price || 0), 0);
    }, [items]);

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await dispatch(deleteChutakItem(deleteId) as any);
        } finally {
            setDeleteDialogOpen(false);
            setDeleteId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} >
            <DialogContent className="max-w-[90vw] lg:max-w-4xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start pe-4">
                        <div>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <ReceiptText className="text-primary" size={20} />
                                Chutak Entries: {client?.businessName}
                            </DialogTitle>
                            <DialogDescription>
                                View and manage one-off service items for this client.
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Calendar size={14} />
                                        {dateRange ? (
                                            `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
                                        ) : (
                                            "Filter by Date"
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-auto" align="end">
                                    <CustomDateRangePicker onRangeSelect={handleRangeSelect} />
                                </PopoverContent>
                            </Popover>

                            {items.length > 0 && dateRange && (
                                <Button
                                    className="gap-2 bg-primary text-white hover:bg-primary/90"
                                    size="sm"
                                    onClick={() => onCreateSale(items, dateRange)}
                                >
                                    <ReceiptText size={14} /> Create Sale
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden px-6 pb-6 mt-4">
                    <div className="border rounded-lg overflow-hidden flex flex-col h-full bg-slate-50/50">
                        <Table>
                            <TableHeader className="bg-white sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="w-[150px]">Date</TableHead>
                                    <TableHead>Service / Post Type</TableHead>
                                    <TableHead>Content Description</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Loader2 className="animate-spin" size={24} />
                                                <span className="text-sm font-medium">Fetching entries...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <Filter size={24} className="opacity-20" />
                                                <span className="text-sm">No Chutak entries found for this period.</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item) => (
                                        <TableRow key={item._id} className="bg-white/50 hover:bg-slate-100/50 transition-colors">
                                            <TableCell className="text-xs font-medium">
                                                {format(new Date(item.createdAt), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-bold text-[10px] bg-white">
                                                    {item.postType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs max-w-[250px]">
                                                <div className="font-semibold text-slate-700 truncate">{item.content}</div>
                                                {item.description && (
                                                    <div className="text-[10px] text-muted-foreground truncate">{item.description}</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-slate-800">
                                                ₹{item.price?.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge
                                                    className={cn(
                                                        "text-[9px] px-1.5 py-0.5",
                                                        item.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                            item.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-slate-100 text-slate-600'
                                                    )}
                                                >
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => { setEditItem(item); setEditDialogOpen(true); }}>
                                                        <Pencil size={14} />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(item._id)}>
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {!isLoading && items.length > 0 && (
                    <div className="p-4 text-black flex justify-between items-center rounded-b-xl">
                        <div className="flex gap-4 items-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Total Entries</span>
                                <span className="text-lg font-bold">{items.length} Items</span>
                            </div>
                            <div className="h-8 w-px bg-slate-700" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Total Value</span>
                                <span className="text-lg font-bold text-gray-900">₹{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                        {dateRange && (
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Financial Period</span>
                                <span className="text-xs font-semibold tabular-nums">
                                    {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
            <ChutakDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} client={client} itemToEdit={editItem} />
            <ConfirmDialog 
                open={deleteDialogOpen} 
                onOpenChange={setDeleteDialogOpen} 
                onConfirm={confirmDelete} 
                title="Delete Chutak Item"
                description="Are you sure you want to delete this Chutak item? This action cannot be undone."
            />
        </Dialog>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
