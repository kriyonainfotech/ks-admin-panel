"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchAdmins, fetchSuperAdmins, updateAdminPermissions, grantExtraCompanyAccess } from "@/src/redux/slices/adminSlice";
import { fetchTeam } from "@/src/redux/slices/teamSlice";
import { fetchCompanies } from "@/src/redux/slices/companySlice";
import { PERMISSION_MODULES } from "@/lib/permissions-config";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    Shield,
    Lock,
    Save,
    RotateCcw,
    ChevronDown,
    ChevronRight,
    Building2,
    Check,
    Plus,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AccessDashboard() {
    const dispatch = useAppDispatch();
    
    // Data from Redux
    const { admins, superadmins } = useAppSelector((state) => state.admin);
    const { members: teamMembers } = useAppSelector((state) => state.team);
    const { companies } = useAppSelector((state) => state.companies);
    
    // Local State
    const [search, setSearch] = useState("");
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [pendingPermissions, setPendingPermissions] = useState<Record<string, string[]>>({});
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

    useEffect(() => {
        dispatch(fetchAdmins());
        dispatch(fetchTeam());
        dispatch(fetchSuperAdmins());
        dispatch(fetchCompanies());
    }, [dispatch]);

    // Filtered User Lists
    const superadminsList = useMemo(() => {
        return superadmins.filter(u => (
            u.name?.toLowerCase().includes(search.toLowerCase()) || 
            u.email?.toLowerCase().includes(search.toLowerCase())
        ));
    }, [superadmins, search]);

    const adminsList = useMemo(() => {
        return admins.filter(u => u.role === "Admin" && (
            u.name?.toLowerCase().includes(search.toLowerCase()) || 
            u.email?.toLowerCase().includes(search.toLowerCase())
        ));
    }, [admins, search]);

    const teamList = useMemo(() => {
        return teamMembers.filter(u => (
            u.name?.toLowerCase().includes(search.toLowerCase()) || 
            u.email?.toLowerCase().includes(search.toLowerCase())
        ));
    }, [teamMembers, search]);

    const handleTogglePermission = (userId: string, currentPerms: string[] | undefined, permKey: string, role: string) => {
        // 🛡️ Immutable Protection Logic
        if (role === "Superadmin" && (permKey === "access.control" || permKey === "admin.manage")) {
            toast.error("Core Superadmin permissions cannot be removed for security.");
            return;
        }

        const basePerms = currentPerms || [];
        const userPending = pendingPermissions[userId] || basePerms;
        const exists = userPending.includes(permKey);
        
        let newList;
        if (exists) {
            newList = userPending.filter(p => p !== permKey);
        } else {
            newList = [...userPending, permKey];
        }

        setPendingPermissions(prev => ({
            ...prev,
            [userId]: newList
        }));
    };

    const handleSave = async (userId: string) => {
        const permissions = pendingPermissions[userId];
        if (!permissions) return;

        setIsSaving(userId);
        try {
            await dispatch(updateAdminPermissions({ id: userId, permissions })).unwrap();
            toast.success("Permissions updated successfully");
            
            const newPending = { ...pendingPermissions };
            delete newPending[userId];
            setPendingPermissions(newPending);
        } catch (error: any) {
            toast.error(error || "Failed to update permissions");
        } finally {
            setIsSaving(null);
        }
    };

    const handleReset = (userId: string) => {
        const newPending = { ...pendingPermissions };
        delete newPending[userId];
        setPendingPermissions(newPending);
    };

    const handleGrantCompany = async (userId: string) => {
        if (!selectedCompanyId) return toast.error("Choose a company first");
        
        try {
            await dispatch(grantExtraCompanyAccess({ id: userId, companyId: selectedCompanyId })).unwrap();
            toast.success("Company access granted!");
            setSelectedCompanyId("");
        } catch (error: any) {
            toast.error(error);
        }
    };

    const UserTable = ({ users }: { users: any[] }) => (
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col h-full overflow-y-auto">
            <Table>
                <TableHeader className="bg-slate-50 border-b">
                    <TableRow className="hover:bg-transparent tracking-tight">
                        <TableHead className="w-[300px]">Staff Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                No staff members found matching your search.
                            </TableCell>
                        </TableRow>
                    ) : users.map((user) => {
                        const isExpanded = expandedUser === user._id;
                        const hasChanges = !!pendingPermissions[user._id];
                        const currentPerms = pendingPermissions[user._id] || user.customPermissions || [];

                        return (
                            <React.Fragment key={user._id}>
                                <TableRow className={cn(
                                    "transition-colors border-b last:border-0",
                                    isExpanded ? "bg-slate-50/80" : "hover:bg-slate-50/30"
                                )}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                                                <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                                    {user.name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-slate-900 truncate">{user.name}</span>
                                                <span className="text-xs text-slate-500 truncate">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={cn(
                                            "font-medium",
                                            user.role === 'Superadmin' ? "bg-red-50 text-red-600 border-red-100" :
                                                user.role === 'Admin' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                    "bg-orange-100 text-orange-600 border-orange-200"
                                        )}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                                            <Building2 size={14} className="text-slate-400" />
                                            {user.companyName || "Main Entity"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <div className={cn("h-2 w-2 rounded-full", user.isActive !== false ? "bg-green-500" : "bg-red-500")} />
                                            <span className="text-sm font-medium text-slate-700">{user.isActive !== false ? "Active" : "Inactive"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {hasChanges && (
                                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 shadow-none animate-pulse text-[10px]">
                                                    Unsaved
                                                </Badge>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setExpandedUser(isExpanded ? null : user._id)}
                                                className={cn(
                                                    "h-8 border-slate-200 group font-bold tracking-tight",
                                                    isExpanded && "bg-slate-900 text-white border-slate-900 hover:bg-slate-800 hover:text-white"
                                                )}
                                            >
                                                {isExpanded ? "Close" : "Set Access"}
                                                {isExpanded ? <ChevronDown size={14} className="ml-2" /> : <ChevronRight size={14} className="ml-2 group-hover:translate-x-0.5 transition-transform" />}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>

                                {isExpanded && (
                                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-none">
                                        <TableCell colSpan={5} className="p-3">
                                            <div className="bg-white border rounded-2xl shadow-xl p-6 ring-1 ring-slate-200/50">
                                                
                                                {/* Header & Controls */}
                                                <div className="flex items-center justify-between mb-8 border-b pb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 flex items-center justify-center bg-slate-900 text-white rounded-xl shadow-lg">
                                                            <Shield size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 leading-none mb-1">Access Matrix: {user.name}</h4>
                                                            <p className="text-xs text-slate-500">Toggle keys to grant specific module access.</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {hasChanges && (
                                                            <>
                                                                <Button variant="ghost" size="sm" onClick={() => handleReset(user._id)} className="text-slate-500 hover:text-slate-900 h-8 font-bold">
                                                                    <RotateCcw size={14} className="mr-2" /> Reset
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleSave(user._id)}
                                                                    disabled={isSaving === user._id}
                                                                    className="bg-slate-900 hover:bg-slate-800 text-white h-8 px-6 font-bold shadow-md shadow-slate-200"
                                                                >
                                                                    {isSaving === user._id ? (
                                                                        <span className="flex items-center gap-2 font-bold"><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span>
                                                                    ) : <><Save size={14} className="mr-2" /> Update Matrix</>}
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Permissions Matrix */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                                    {PERMISSION_MODULES.map((module) => (
                                                        <div key={module.id} className="space-y-4">
                                                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                                                <div className="flex items-center gap-2 text-slate-900 font-bold text-[10px] uppercase tracking-widest">
                                                                    {module.label}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {module.permissions.map((perm) => {
                                                                    const isEnabled = currentPerms.includes(perm.key);
                                                                    const isLocked = user.role === "Superadmin" && (perm.key === "access.control" || perm.key === "admin.manage");

                                                                    return (
                                                                        <div
                                                                            key={perm.key}
                                                                            onClick={() => !isLocked && handleTogglePermission(user._id, user.customPermissions, perm.key, user.role)}
                                                                            className={cn(
                                                                                "flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200",
                                                                                isEnabled ? "bg-slate-900 text-white shadow-md ring-1 ring-slate-800" : "bg-white text-slate-600 border border-slate-100 hover:border-slate-200",
                                                                                isLocked && "opacity-50 cursor-not-allowed grayscale"
                                                                            )}
                                                                        >
                                                                            <div className={cn(
                                                                                "mt-0.5 w-4 h-4 rounded border transition-colors flex items-center justify-center shrink-0",
                                                                                isEnabled ? "bg-green-500 border-green-500 text-white" : "border-slate-300"
                                                                            )}>
                                                                                {isEnabled && <Check size={12} />}
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <div className="text-[11px] font-bold leading-tight">{perm.label}</div>
                                                                                <p className={cn("text-[8px] leading-tight mt-0.5 opacity-70")}>
                                                                                    {perm.desc}
                                                                                </p>
                                                                            </div>
                                                                            {isLocked && <Lock size={10} className="mt-1" />}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* CROSS-COMPANY ACCESS (Superadmin Only) */}
                                                <div className="mt-8 pt-6 border-t border-slate-100">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Building2 size={18} className="text-primary" />
                                                        <h5 className="font-bold text-sm text-slate-900">Multi-Company Access</h5>
                                                    </div>
                                                    
                                                    <div className="flex flex-col md:flex-row gap-4 items-start">
                                                        <div className="flex-1 space-y-3">
                                                            <p className="text-[11px] text-slate-500">Enable this staff member to switch to another company using the same account.</p>
                                                            
                                                            <div className="flex flex-wrap gap-2">
                                                                {/* Primary Company */}
                                                                <Badge className="bg-slate-100 text-slate-700 border-slate-200 shadow-none px-3 py-1">
                                                                    Primary: {user.companyName || "Main Entity"}
                                                                </Badge>
                                                                
                                                                {/* Extra Companies */}
                                                                {user.accessibleCompanies?.map((comp: any) => (
                                                                    <Badge key={comp._id} className="bg-primary/10 text-primary border-primary/20 shadow-none px-3 py-1 flex items-center gap-2">
                                                                        {comp.name}
                                                                        <X size={12} className="cursor-pointer hover:text-red-500" />
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                                                            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                                                                <SelectTrigger className="w-full md:w-60 h-9 bg-slate-50 border-slate-200 text-xs shadow-none">
                                                                    <SelectValue placeholder="Link to another company..." />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-white">
                                                                    {companies.filter(c => c._id !== user.company).map(c => (
                                                                        <SelectItem key={c._id} value={c._id} className="text-xs shadow-none">{c.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <Button 
                                                                size="sm" 
                                                                onClick={() => handleGrantCompany(user._id)}
                                                                className="h-9 bg-primary hover:bg-primary/90 text-white font-bold px-4"
                                                            >
                                                                <Plus size={14} className="mr-1" /> Grant Access
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Shield className="text-slate-900" size={24} />
                        Granular Access Control
                    </h1>
                    <p className="text-muted-foreground text-sm">Manage individual permissions across all company staff.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-10 bg-white border-slate-200 focus-visible:ring-slate-400"
                    />
                </div>
            </div>

            <Tabs defaultValue="admins" className="flex-1 flex flex-col gap-4 overflow-hidden">
                <TabsList className="bg-slate-100/50 p-1 self-start">
                    <TabsTrigger value="superadmins" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
                        Superadmins ({superadminsList.length})
                    </TabsTrigger>
                    <TabsTrigger value="admins" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
                        Admins ({adminsList.length})
                    </TabsTrigger>
                    <TabsTrigger value="team" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
                        Team Members ({teamList.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="superadmins" className="flex-1 overflow-hidden m-0">
                    <UserTable users={superadminsList} />
                </TabsContent>
                <TabsContent value="admins" className="flex-1 overflow-hidden m-0">
                    <UserTable users={adminsList} />
                </TabsContent>
                <TabsContent value="team" className="flex-1 overflow-hidden m-0">
                    <UserTable users={teamList} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
