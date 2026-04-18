"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Client } from "@/lib/clientdata";
import { Team as TeamMember } from "@/lib/teamdata";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Package } from "lucide-react";

interface ClientColumnProps {
    onView: (client: Client) => void;
    onViewPackages: (client: Client) => void;
    teamMembers: TeamMember[];
}

export const getClientColumns = ({
    onView,
    onViewPackages,
    teamMembers
}: ClientColumnProps): ColumnDef<Client>[] => [
        {
            accessorKey: "businessName",
            header: "Client Business",
            cell: ({ row }) => (
                <div>
                    <p className="font-medium text-foreground">{row.original.businessName}</p>
                    <p className="text-xs text-muted-foreground">{row.original.name}</p>
                </div>
            ),
        },
        {
            accessorKey: "activePackage",
            header: "Active Package",
            cell: ({ row }) => {
                const subs = row.original.subscriptions || [];
                const activeSub = subs.find(s => s.status === "Active") || subs[0];

                if (!activeSub) {
                    return <Badge variant="outline" className="text-muted-foreground bg-gray-50 border-gray-200">None</Badge>;
                }

                return (
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-xs">{activeSub.packageName}</span>
                        {activeSub.status === "Active" ? (
                            <span className="text-[10px] text-green-600 font-medium">● Active</span>
                        ) : (
                            <span className="text-[10px] text-muted-foreground capitalized">{activeSub.status}</span>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status || "Inactive";
                const variant = status === "Active" ? "default" : status === "Onboarding" ? "secondary" : "destructive";
                return <Badge variant={variant} className="capitalize text-[10px] h-5">{status}</Badge>;
            }
        },
        {
            accessorKey: "assignedTeamIds",
            header: "Team Assigned",
            cell: ({ row }) => {
                const assignedIds = row.original.assignedTeamIds || [];
                const assignedMembers = teamMembers.filter((m) => assignedIds.includes(m._id));

                if (assignedMembers.length === 0) {
                    return <span className="text-xs text-muted-foreground italic pl-1">Unassigned</span>;
                }

                return (
                    <div className="flex -space-x-2 overflow-hidden items-center">
                        {assignedMembers.slice(0, 4).map((m) => (
                            <Avatar
                                key={m._id}
                                className="inline-block h-8 w-8 rounded-full ring-2 ring-background border bg-white cursor-pointer"
                                title={`${m.name} (${m.role})`}
                            >
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                    {m.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {assignedMembers.length > 4 && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-background bg-muted text-[10px] font-medium z-10">
                                +{assignedMembers.length - 4}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(row.original)} className="cursor-pointer gap-2">
                            <Eye size={14} /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewPackages(row.original)} className="cursor-pointer gap-2">
                            {/* <Package size={14} /> View Active Plans */}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
