"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchSuperAdmins, fetchAdmins } from "@/src/redux/slices/adminSlice";
import {
    fetchSopGroups,
    createSopGroup,
    updateSopGroup,
    deleteSopGroup,
    reorderSopGroups,
    resetSopGroupStatus,
    reorderGroupsSync
} from "@/src/redux/slices/sopGroupSlice";
import {
    fetchSopPoints,
    createSopPoint,
    updateSopPoint,
    deleteSopPoint,
    reorderSopPoints,
    resetSopPointStatus,
    reorderPointsSync
} from "@/src/redux/slices/sopPointSlice";

import { SopGroupColumn } from "../sop/components/SopGroupColumn";
import { SopPointColumn } from "../sop/components/SopPointColumn";

import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/src/context/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";

const TEAM_CATEGORIES = [
    { id: "Admin", name: "Admin Role" },
    { id: "Superadmin", name: "Superadmin Role" },
    { id: "designer", name: "Designer" },
    { id: "video", name: "Video Editor" },
    { id: "marketing", name: "Marketer" },
    { id: "web", name: "Web Developer" },
];

export default function RulesPage() {
    const dispatch = useAppDispatch();
    const { user } = useAuth();

    // Redux State
    const { superadmins, admins } = useAppSelector((state) => state.admin);
    const { groups, isLoading: groupsLoading, message: groupMsg, error: groupErr } = useAppSelector((state) => state.sopGroups);
    const { points, isLoading: pointsLoading, message: pointMsg, error: pointErr } = useAppSelector((state) => state.sopPoints);

    // Context State
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    // Dialog States
    const [editGroup, setEditGroup] = useState<any>(null); // if _id exists, it's edit, else create
    const [editPoint, setEditPoint] = useState<any>(null);
    const [deleteConfig, setDeleteConfig] = useState<{ type: 'group' | 'point', id: string } | null>(null);

    // Restriction Logic
    const isMasterAdmin = user?.role === "Superadmin";
    const isReadOnly = !isMasterAdmin;

    useEffect(() => {
        dispatch(fetchSuperAdmins());
        dispatch(fetchAdmins());
        // Fetch all Rules for the company since it's global now
        dispatch(fetchSopGroups({ category: "rule" }));
    }, [dispatch]);

    useEffect(() => {
        if (groupMsg) { toast.success(groupMsg); dispatch(resetSopGroupStatus()); }
        if (groupErr) { toast.error(groupErr); dispatch(resetSopGroupStatus()); }
        if (pointMsg) { toast.success(pointMsg); dispatch(resetSopPointStatus()); }
        if (pointErr) { toast.error(pointErr); dispatch(resetSopPointStatus()); }
    }, [groupMsg, groupErr, pointMsg, pointErr, dispatch]);

    // Handle Group Selection
    useEffect(() => {
        if (selectedGroupId) {
            dispatch(fetchSopPoints(selectedGroupId));
        }
    }, [selectedGroupId, dispatch]);

    if (user?.role !== "Superadmin") {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-40px)] text-center">
                <h1 className="text-2xl font-bold text-destructive">Access Restricted</h1>
                <p className="text-muted-foreground mt-2">Only administrators can manage SOPs and Rules.</p>
            </div>
        );
    }

    // --- Action Handlers ---

    const handleSaveGroup = (data: any) => {
        if (isReadOnly) return;
        
        const payload: any = {
            title: data.title,
            category: "rule",
            assignedRoles: data.assignedRoles,
            assignedUsers: data.assignedUsers
        };

        if (data._id) {
            dispatch(updateSopGroup({ id: data._id, data: payload }));
        } else {
            const maxOrder = groups.length > 0 ? Math.max(...groups.map(g => g.order || 0)) : -1;
            payload.order = maxOrder + 1;
            dispatch(createSopGroup(payload));
        }
        setEditGroup(null);
    };

    const handleAddPoint = (content: string) => {
        if (!selectedGroupId || isReadOnly) return;
        const maxOrder = points.length > 0 ? Math.max(...points.map(p => p.order || 0)) : -1;
        dispatch(createSopPoint({
            content,
            groupId: selectedGroupId,
            order: maxOrder + 1
        }));
    };

    const handleMoveGroup = (sourceIndex: number, destinationIndex: number) => {
        if (isReadOnly) return;
        dispatch(reorderGroupsSync({ sourceIndex, destinationIndex }));
        const nextGroups = [...groups];
        const [reorderedItem] = nextGroups.splice(sourceIndex, 1);
        nextGroups.splice(destinationIndex, 0, reorderedItem);
        const orders = nextGroups.map((g, idx) => ({ id: g._id, order: idx }));
        dispatch(reorderSopGroups(orders));
    };

    const handleMovePoint = (sourceIndex: number, destinationIndex: number) => {
        if (isReadOnly) return;
        dispatch(reorderPointsSync({ sourceIndex, destinationIndex }));
        const nextPoints = [...points];
        const [reorderedItem] = nextPoints.splice(sourceIndex, 1);
        nextPoints.splice(destinationIndex, 0, reorderedItem);
        const orders = nextPoints.map((p, idx) => ({ id: p._id, order: idx }));
        dispatch(reorderSopPoints(orders));
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-4 overflow-hidden">
            {/* Page Header */}
            <div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">Rules & Guidelines</h1>
                        {user?.activeCompanyName && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
                                {user.activeCompanyName}
                            </span>
                        )}
                    </div>
                    <Button onClick={() => setEditGroup({})} size="sm">Create Global Rule</Button>
                </div>
                <p className="text-muted-foreground text-sm">Create global Rules and assign them to specific roles or users.</p>
            </div>

            {/* Mobile: breadcrumb for group → points drill-down */}
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground lg:hidden">
                <button
                    onClick={() => setSelectedGroupId(null)}
                    className={selectedGroupId ? "text-primary underline underline-offset-2" : "text-slate-500 cursor-default"}
                >
                    All Groups
                </button>
                {selectedGroupId && (
                    <>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-700 truncate max-w-[160px]">
                            {groups.find(g => g._id === selectedGroupId)?.title || "Points"}
                        </span>
                    </>
                )}
            </div>

            {/* Desktop: 2-Column | Mobile: single active panel */}
            <div className="flex flex-1 gap-6 min-h-0">
                {/* Column 1: Groups */}
                <div className={`lg:w-[350px] lg:border-r lg:pr-2 lg:block lg:h-full
                    ${selectedGroupId ? "hidden lg:block" : "flex-1"}`}>
                    <SopGroupColumn
                        groups={groups}
                        selectedGroupId={selectedGroupId}
                        onSelect={setSelectedGroupId}
                        onAdd={(title) => handleSaveGroup({ title, assignedRoles: [], assignedUsers: [] })}
                        onEdit={setEditGroup}
                        onDelete={(id) => setDeleteConfig({ type: 'group', id })}
                        onMove={handleMoveGroup}
                        isLoading={groupsLoading}
                        isReadOnly={isReadOnly}
                        title="Rule Groups"
                        allUsers={[...superadmins, ...admins]}
                        teamCategories={TEAM_CATEGORIES}
                    />
                </div>

                {/* Column 2: Points */}
                <div className={`bg-muted/5 p-4 rounded-xl border border-dashed border-muted h-full overflow-hidden
                    lg:flex lg:flex-col lg:flex-1
                    ${selectedGroupId ? "flex flex-col flex-1" : "hidden lg:flex"}`}>
                    <SopPointColumn
                        points={points}
                        groupId={selectedGroupId}
                        onAdd={handleAddPoint}
                        onEdit={setEditPoint}
                        onDelete={(id) => setDeleteConfig({ type: 'point', id })}
                        onMove={handleMovePoint}
                        isLoading={pointsLoading}
                        isReadOnly={isReadOnly}
                    />
                </div>
            </div>

            {/* Edit Group Dialog */}
            {editGroup !== null && (
                <EditGroupDialog
                    open={true}
                    group={editGroup}
                    superadmins={superadmins}
                    admins={admins}
                    teamCategories={TEAM_CATEGORIES}
                    onClose={() => setEditGroup(null)}
                    onSubmit={handleSaveGroup}
                />
            )}

            {/* Edit Point Dialog */}
            {editPoint !== null && (
                <Dialog open={true} onOpenChange={() => setEditPoint(null)}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Edit Point</DialogTitle></DialogHeader>
                        <div className="py-4">
                            <Textarea
                                defaultValue={editPoint.content}
                                id="point-content"
                                autoFocus
                                rows={5}
                                className="resize-none"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setEditPoint(null)}>Cancel</Button>
                            <Button onClick={() => {
                                const val = (document.getElementById("point-content") as HTMLTextAreaElement).value;
                                dispatch(updateSopPoint({ id: editPoint._id, data: { content: val } }));
                                setEditPoint(null);
                            }}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteConfig}
                onOpenChange={(open) => !open && setDeleteConfig(null)}
                onConfirm={() => {
                    if (deleteConfig?.type === 'group') dispatch(deleteSopGroup(deleteConfig.id));
                    else if (deleteConfig?.type === 'point') dispatch(deleteSopPoint(deleteConfig.id));
                    setDeleteConfig(null);
                }}
                title={`Delete ${deleteConfig?.type === 'group' ? 'Group' : 'Point'}?`}
                description={`This will permanently remove this ${deleteConfig?.type}. Associated data will be lost.`}
            />
        </div>
    );
}

