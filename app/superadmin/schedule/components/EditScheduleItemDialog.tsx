import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/src/redux/hooks";
import { updateChutakItem, fetchSchedulesByClient } from "@/src/redux/slices/scheduleSlice";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditScheduleItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: any;
    clientId: string;
}

export function EditScheduleItemDialog({ open, onOpenChange, item, clientId }: EditScheduleItemDialogProps) {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");

    useEffect(() => {
        if (open && item) {
            setTitle(item.content || "");
        }
    }, [open, item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        try {
            await dispatch(updateChutakItem({ id: item._id, content: title })).unwrap();
            toast.success("Item renamed successfully");
            onOpenChange(false);
            if (clientId) {
                dispatch(fetchSchedulesByClient(clientId));
            }
        } catch (error: any) {
            toast.error(error?.message || "Failed to rename item");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Rename Schedule Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Content / Title</Label>
                        <Input
                            placeholder="Enter new title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !title.trim() || title === item?.content}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
