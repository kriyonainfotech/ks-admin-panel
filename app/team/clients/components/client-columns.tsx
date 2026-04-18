"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Client } from "@/lib/clientdata";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, MoreHorizontal, FolderOpen, Instagram, Facebook } from "lucide-react";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const getClientColumns = (onViewTasks: (clientId: string) => void): ColumnDef<Client>[] => [
    {
        accessorKey: "businessName",
        header: "Business Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border">
                    <AvatarImage src={row.original.avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {row.original.businessName?.substring(0, 2).toUpperCase() || "CL"}
                    </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm">{row.original.businessName}</span>
            </div>
        ),
    },
    {
        accessorKey: "name",
        header: "Client Name",
        cell: ({ row }) => <span className="text-sm">{row.original.name}</span>,
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
            <div
                onClick={() => {
                    if (row.original.phone) {
                        navigator.clipboard.writeText(row.original.phone);
                        toast.success("Phone copied");
                    }
                }}
                className="flex items-center gap-1 text-sm group cursor-pointer"
            >
                {row.original.phone || "-"}
                <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
            </div>
        ),
    },
    {
        accessorKey: "businessPhone",
        header: "Business Phone",
        cell: ({ row }) => <div onClick={() => {
            if (row.original.businessPhone) {
                navigator.clipboard.writeText(row.original.businessPhone);
                toast.success("Business Phone copied");
            }
        }} className="flex items-center gap-1 text-sm group cursor-pointer">{row.original.businessPhone || "-"}
            <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
        </div>,
    },
    {
        accessorKey: "email",
        header: "Email ID",
        cell: ({ row }) => (
            <div className="flex items-center gap-1 text-sm group cursor-pointer"
                onClick={() => {
                    navigator.clipboard.writeText(row.original.email);
                    toast.success("Email copied");
                }}
            >
                {row.original.email}
                <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
            </div>
        ),
    },
    {
        id: "socials",
        header: "Social Media",
        cell: ({ row }) => {
            const socials = row.original.socials;
            const copyToClipboard = (text: string, label: string) => {
                navigator.clipboard.writeText(text);
                toast.success(`${label} copied`);
            };

            return (
                <div className="flex items-center gap-3">
                    {socials?.facebookId && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    <Facebook size={18} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b mb-1">Facebook</div>
                                <DropdownMenuItem onClick={() => copyToClipboard(socials.facebookId!, "FB ID")}>
                                    <Copy className="mr-2 h-3.5 w-3.5" /> Copy ID
                                </DropdownMenuItem>
                                {socials.facebookPassword && (
                                    <DropdownMenuItem onClick={() => copyToClipboard(socials.facebookPassword!, "FB Password")}>
                                        <Copy className="mr-2 h-3.5 w-3.5" /> Copy Password
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {socials?.instagramId && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-pink-600 hover:text-pink-700 hover:bg-pink-50">
                                    <Instagram size={18} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b mb-1">Instagram</div>
                                <DropdownMenuItem onClick={() => copyToClipboard(socials.instagramId!, "IG ID")}>
                                    <Copy className="mr-2 h-3.5 w-3.5" /> Copy ID
                                </DropdownMenuItem>
                                {socials.instagramPassword && (
                                    <DropdownMenuItem onClick={() => copyToClipboard(socials.instagramPassword!, "IG Password")}>
                                        <Copy className="mr-2 h-3.5 w-3.5" /> Copy Password
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {!socials?.facebookId && !socials?.instagramId && (
                        <span className="text-muted-foreground text-xs italic ml-1">No credentials</span>
                    )}
                </div>
            );
        },
    },

    // {
    //     id: "actions",
    //     cell: ({ row }) => (
    //         <DropdownMenu>
    //             <DropdownMenuTrigger asChild>
    //                 <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
    //             </DropdownMenuTrigger>
    //             <DropdownMenuContent align="end">
    //                 <DropdownMenuItem onClick={() => onViewTasks(row.original.id)}>
    //                     <FolderOpen className="mr-2 h-4 w-4" /> View Tasks
    //                 </DropdownMenuItem>
    //                 {row.original.website && (
    //                     <DropdownMenuItem onClick={() => window.open(row.original.website, '_blank')}>
    //                         <ExternalLink className="mr-2 h-4 w-4" /> Visit Website
    //                     </DropdownMenuItem>
    //                 )}
    //             </DropdownMenuContent>
    //         </DropdownMenu>
    //     ),
    // },
];