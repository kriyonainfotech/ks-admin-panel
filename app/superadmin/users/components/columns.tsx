"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/lib/userData";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, Smartphone, Globe, Eye, Briefcase } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface UserColumnProps {
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
    onView: (user: User) => void;
    // handleAssignClick: (user: User) => void;
}

export const getUserColumns = ({ onEdit, onDelete, onView,
    // handleAssignClick
}: UserColumnProps): ColumnDef<User>[] => [
        {
            accessorKey: "name",
            header: "User Profile",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={row.original.avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary">{row.original.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium text-sm">{row.original.name}</div>
                        <div className="text-xs text-muted-foreground">{row.original.email}</div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "businessName",
            header: "Business",
            cell: ({ row }) => (
                <div className="max-w-[150px] truncate" title={row.getValue("businessName")}>
                    {row.getValue("businessName") || <span className="text-muted-foreground">-</span>}
                </div>
            ),
        },
        {
            accessorKey: "source",
            header: "Source",
            cell: ({ row }) => {
                const src = row.original.source;
                return (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground border rounded px-2 py-1 w-fit bg-muted/50">
                        {src.includes("App") ? <Smartphone size={12} /> : <Globe size={12} />}
                        {src}
                    </div>
                )
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                const color = status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200";
                return <Badge className={`${color} shadow-none border-0`}>{status}</Badge>;
            },
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal size={16} /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(row.original)}><Eye className="mr-2 h-3 w-3" /> View Profile</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(row.original)}><Edit className="mr-2 h-3 w-3" /> Edit Profile</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(row.original.id)} className="text-destructive"><Trash className="mr-2 h-3 w-3" /> Delete</DropdownMenuItem>
                        {/* <DropdownMenuItem onClick={() => handleAssignClick(row.original)} className="text-blue-600 focus:text-blue-700 font-medium">
                        <Briefcase className="mr-2 h-4 w-4" /> Assign Package
                    </DropdownMenuItem> */}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];