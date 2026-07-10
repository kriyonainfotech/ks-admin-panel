"use client";

import { useState, useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Check, Circle, ShieldCheck, Phone, Mail, MapPin, User, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format, isSameDay, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { OptionItem } from "@/src/services/optionSetService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Client } from "@/lib/clientdata";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FUTURE_PENDING_COLOR, getStatusColor, getStatusOption, hexToRgba, isAtOrAfterStatus, isStatus, OVERDUE_COLOR, TODAY_COLOR } from "./statusPalette";

interface TeamTaskTableProps {
    data: any[];
    onStatusChange: (id: string, status: string, note?: string) => Promise<any>;
    onView: (task: any) => void;
    statusOptions?: OptionItem[];
    allowedStatuses?: string[];
    clients?: Client[];
    isLoading?: boolean;
    showPostingDate?: boolean;
    dateLabel?: string; // NEW PROP
}

// Custom Status Toggle Component
const StatusToggle = ({
    active,
    onClick,
    disabled,
    icon: Icon,
    color = "#16a34a",
    inactiveColor = "text-slate-300 hover:text-slate-400",
    label
}: any) => (
    <TooltipProvider delayDuration={200}>
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    onClick={!disabled ? onClick : undefined}
                    disabled={disabled}
                    className={cn(
                        "group relative flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300",
                        disabled && !active ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-110 active:scale-95",
                        active
                            ? "shadow-md"
                            : "bg-transparent")}
                    style={active ? { backgroundColor: color, boxShadow: `0 8px 18px ${hexToRgba(color, 0.28)}` } : undefined}
                >
                    {active ? (
                        <Check size={18} className="text-white transition-all duration-300" strokeWidth={3.5} />
                    ) : (
                        <Icon
                            size={18}
                            className={cn("transition-all duration-300", inactiveColor)}
                            style={{ color }}
                            strokeWidth={2}
                        />
                    )}
                    {!active && !disabled && (
                        <span className="absolute inset-0 rounded-full bg-slate-100 opacity-0 group-hover:opacity-100 -z-10 transition-opacity" />
                    )}
                </button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);


export function TeamTaskTable({ data, onStatusChange, onView, statusOptions = [], allowedStatuses, clients = [], isLoading, showPostingDate, dateLabel }: TeamTaskTableProps) {

    // State for Confirmation Modal
    const [confirmAction, setConfirmAction] = useState<{ id: string, status: string, title: string } | null>(null);
    const [statusNote, setStatusNote] = useState("");
    const [contactInfoClient, setContactInfoClient] = useState<Client | null>(null);

    // Handler to execute the update
    const handleConfirm = async () => {
        if (confirmAction) {
            try {
                await toast.promise(onStatusChange(confirmAction.id, confirmAction.status, statusNote), {
                    loading: 'Updating task status...',
                    success: 'Task status updated successfully',
                    error: 'Failed to update task status',
                });
                setConfirmAction(null);
                setStatusNote(""); // Reset note
            } catch (error) {
                console.error("Failed to update status:", error);
            }
        }
    };

    // --- COLUMNS DEFINITION ---
    const baseColumns = [
        {
            id: "srNo",
            header: "Sr.",
            cell: (info: any) => <span className="font-mono text-slate-400 text-xs">#{info.row.index + 1}</span>
        },
        {
            header: "Title",
            accessorKey: "title",
            cell: (info: any) => (
                <span className="font-bold text-base text-slate-900 leading-tight block min-w-[150px]">
                    {info.getValue()}
                </span>
            )
        },
        {
            header: showPostingDate ? "Posting Date" : (dateLabel || "Design Date"),
            accessorKey: showPostingDate ? "postingDate" : "dueDate",
            cell: (info: any) => {
                const dateVal = info.getValue();
                if (!dateVal) return <span className="text-sm text-slate-400 italic">-</span>;
                return (
                    <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">
                        {format(new Date(dateVal), "dd MMM")}
                    </span>
                );
            }
        },
        {
            header: "Client",
            accessorFn: (row: any) => typeof row.client === 'object' ? row.client?.businessName : "Internal",
            cell: (info: any) => {
                const businessName = info.getValue();
                const clientId = info.row.original.client?._id || info.row.original.client;

                const handleClientClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (businessName === "Internal") return;
                    // Support both .id and ._id for finding client
                    const clientData = clients.find(c => c.id === clientId || (c as any)._id === clientId);
                    if (clientData) {
                        setContactInfoClient(clientData);
                    }
                };

                return (
                    <span
                        onClick={handleClientClick}
                        className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800",
                            businessName !== "Internal" && "cursor-pointer hover:bg-slate-200 transition-colors"
                        )}
                    >
                        {businessName}
                    </span>
                );
            }
        },
    ];

    const visibleOptions = useMemo(() => {
        // Dynamic Filtering based on allowedStatuses
        if (allowedStatuses && allowedStatuses.length > 0) {
            // Map the allowed string status names to the actual option objects
            return allowedStatuses.map(statusStr => {
                const found = getStatusOption(statusStr, statusOptions);
                // Return a stable object even if the full options haven't loaded yet
                return found || { label: statusStr, value: statusStr, color: getStatusColor(statusStr, statusOptions), _id: statusStr };
            });
        }

        if (!statusOptions || statusOptions.length === 0) return [];

        // Fallback Logic (if allowedStatuses not provided)
        if (showPostingDate) {
            return statusOptions.filter(opt => {
                const label = opt.label.toLowerCase();
                return label.includes("post") || label.includes("posted");
            });
        } else {
            return statusOptions.filter(opt => {
                const label = opt.label.toLowerCase();
                return label.includes("design") || label.includes("edit") || label.includes("approved") || label.includes("approve");
            });
        }
    }, [statusOptions, showPostingDate, allowedStatuses]);

    // Fallback for completely empty/missing options (Optional safety)
    const renderFallbackColumns = () => {
        return [];
    }

    const statusColumns = visibleOptions.length > 0
        ? visibleOptions.map((opt, columnIndex) => ({
            header: opt.label,
            id: opt.value,
            cell: ({ row }: any) => {

                const currentStatus = row.original.status;

                // A status is "checked" if:
                // 1. It is the current status
                // 2. OR it comes BEFORE the current status in this tab's visible status order
                // 3. SPECIAL RULE: Approved (Stage 2) does NOT tick Done/Report_Shared (Stage 3)
                let isChecked = isStatus(currentStatus, [opt.value, opt.label]);

                if (isAtOrAfterStatus(currentStatus, opt.value, statusOptions)) {
                    isChecked = true;
                }

                // No fallback to broad isTaskDone logic to prevent inheritance

                return (
                    <div className="flex justify-center">
                        <StatusToggle
                            active={isChecked}
                            onClick={() => !isChecked && setConfirmAction({ id: row.original._id, status: opt.value, title: row.original.title })}
                            disabled={isChecked || isLoading}
                            icon={Circle}
                            color="#16a34a"
                            label={`Mark as ${opt.label}`}
                        />
                    </div>
                );
            }
        }))
        : renderFallbackColumns();

    const columns = [
        ...baseColumns,
        {
            id: "actions",
            header: "View",
            cell: ({ row }: any) => (
                <Button variant="ghost" size="icon" onClick={() => onView(row.original)} className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
                    <Eye size={18} />
                </Button>
            )
        },
        ...statusColumns
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });


    const getRowTone = (task: any) => {
        const { status, dueDate, postingDate } = task;
        const relevantDate = showPostingDate ? postingDate : dueDate;

        const today = startOfDay(new Date());

        const finalStatus = visibleOptions[visibleOptions.length - 1]?.value;

        if (finalStatus && isAtOrAfterStatus(status, finalStatus, statusOptions)) {
            const color = "#16a34a";
            return {
                className: "border-l-4",
                style: {
                    backgroundColor: hexToRgba(color, 0.08),
                    borderLeftColor: color,
                },
            };
        }

        if (!relevantDate) return { className: "bg-white", style: undefined };
        const taskDate = startOfDay(new Date(relevantDate));

        if (isBefore(taskDate, today)) {
            return {
                className: "border-l-4",
                style: {
                    backgroundColor: hexToRgba(OVERDUE_COLOR, 0.08),
                    borderLeftColor: OVERDUE_COLOR,
                },
            };
        }

        if (isSameDay(taskDate, today)) {
            return {
                className: "border-l-4",
                style: {
                    backgroundColor: hexToRgba(TODAY_COLOR, 0.1),
                    borderLeftColor: TODAY_COLOR,
                },
            };
        }

        return {
            className: "border-l-4",
            style: {
                backgroundColor: hexToRgba(FUTURE_PENDING_COLOR, 0.1),
                borderLeftColor: FUTURE_PENDING_COLOR,
            },
        };
    };

    return (
        <div className="w-full overflow-hidden rounded-xl shadow-sm border border-slate-200 bg-white">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className="px-6 py-4 text-center first:text-left font-medium">
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {table.getRowModel().rows.map(row => {
                        const rowTone = getRowTone(row.original);
                        return (
                            <tr
                                key={row.id}
                                className={cn("transition-all duration-200 ease-in-out hover:brightness-[0.99]", rowTone.className)}
                                style={rowTone.style}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-6 py-4 text-center first:text-left">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* CONFIRMATION MODAL */}
            <Dialog open={!!confirmAction} onOpenChange={(open) => !isLoading && !open && setConfirmAction(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Action</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to mark <strong>"{confirmAction?.title}"</strong> as <span className="font-bold text-foreground">{confirmAction?.status}</span>?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="status-note" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Update Note (Optional)
                            </Label>
                            <Textarea
                                id="status-note"
                                placeholder="Add a reason or brief update for this status change..."
                                value={statusNote}
                                onChange={(e) => setStatusNote(e.target.value)}
                                className="min-h-[100px] resize-none focus:ring-primary"
                                maxLength={300}
                            />
                            <div className="text-[10px] text-right text-slate-400 font-medium">
                                {statusNote.length}/300 characters
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            style={{ backgroundColor: getStatusColor(confirmAction?.status, statusOptions, "#e60000") }}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm {confirmAction?.status}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CONTACT INFO MODAL */}
            <Dialog open={!!contactInfoClient} onOpenChange={(open) => !open && setContactInfoClient(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            Client Contact Info
                        </DialogTitle>
                    </DialogHeader>

                    {contactInfoClient && (
                        <div className="grid gap-4 py-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-foreground">{contactInfoClient.businessName}</h3>
                                <Badge variant={contactInfoClient.status === "Active" ? "default" : "secondary"}>
                                    {/* {contactInfoClient.status} */}
                                </Badge>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">Contact Person</p>
                                        <p className="text-sm text-muted-foreground">{contactInfoClient.name}</p>
                                    </div>
                                </div>

                                {/* <div className="flex items-start gap-3">
                                    <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">Email Address</p>
                                        <p className="text-sm text-muted-foreground">{contactInfoClient.businessEmail || contactInfoClient.email}</p>
                                    </div>
                                </div> */}

                                <div className="flex items-start gap-3">
                                    <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">Phone Number</p>
                                        <p className="text-sm text-muted-foreground">{contactInfoClient.businessPhone || contactInfoClient.phone || "No phone"}</p>
                                    </div>
                                </div>

                                {/* {(contactInfoClient.businessAddress || contactInfoClient.city) && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">Address</p>
                                            <p className="text-sm text-muted-foreground">
                                                {[contactInfoClient.businessAddress, contactInfoClient.city, contactInfoClient.state].filter(Boolean).join(", ")}
                                            </p>
                                        </div>
                                    </div>
                                )} */}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" onClick={() => setContactInfoClient(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
