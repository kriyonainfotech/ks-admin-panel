"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Team } from "@/lib/teamdata";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown, Eye, Edit, Trash, Lock } from "lucide-react";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ColumnProps {
    onEdit: (member: Team) => void;
    onDelete: (id: string) => void;
    onView: (member: Team) => void;
    onResetPassword: (id: string) => void;
}

export const getTeamColumns = ({ onEdit, onDelete, onView, onResetPassword }: ColumnProps): ColumnDef<Team>[] => [
    {
        accessorKey: "name",
        header: "Team Member",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Avatar
                    role={row.original.role as any}
                    className="h-9 w-9"
                >
                    <AvatarImage src={row.original.profilePic?.url} />
                    <AvatarFallback className="bg-blue-100 text-blue-700">{row.original.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.email}</span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.phone}</span>,
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <Badge variant="secondary">
            {(() => {
                const role = row.original.profile.specialization;
                if (role === "design") return "Designer";
                if (role === "video") return "Video Editor";
                if (role === "marketing") return "Marketing";
                if (role === "web") return "Web Developer";
                return role;
            })()}
        </Badge>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            const styles =
                status === "Active" ? "bg-green-100 text-green-700 border-green-200" :
                    status === "On Leave" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                        "bg-red-100 text-red-700 border-red-200";
            return <Badge className={`${styles} shadow-none border`}>{status}</Badge>;
        },
    },
    {
        accessorKey: "joinedDate",
        header: "Joined Date",
        cell: ({ row }) => {
            const joinedDate = row.original.profile.joinedDate
                ? new Date(row.original.profile.joinedDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })
                : "-";

            return <span className="text-xs text-muted-foreground">{joinedDate}</span>;
        },
    },
    {
        accessorKey: "performance.daily",
        header: "Today Performance",
        cell: ({ row }) => {
            const daily = row.original.performance?.daily;
            if (!daily) return <span className="text-xs text-muted-foreground">-</span>;
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium">Tasks {daily.done}/{daily.total}</span>
                    <span className={`text-[10px] font-bold ${daily.percentage >= 80 ? "text-emerald-600" : daily.percentage >= 50 ? "text-amber-600" : "text-rose-600"}`}>
                        {daily.percentage}%
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "performance.monthly",
        header: "Monthly Performance",
        cell: ({ row }) => {
            const monthly = row.original.performance?.monthly;
            if (!monthly) return <span className="text-xs text-muted-foreground">-</span>;
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium">{monthly.done}/{monthly.total}</span>
                    <span className={`text-[10px] font-bold ${monthly.percentage >= 80 ? "text-emerald-600" : monthly.percentage >= 50 ? "text-amber-600" : "text-rose-600"}`}>
                        {monthly.percentage}%
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "performance.attendance",
        header: "Attendance (Month)",
        cell: ({ row }) => {
            const attendance = row.original.performance?.attendance;
            if (!attendance) return <span className="text-xs text-muted-foreground">-</span>;
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-emerald-600" title="Full Days">Full: {attendance.fullDays}</span>
                        <span className="text-muted-foreground text-[10px]">|</span>
                        <span className="text-xs font-semibold text-amber-600" title="Half Days">Half: {attendance.halfDays}</span>
                        <span className="text-muted-foreground text-[10px]">|</span>
                        <span className="text-xs font-semibold text-rose-600" title="Leaves">Leave: {attendance.leaves}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">Total: {attendance.present}/{attendance.totalDays}</span>
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onView(row.original)} className="gap-2 cursor-pointer">
                        <Eye size={14} />  View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onResetPassword(row.original._id)} className="gap-2 cursor-pointer">
                        <Lock size={14} />  Reset Password
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(row.original)} className="gap-2 cursor-pointer">
                        <Edit size={14} /> Edit Team
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(row.original._id)} className="gap-2 text-destructive cursor-pointer">
                        <Trash size={14} /> Delete
                    </DropdownMenuItem>

                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];