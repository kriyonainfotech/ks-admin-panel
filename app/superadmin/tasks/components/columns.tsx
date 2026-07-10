"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Task } from "@/lib/taskdata";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, CheckCircle2, Clock, Eye } from "lucide-react";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { format, parseISO } from "date-fns";

interface TaskColumnProps {
    onEdit: (task: Task) => void;
    onView?: (task: Task) => void;
    onDelete: (id: string) => void;
    onStatusChange?: (id: string, status: string) => void;
    statusOptions: { label: string, value: string, color?: string }[];
}

// Fallback styles for common statuses if optionset is missing
const fallbackStatusStyles: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Work_Complete: "bg-orange-100 text-orange-800 border-orange-300",
    Done: "bg-green-100 text-green-800 border-green-300",
    Approved: "bg-blue-100 text-blue-800 border-blue-300",
    Posted: "bg-purple-100 text-purple-800 border-purple-300",
    Overdue: "bg-red-100 text-red-800 border-red-300",
};

const normalizeStatus = (value?: string) => (value || "").trim().toLowerCase();

const findStatusOption = (
    status: string,
    statusOptions: { label: string, value: string, color?: string }[]
) => {
    const normalized = normalizeStatus(status);
    return statusOptions.find(opt =>
        normalizeStatus(opt.value) === normalized ||
        normalizeStatus(opt.label) === normalized
    );
};

export const getTaskColumns = ({ onEdit, onView, onDelete, statusOptions }: TaskColumnProps): ColumnDef<Task>[] => {
    const columns: ColumnDef<Task>[] = [
        {
            accessorKey: "_id",
            header: "Sr.no",
            cell: ({ row }) => (
                <div className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-semibold">
                    {row.index + 1}
                </div>
            ),
        },
        {
            accessorKey: "title",
            header: "Task",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.title}</span>
                </div>
            ),
        },
        {
            accessorKey: "assignedTo",
            header: "Name",
            cell: ({ row }) => {
                const name = row.original.assigneeName || "Unknown";
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-md font-semibold capitalize text-muted-foreground">{name}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "dueDate",
            header: "Due Date",
            cell: ({ row }) => {
                try {
                    return <span className="text-sm text-muted-foreground">{format(parseISO(row.original.dueDate), "MMM dd")}</span>
                } catch (e) {
                    return <span className="text-sm text-muted-foreground">-</span>
                }
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                const option = findStatusOption(status, statusOptions);

                if (option?.color) {
                    return (
                        <Badge
                            variant="outline"
                            style={{
                                backgroundColor: `${option.color}20`, // 20 is Alpha for 12.5% opacity
                                color: option.color,
                                borderColor: `${option.color}40`
                            }}
                            className="capitalize font-medium"
                        >
                            {option.label || status}
                        </Badge>
                    );
                }

                return (
                    <Badge
                        className={`
                        capitalize border
                        ${fallbackStatusStyles[status] || "bg-gray-100 text-gray-700 border-gray-300"}
                    `}
                    >
                        {status}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    {onView && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => onView(row.original)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(row.original)} className="gap-2 cursor-pointer">
                                <Edit size={14} /> Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onDelete(row.original._id)} className="gap-2 text-destructive cursor-pointer">
                                <Trash size={14} /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    return columns;
};