function EditGroupDialog({ open, group, superadmins, admins, teamCategories, onClose, onSubmit }: any) {
    const [title, setTitle] = useState(group.title || "");
    const [assignedRoles, setAssignedRoles] = useState<string[]>(group.assignedRoles || []);
    const [assignedUsers, setAssignedUsers] = useState<string[]>(group.assignedUsers || []);

    const toggleRole = (role: string) => {
        setAssignedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
    };

    const toggleUser = (userId: string) => {
        setAssignedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>{group._id ? "Edit Rule Group" : "Create Rule Group"}</DialogTitle></DialogHeader>
                <div className="py-2 flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Title</label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Leave Policy" autoFocus />
                    </div>

                    <div className="grid grid-cols-2 gap-4 h-[250px]">
                        {/* Roles */}
                        <div className="flex flex-col border rounded-md overflow-hidden">
                            <div className="bg-muted px-3 py-1.5 text-xs font-bold border-b">Assign Roles</div>
                            <ScrollArea className="flex-1 p-2">
                                <div className="flex flex-col gap-2">
                                    {teamCategories.map((c: any) => (
                                        <div key={c.id} className="flex items-center space-x-2">
                                            <Checkbox id={`role-${c.id}`} checked={assignedRoles.includes(c.id)} onCheckedChange={() => toggleRole(c.id)} />
                                            <label htmlFor={`role-${c.id}`} className="text-sm font-medium leading-none cursor-pointer">{c.name}</label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                        
                        {/* Users */}
                        <div className="flex flex-col border rounded-md overflow-hidden">
                            <div className="bg-muted px-3 py-1.5 text-xs font-bold border-b">Assign Users</div>
                            <ScrollArea className="flex-1 p-2">
                                <div className="flex flex-col gap-2">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Superadmins</div>
                                    {superadmins.map((u: any) => (
                                        <div key={u._id} className="flex items-center space-x-2">
                                            <Checkbox id={`user-${u._id}`} checked={assignedUsers.includes(u._id)} onCheckedChange={() => toggleUser(u._id)} />
                                            <label htmlFor={`user-${u._id}`} className="text-sm leading-none cursor-pointer truncate max-w-[100px]">{u.name}</label>
                                        </div>
                                    ))}
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase mt-2">Admins</div>
                                    {admins.map((u: any) => (
                                        <div key={u._id} className="flex items-center space-x-2">
                                            <Checkbox id={`user-${u._id}`} checked={assignedUsers.includes(u._id)} onCheckedChange={() => toggleUser(u._id)} />
                                            <label htmlFor={`user-${u._id}`} className="text-sm leading-none cursor-pointer truncate max-w-[100px]">{u.name}</label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => onSubmit({ _id: group._id, title, assignedRoles, assignedUsers })}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
