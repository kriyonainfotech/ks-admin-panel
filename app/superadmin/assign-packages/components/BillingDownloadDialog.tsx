"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Download, Loader2, ReceiptText, Table as TableIcon, History } from "lucide-react";
import { format, isWithinInterval } from "date-fns";
import { CustomDateRangePicker } from "./CustomDateRangePicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchClientSubscriptions } from "@/src/redux/slices/subscriptionSlice";
import { fetchChutakItemsByClient } from "@/src/redux/slices/scheduleSlice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { cn } from "@/lib/utils";

interface BillingDownloadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: { id: string; businessName: string } | null;
}

export function BillingDownloadDialog({ open, onOpenChange, client }: BillingDownloadDialogProps) {
    const dispatch = useAppDispatch();
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Redux Selectors
    const { activeSubscriptions, isLoading: isSubLoading } = useAppSelector((state) => state.subscription);
    const { items: chutakItems, isLoading: isChutakLoading } = useAppSelector((state) => state.schedule);

    useEffect(() => {
        if (open && client) {
            dispatch(fetchClientSubscriptions(client.id));
            dispatch(fetchChutakItemsByClient({ clientId: client.id }));
        }
    }, [open, client, dispatch]);

    const billableItems = useMemo(() => {
        if (!dateRange || !client) return [];

        const items: any[] = [];

        // 1. Process Fixed Subscriptions
        activeSubscriptions.forEach(sub => {
            // For Fixed packages, we usually bill the monthly recurring deliverables
            // even if they aren't "completed" in the same way as chutak, they are part of the active cycle.
            sub.deliverables.forEach(del => {
                items.push({
                    date: sub.startDate, // Use cycle start date
                    name: del.serviceName || del.name,
                    type: "Fixed Package",
                    quantity: del.quantity,
                    price: del.price ?? del.basePrice ?? del.unitPrice ?? 0,
                    total: (del.price ?? del.basePrice ?? del.unitPrice ?? 0) * del.quantity
                });
            });
        });

        // 2. Process Chutak Items within Range
        chutakItems.forEach(item => {
            const itemDate = new Date(item.createdAt);
            if (isWithinInterval(itemDate, { start: dateRange.from, end: dateRange.to })) {
                items.push({
                    date: item.createdAt,
                    name: item.content || item.postType,
                    type: "Chutak Service",
                    quantity: 1,
                    price: item.price || 0,
                    total: item.price || 0
                });
            }
        });

        return items;
    }, [activeSubscriptions, chutakItems, dateRange, client]);

    const totalBillValue = useMemo(() => {
        return billableItems.reduce((acc, item) => acc + item.total, 0);
    }, [billableItems]);

    const handleGeneratePDF = async () => {
        if (!client || !dateRange) return;
        setIsGenerating(true);

        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(220, 38, 38); // Red color
            doc.text("KRIYONA STUDIO", 14, 20);

            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139); // Slate color
            doc.text("Digital Marketing & Content Production", 14, 26);

            // Client Info
            doc.setDrawColor(241, 245, 249);
            doc.line(14, 32, 196, 32);

            doc.setFontSize(12);
            doc.setTextColor(30, 41, 59);
            doc.setFont("helvetica", "bold");
            doc.text("BILLING STATEMENT", 14, 42);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(`Client: ${client.businessName}`, 14, 48);
            doc.text(`Duration: ${format(dateRange.from, "dd MMM yyyy")} - ${format(dateRange.to, "dd MMM yyyy")}`, 14, 54);
            doc.text(`Generated On: ${format(new Date(), "dd MMM yyyy HH:mm")}`, 14, 60);

            // Table
            const tableData = billableItems.map(item => [
                format(new Date(item.date), "dd/MM/yyyy"),
                item.name,
                item.type,
                `x${item.quantity}`,
                `INR ${item.price.toLocaleString()}`,
                `INR ${item.total.toLocaleString()}`
            ]);

            autoTable(doc, {
                startY: 70,
                head: [["Date", "Service Description", "Type", "Qty", "Unit Price", "Total"]],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [254, 242, 242] },
                margin: { top: 70 },
                styles: { fontSize: 9, cellPadding: 3 },
                columnStyles: {
                    5: { halign: 'right', fontStyle: 'bold' },
                    4: { halign: 'right' },
                    3: { halign: 'center' }
                }
            });

            // Summary
            const finalY = (doc as any).lastAutoTable.finalY + 10;

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Grand Total:", 140, finalY);
            doc.text(`INR ${totalBillValue.toLocaleString()}`, 196, finalY, { align: 'right' });

            doc.setFontSize(9);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(148, 163, 184);
            // doc.text("This is a computer generated summary of services rendered.", 14, finalY + 20);

            doc.save(`Billing_${client.businessName.replace(/\s+/g, '_')}_${format(dateRange.from, "MMM_yyyy")}.pdf`);
        } catch (error) {
            console.error("PDF generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] lg:max-w-4xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start pe-6">
                        <div>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <FileText className="text-red-600" size={20} />
                                Download Billing Summary
                            </DialogTitle>
                            <DialogDescription>
                                Consolidated report for {client?.businessName}
                            </DialogDescription>
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2 border-red-200 text-red-600 hover:bg-red-50">
                                    <Calendar size={14} />
                                    {dateRange ? (
                                        `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
                                    ) : (
                                        "Select Period"
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-auto" align="end">
                                <CustomDateRangePicker onRangeSelect={setDateRange} initialRange={dateRange} />
                            </PopoverContent>
                        </Popover>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden px-6 pb-6 mt-4">
                    <div className="border rounded-lg overflow-hidden flex flex-col h-full bg-slate-50/30">
                        <Table>
                            <TableHeader className="bg-white sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="w-[120px]">Date</TableHead>
                                    <TableHead>Service Description</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isSubLoading || isChutakLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Loader2 className="animate-spin" size={24} />
                                                <span className="text-sm font-medium">Fetching billing data...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : !dateRange ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <Calendar size={24} className="opacity-20" />
                                                <span className="text-sm">Please select a date range to preview billing entries.</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : billableItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <ReceiptText size={24} className="opacity-20" />
                                                <span className="text-sm">No billable entries found for this period.</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    billableItems.map((item, idx) => (
                                        <TableRow key={idx} className="bg-white/50 hover:bg-white transition-colors">
                                            <TableCell className="text-[11px] font-medium text-slate-500">
                                                {format(new Date(item.date), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-slate-700 text-xs">{item.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] px-1.5 py-0 font-black uppercase",
                                                    item.type === "Fixed Package" ? "border-blue-100 text-blue-600 bg-blue-50/30" : "border-amber-100 text-amber-600 bg-amber-50/30"
                                                )}>
                                                    {item.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-xs font-semibold text-slate-600">
                                                ₹{item.price.toLocaleString()} {item.quantity > 1 && `× ${item.quantity}`}
                                            </TableCell>
                                            <TableCell className="text-right font-black text-slate-900 text-xs">
                                                ₹{item.total.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="p-4 bg-white border-t flex justify-between items-center px-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated Billing Amount</span>
                        <span className="text-xl font-black text-red-600">₹{totalBillValue.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="font-bold uppercase text-[11px] tracking-wider">
                            Cancel
                        </Button>
                        <Button
                            disabled={!dateRange || billableItems.length === 0 || isGenerating}
                            onClick={handleGeneratePDF}
                            className="bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[11px] gap-2 px-6 shadow-md shadow-red-200"
                        >
                            {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                            Download PDF Statement
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
