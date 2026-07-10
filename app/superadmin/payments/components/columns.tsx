"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Lock, Wallet, Edit2, Trash2, Download, FileText, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadGSTBill, downloadInvoice } from "@/lib/pdfExport";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatIST = (date: string | Date | number) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(date)).replace(",", " :");
};

// --- SALES COLUMNS ---
export const saleColumns = (
    onCollect: (sale: any) => void,
    onEdit: (sale: any) => void,
    onDelete: (sale: any) => void,
    onDownload: (sale: any) => void,
    isReadOnly: boolean
): ColumnDef<any>[] => [
        {
            accessorKey: "_id",
            header: () => <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">ID</span>,
            cell: ({ row }) => <span className="text-sm font-medium text-slate-600">{row.index + 1}.</span>,
        },
        {
            accessorKey: "saleDate",
            header: ({ column }) => (
                <Button variant="ghost" className="text-xs uppercase tracking-wider text-slate-500 font-bold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Date <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-sm font-medium text-slate-600">{formatIST(row.original.saleDate)}</span>,
        },
        {
            accessorKey: "client",
            header: () => <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Client</span>,
            cell: ({ row }) => {
                const isGuest = row.original.isGuest;
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">
                            {isGuest ? row.original.guestName : row.original.client?.businessName}
                        </span>
                        {isGuest && (
                            <span className="text-[10px] text-slate-400 font-medium">Guest Customer</span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "title",
            header: () => <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Work</span>,
            cell: ({ row }) => <span className="text-sm font-medium text-slate-700">{row.original.title}</span>,
        },
        {
            accessorKey: "totalAmount",
            header: () => <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Total</span>,
            cell: ({ row }) => <span className="text-sm font-bold text-slate-900">{formatCurrency(row.original.totalAmount)}</span>,
        },
        {
            accessorKey: "remainingAmount",
            header: () => <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Balance</span>,
            cell: ({ row }) => {
                const amount = row.original.remainingAmount;
                if (amount <= 0) return <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Paid</span>;
                return <span className="text-sm font-bold text-red-600">{formatCurrency(amount)}</span>;
            },
        },
        {
            accessorKey: "status",
            header: () => <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Status</span>,
            cell: ({ row }) => {
                const status = row.original.status;

                const styles = {
                    "Pending": "border-red-200 text-red-600 bg-red-50",
                    "Partial": "border-orange-200 text-orange-600 bg-orange-50",
                    "Cleared": "border-emerald-200 text-emerald-600 bg-emerald-50",
                    "Written Off": "border-slate-200 text-slate-500 bg-slate-100"
                };
                const activeStyle = styles[status as keyof typeof styles] || styles["Pending"];

                return <Badge variant="outline" className={cn("font-bold border", activeStyle)}>{status}</Badge>;
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const isCleared = row.original.status === "Cleared" || row.original.status === "Written Off";

                // If Read Only mode is active, show LOCK
                if (isReadOnly) {
                    return (
                        <div className="flex justify-end pr-4 opacity-50 cursor-not-allowed" title="View Only Access">
                            <Lock className="h-4 w-4 text-slate-400" />
                        </div>
                    );
                }

                // Active Action Buttons
                return (
                    <div className="flex items-center justify-end gap-2">
                        {!isCleared && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 font-medium"
                                onClick={() => onCollect(row.original)}
                            >
                                <Wallet className="h-3 w-3 mr-1.5" /> Collect
                            </Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                    title="Download Bill"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => downloadGSTBill(row.original)}>
                                    <Receipt className="h-4 w-4 mr-2 text-red-600" />
                                    GST Bill
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => downloadInvoice(row.original)}>
                                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                                    Invoice
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => onEdit(row.original)}
                            title="Edit Sale"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => onDelete(row.original)}
                            title="Delete Sale"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

// --- HISTORY COLUMNS ---
export const historyColumns = (
    onEdit: (item: any) => void,
    onDelete: (item: any) => void,
    onDownload: (item: any) => void,
    isReadOnly: boolean,
    onEditAccount?: (item: any) => void
): ColumnDef<any>[] => [
        {
            accessorKey: "collectionDate",
            header: () => <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Date</span>,
            cell: ({ row }) => <span className="text-xs font-mono text-slate-500">{formatIST(row.original.collectionDate)}</span>,
        },
        {
            accessorKey: "payerName",
            header: () => <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Party / Purpose</span>,
            cell: ({ row }) => <span className="font-bold text-sm text-slate-800">{row.original.payerName}</span>,
        },
        {
            accessorKey: "amountCollected",
            header: () => <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Amount</span>,
            cell: ({ row }) => {
                const isExpense = row.original.transactionType === "Expense";
                return (
                    <span className={cn("font-bold text-sm", isExpense ? "text-red-600" : "text-emerald-600")}>
                        {formatCurrency(row.original.amountCollected)}
                    </span>
                );
            }
        },
        {
            accessorKey: "destinationAccount",
            header: () => <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Account</span>,
            cell: ({ row }) => {
                const acc = row.original.destinationAccount;
                const style = acc === "Personal Bank"
                    ? "bg-purple-50 text-purple-700 border-purple-100"
                    : acc === "Cash"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-blue-50 text-blue-700 border-blue-100";
                return (
                    <Badge variant="outline" className={cn("font-medium", style)}>
                        {acc}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const isExpense = row.original.transactionType === "Expense";
                const isIncome = row.original.transactionType === "Income";
                const isDirectCollection = row.original.isDirectCollection;

                // Hide if Read Only
                if (isReadOnly) return null;

                return (
                    <div className="flex items-center justify-end gap-2 pr-2">
                        {isIncome && onEditAccount && !isDirectCollection && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                onClick={() => onEditAccount(row.original)}
                                title="Edit Account Type"
                            >
                                <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        {isExpense && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                onClick={() => onEdit(row.original)}
                                title="Edit Expense"
                            >
                                <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        {isDirectCollection && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                onClick={() => onEdit(row.original)}
                                title="Edit Direct Collection"
                            >
                                <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        {(isExpense || isDirectCollection || isIncome) && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                onClick={() => onDownload(row.original)}
                                title="Download Receipt"
                            >
                                <Download className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        {(isExpense || isDirectCollection) && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => onDelete(row.original)}
                                title={isExpense ? "Delete Expense" : "Delete Collection"}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                );
            },
        }
    ];