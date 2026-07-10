"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { createChutakItem, updateChutakItem } from "@/src/redux/slices/scheduleSlice";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ChutakDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: { id: string; businessName: string } | null;
    itemToEdit?: any;
}

export function ChutakDialog({ open, onOpenChange, client, itemToEdit }: ChutakDialogProps) {
    const dispatch = useAppDispatch();
    const { clients } = useAppSelector((state) => state.clients);
    const [loading, setLoading] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [formData, setFormData] = useState({
        postType: "Post",
        content: "",
        price: "0",
        description: ""
    });

    React.useEffect(() => {
        if (open) {
            if (itemToEdit) {
                setFormData({
                    postType: itemToEdit.postType || "Post",
                    content: itemToEdit.content || "",
                    price: itemToEdit.price?.toString() || "0",
                    description: itemToEdit.description || ""
                });
                if (!client && itemToEdit.client) {
                    setSelectedClientId(itemToEdit.client);
                }
            } else {
                setFormData({ postType: "Post", content: "", price: "0", description: "" });
            }
        }
    }, [itemToEdit, open, client]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const targetClientId = client?.id || selectedClientId;
        if (!targetClientId) {
            toast.error("Please select a client.");
            return;
        }

        setLoading(true);
        try {
            if (itemToEdit) {
                await dispatch(updateChutakItem({
                    id: itemToEdit._id,
                    ...formData,
                    price: Number(formData.price)
                })).unwrap();
                toast.success("Chutak item updated successfully!");
            } else {
                await dispatch(createChutakItem({
                    client: targetClientId,
                    ...formData,
                    price: Number(formData.price)
                })).unwrap();
                toast.success("Chutak item added successfully!");
            }
            onOpenChange(false);
            setFormData({ postType: "Post", content: "", price: "0", description: "" });
        } catch (error: any) {
            toast.error(error || `Failed to ${itemToEdit ? "update" : "add"} item`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{itemToEdit ? "Edit Chutak Item" : "Add Chutak Item"} {client ? `- ${client.businessName}` : ''}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {!client && (
                        <div className="space-y-2">
                            <Label>Select Client</Label>
                            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Search client..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.businessName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label>Service Type</Label>
                        <Select
                            value={formData.postType}
                            onValueChange={(val) => setFormData({ ...formData, postType: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Post">Post</SelectItem>
                                <SelectItem value="Reel">Reel</SelectItem>
                                <SelectItem value="Story">Story</SelectItem>
                                <SelectItem value="Video">Video</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Content / Title</Label>
                        <Input
                            placeholder="e.g. Festival Special Post"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Price (INR)</Label>
                        <Input
                            type="number"
                            placeholder="500"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Textarea
                            placeholder="Additional details..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {itemToEdit ? "Update Item" : "Add Item"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
