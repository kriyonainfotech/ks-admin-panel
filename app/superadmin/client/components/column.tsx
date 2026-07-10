"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Client } from "@/lib/clientdata";
import { Team as TeamMember } from "@/lib/teamdata";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, Eye, Package, Lock } from "lucide-react";

interface ClientColumnProps {
    onView: (client: Client) => void;
    onEdit: (client: Client) => void;
    onDelete: (id: string) => void;
    onResetPassword: (id: string) => void;
    onViewPackages: (client: Client) => void;
    teamMembers: TeamMember[]; // Needed to resolve IDs to Avatars
}

const formatJoinedDate = (value?: string) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
};

export const getClientColumns = ({
    onView,
    onEdit,
    onDelete,
    onResetPassword,
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
                const activeSub = subs.find(s => s.status === "Active") || subs[0]; // Active or most recent

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
            accessorKey: "socials",
            header: "Socials",
            cell: ({ row }) => {
                const hasFB = !!row.original.socials?.facebookId;
                const hasIG = !!row.original.socials?.instagramId;

                return (
                    <div className="flex gap-2">
                        {hasFB && (
                            <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 px-1 py-0 h-5 text-[10px]">
                                FB
                            </Badge>
                        )}
                        {hasIG && (
                            <Badge variant="outline" className="text-pink-600 bg-pink-50 border-pink-200 hover:bg-pink-100 px-1 py-0 h-5 text-[10px]">
                                IG
                            </Badge>
                        )}
                        {!hasFB && !hasIG && <span className="text-xs text-muted-foreground">-</span>}
                    </div>
                );
            },
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
            accessorKey: "location",
            header: "Location",
            cell: ({ row }) => {
                const city = row.original.city;
                const country = row.original.country;
                if (!city && !country) return <span className="text-xs text-muted-foreground">-</span>;
                return (
                    <div className="flex flex-col text-xs">
                        <span className="font-medium">{city || "-"}</span>
                        <span className="text-muted-foreground">{country || "-"}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: "joinedDate",
            header: "Joined",
            cell: ({ row }) => {
                return <span className="text-xs text-muted-foreground">{formatJoinedDate(row.original.joinedDate)}</span>;
            }
        },
        {
            accessorKey: "assignedTeamIds",
            header: "Team Assigned",
            cell: ({ row }) => {
                const assignedIds = row.original.assignedTeamIds || [];
                // Resolve IDs to Team Objects
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
                                {/* <AvatarImage src={m.avatarUrl} /> */}
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                    {m.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        ))}

                        {/* Counter if more than 4 members */}
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
                        <DropdownMenuItem onClick={() => onViewPackages(row.original)} className="cursor-pointer gap-2 font-semibold">
                            <Package size={14} /> View Active Plans
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onResetPassword(row.original.user)}
                            className="cursor-pointer gap-2"
                        >
                            <Lock size={14} />
                            Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(row.original)} className="cursor-pointer gap-2">
                            <Edit size={14} /> Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(row.original.id)} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                            <Trash size={14} /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
