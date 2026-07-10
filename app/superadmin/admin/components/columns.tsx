"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AdminUser } from "@/lib/admindata";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown, Eye, Edit, Trash, Lock } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface ColumnProps {
    onEdit: (admin: any) => void;
    onDelete: (id: string) => void;
    onView: (admin: any) => void;
    onPasswordReset: (id: string) => void;
}

export const getColumns = ({ onEdit, onDelete, onView, onPasswordReset }: ColumnProps): ColumnDef<AdminUser>[] => [
    // 2. Profile (Name + Email + Avatar)
    {
        accessorKey: "name",
        header: "User Profile",
        cell: ({ row }) => {
            const user = row.original;
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        {/* <AvatarImage src={user?.avatarUrl} alt={user.name} /> */}
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {user.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.getValue("phone")}</span>,
    },
    // 3. Role
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const role = row.getValue("role") as string;
            return (
                <Badge variant="outline" className="font-normal">
                    {role}
                </Badge>
            );
        },
    },

    // 4. Status
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            // Simple color logic for badges
            const colorClass =
                status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-100/80 border-green-200" :
                    status === "Suspended" ? "bg-red-100 text-red-700 hover:bg-red-100/80 border-red-200" :
                        "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 border-yellow-200";

            return (
                <Badge className={`${colorClass} shadow-none border`}>
                    {status}
                </Badge>
            );
        },
    },

    // 5. Last Login
    // {
    //     accessorKey: "lastLogin",
    //     header: "Last Login",
    //     cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.getValue("lastLogin") || "Never"} </span>,
    // },

    // 6. Actions Dropdown
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {/* <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user._id)}>
                            <span className="text-xs text-muted-foreground">Copy ID</span>
                        </DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2" onClick={() => onView(user)}> <Eye size={14} /> View Details</DropdownMenuItem>
                        {user.role !== "Superadmin" && (
                            <DropdownMenuItem className="gap-2" onClick={() => onEdit(user)}>
                                <Edit size={14} /> Edit Admin
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="gap-2" onClick={() => onPasswordReset(user._id)}> <Lock size={14} /> Reset Password</DropdownMenuItem>
                        {user.role !== "Superadmin" && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => onDelete(user._id)}>
                                    <Trash size={14} /> Delete
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];