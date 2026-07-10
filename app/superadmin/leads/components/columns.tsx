"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Lead } from "@/lib/leadData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, ArrowUpDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface LeadColumnProps {
    onEdit: (lead: Lead) => void;
    onDelete: (id: string) => void;
}

// Helper for random-ish badge colors based on status string
const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("interested") || s.includes("converted")) return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
    if (s.includes("fake") || s.includes("junk")) return "bg-red-100 text-red-700 hover:bg-red-200 border-red-200";
    if (s.includes("call")) return "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200";
    if (s.includes("new")) return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
};

export const getLeadColumns = ({ onEdit, onDelete }: LeadColumnProps): ColumnDef<Lead>[] => [
    {
        accessorKey: "Sr.no",
        header: "Sr.no",
        cell: ({ row }) => <span className="text-muted-foreground whitespace-nowrap">{row.index + 1}.</span>,
    },
    {
        accessorKey: "date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 hover:bg-transparent"
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => <span className="text-muted-foreground whitespace-nowrap">{row.getValue("date")}</span>,
    },
    {
        accessorKey: "name",
        header: "Client Name",
        cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
    },
    {
        accessorKey: "businessName",
        header: "Business",
        cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("businessName") || "-"}</span>,
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("phone")}</span>,
    },
    {
        accessorKey: "city",
        header: "City",
        cell: ({ row }) => <span className="">{row.getValue("city")}</span>,
    },
    {
        accessorKey: "purpose",
        header: "Purpose",
        cell: ({ row }) => <Badge variant="outline">{row.getValue("purpose")}</Badge>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return <Badge className={`shadow-none border font-normal ${getStatusColor(status)}`}>{status}</Badge>;
        },
    },
    {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => (
            <div className="max-w-[150px] truncate text-muted-foreground text-xs" title={row.getValue("notes")}>
                {row.getValue("notes")}
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal size={14} /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(row.original)}><Edit className="mr-2 h-3 w-3" /> Edit</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(row.original.id)} className="text-destructive"><Trash className="mr-2 h-3 w-3" /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
];