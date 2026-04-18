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

interface TeamTaskTableProps {
    data: any[];
    onStatusChange: (id: string, status: string) => Promise<any>;
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
    activeColor,
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
                        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-110 active:scale-95",
                        active
                            ? "bg-green-600 shadow-green-300 shadow-md"
                            : "bg-transparent hover:bg-green-50")}
                >
                    {active ? (
                        <Check size={18} className="text-white transition-all duration-300" strokeWidth={3.5} />
                    ) : (
                        <Icon
                            size={18}
                            className={cn("transition-all duration-300", inactiveColor)}
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
    const [contactInfoClient, setContactInfoClient] = useState<Client | null>(null);

    // Handler to execute the update
    const handleConfirm = async () => {
        if (confirmAction) {
            try {
                await toast.promise(onStatusChange(confirmAction.id, confirmAction.status), {
                    loading: 'Updating task status...',
                    success: 'Task status updated successfully',
                    error: 'Failed to update task status',
                });
                setConfirmAction(null);
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
                const found = statusOptions?.find(opt => opt.value === statusStr || opt.label === statusStr);
                // Return a stable object even if the full options haven't loaded yet
                return found || { label: statusStr, value: statusStr, color: 'emerald', _id: statusStr };
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

                // MASTER ORDER FOR SEQUENTIAL TICKING
                const STATUS_SEQUENCE = ["Edit", "Design", "Approved", "Done"];

                const currentStatusIndex = STATUS_SEQUENCE.indexOf(currentStatus);
                const thisColumnIndex = STATUS_SEQUENCE.indexOf(opt.value);

                // A status is "checked" if:
                // 1. It is the current status
                // 2. OR it comes BEFORE the current status in the sequence
                // 3. SPECIAL RULE: Approved (Stage 2) does NOT tick Done/Report_Shared (Stage 3)
                let isChecked = (currentStatus === opt.value);

                if (currentStatusIndex !== -1 && thisColumnIndex !== -1) {
                    if (currentStatusIndex >= thisColumnIndex) {
                        isChecked = true;

                        // Prevent "Approved" from checking Stage 3 (Done)
                        const stage3Statuses = ["Done"];
                        if (currentStatus === "Approved" && stage3Statuses.includes(opt.value)) {
                            isChecked = false;
                        }
                    }
                }

                // No fallback to broad isTaskDone logic to prevent inheritance

                return (
                    <div className="flex justify-center">
                        <StatusToggle
                            active={isChecked}
                            onClick={() => !isChecked && setConfirmAction({ id: row.original._id, status: opt.value, title: row.original.title })}
                            disabled={isChecked || isLoading}
                            icon={Circle}
                            activeColor={`ring-${opt.color || 'slate'}-500 text-${opt.color || 'slate'}-600`}
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


    const getRowColor = (task: any) => {
        const { status, dueDate, postingDate } = task;
        const relevantDate = showPostingDate ? postingDate : dueDate;

        const today = startOfDay(new Date());

        // 1. GREEN: Done
        if (["Done", "Approved", "Posted"].includes(status)) {
            return "bg-emerald-50/50 hover:bg-emerald-50/80 border-l-4 border-l-emerald-500";
        }

        if (!relevantDate) return "bg-white";
        const taskDate = startOfDay(new Date(relevantDate));

        // 2. RED: Strictly Before Today (Overdue)
        if (isBefore(taskDate, today)) {
            return "bg-red-50/50 hover:bg-red-50/80 border-l-4 border-l-red-500";
        }

        // 3. ORANGE: Strictly Today
        if (isSameDay(taskDate, today)) {
            return "bg-orange-50/50 hover:bg-orange-50/80 border-l-4 border-l-orange-500";
        }

        // 4. YELLOW: Future (Default Pending)
        return "bg-yellow-50/50 hover:bg-yellow-50/80 border-l-4 border-l-yellow-500";
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
                    {table.getRowModel().rows.map(row => (
                        <tr
                            key={row.id}
                            className={cn("transition-all duration-200 ease-in-out", getRowColor(row.original))}
                        >
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="px-6 py-4 text-center first:text-left">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
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
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={cn(
                                confirmAction?.status === "Done" ? "bg-emerald-600 hover:bg-emerald-700" :
                                    confirmAction?.status === "Approved" ? "bg-blue-600 hover:bg-blue-700" : ""
                            )}
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