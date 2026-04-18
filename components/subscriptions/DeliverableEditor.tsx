"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { DeliverableItem } from "@/src/types/subscription"; // Adjust import path

interface DeliverableEditorProps {
    items: DeliverableItem[];
    onUpdate: (index: number, updates: Partial<DeliverableItem>) => void;
    onRemove: (index: number) => void;
}

export function DeliverableEditor({ items, onUpdate, onRemove }: DeliverableEditorProps) {
    return (
        <div className="border rounded-md overflow-hidden bg-transparent">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead className="w-[40%]">Service Name</TableHead>
                        <TableHead className="w-[20%] text-center">Qty</TableHead>
                        <TableHead className="w-[20%] text-center">Unit Price</TableHead>
                        <TableHead className="w-[10%]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                No items in package. Add services or select a template.
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item, index) => (
                            <TableRow key={`${item.serviceId}_${index}`}>
                                {/* 1. Name */}
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{item.name || item.serviceName}</span>
                                    </div>
                                </TableCell>

                                {/* 2. Quantity Editor */}
                                <TableCell className="text-center">
                                    <Input
                                        type="number"
                                        min={1}
                                        className="w-16 h-8 text-center mx-auto"
                                        value={item.quantity}
                                        onChange={(e) => onUpdate(index, { quantity: Number(e.target.value) })}
                                    />
                                </TableCell>

                                {/* 3. Price Editor */}
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                                        <span className="text-muted-foreground">₹</span>
                                        <Input
                                            type="number"
                                            className="w-24 h-8 text-center bg-muted/20"
                                            value={item.price ?? item.basePrice ?? item.unitPrice ?? 0}
                                            onChange={(e) => onUpdate(index, { price: Number(e.target.value) })}
                                        />
                                    </div>
                                </TableCell>

                                {/* 5. Actions */}
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive h-8 w-8 hover:bg-destructive/10"
                                            onClick={() => onRemove(index)}
                                        >
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
    );
}
