"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, CheckCircle2, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface SopGroupColumnProps {
    groups: any[];
    selectedGroupId: string | null;
    onSelect: (groupId: string) => void;
    onAdd: (title: string) => void;
    onEdit: (group: any) => void;
    onDelete: (id: string) => void;
    onMove: (sourceIndex: number, destinationIndex: number) => void;
    isLoading?: boolean;
    isReadOnly?: boolean;
    title?: string;
    allUsers?: any[];
    teamCategories?: any[];
}

export function SopGroupColumn({
    groups,
    selectedGroupId,
    onSelect,
    onAdd,
    onEdit,
    onDelete,
    onMove,
    isLoading,
    isReadOnly = false,
    title = "SOP Groups",
    allUsers = [],
    teamCategories = []
}: SopGroupColumnProps) {
    const [newTitle, setNewTitle] = useState("");

    const handleAdd = () => {
        if (!newTitle.trim() || isReadOnly) return;
        onAdd(newTitle);
        setNewTitle("");
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination || isReadOnly) return;
        onMove(result.source.index, result.destination.index);
    };

    return (
        <div className="flex flex-col h-full gap-4 max-h-full overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b shrink-0">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-primary" />
                    <h2 className="font-bold text-slate-800">{title}</h2>
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {groups.length}
                    </span>
                </div>
            </div>

            {!isReadOnly && (
                <div className="flex gap-2 shrink-0 px-1">
                    <Input
                        placeholder="New mapping group..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        className="flex-1 bg-white border-slate-200"
                    />
                    <Button onClick={handleAdd} size="sm">
                        <Plus className="size-4" />
                    </Button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="groups-list" isDropDisabled={isReadOnly}>
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-2.5 p-2">
                                {groups.map((group, index) => (
                                    <Draggable 
                                        key={group._id} 
                                        draggableId={group._id} 
                                        index={index}
                                        isDragDisabled={isReadOnly}
                                    >
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps}>
                                                <GroupCard
                                                    dragHandleProps={provided.dragHandleProps}
                                                    group={group}
                                                    allUsers={allUsers}
                                                    teamCategories={teamCategories}
                                                    active={selectedGroupId === group._id}
                                                    onClick={() => onSelect(group._id)}
                                                    onEdit={() => onEdit(group)}
                                                    onDelete={() => onDelete(group._id)}
                                                    isReadOnly={isReadOnly}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    );
}

function GroupCard({ group, allUsers, teamCategories, active, onClick, onEdit, onDelete, dragHandleProps, isReadOnly }: any) {
    const assignedUserNames = (group.assignedUsers || [])
        .map((userId: string) => allUsers?.find((u: any) => u._id === userId)?.name)
        .filter(Boolean);

    const assignedRoleNames = (group.assignedRoles || [])
        .map((roleId: string) => teamCategories?.find((c: any) => c.id === roleId)?.name || roleId)
        .filter(Boolean);

    const hasAssignments = assignedUserNames.length > 0 || assignedRoleNames.length > 0;

    return (
        <Card
            className={cn(
                "cursor-pointer transition-all duration-200 border shadow-sm group relative py-0 overflow-hidden",
                active ? "border-primary/40 bg-primary/5 ring-1 ring-primary/10 shadow-md" : "border-slate-200 bg-white hover:border-primary/30"
            )}
            onClick={onClick}
        >
            {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
            <CardContent className="p-2.5 pl-2 pr-1.5 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1 w-full">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {!isReadOnly && (
                            <div {...dragHandleProps} className="text-muted-foreground/30 hover:text-primary cursor-grab shrink-0">
                                <GripVertical className="size-4" />
                            </div>
                        )}
                        <span className={cn("text-sm font-bold truncate", active ? "text-primary" : "text-slate-700", isReadOnly && "pl-2")}>
                            {group.title}
                        </span>
                    </div>
                    {!isReadOnly && (
                        <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Button size="icon" variant="ghost" className="size-8 hover:bg-primary/10 hover:text-primary" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                                <Edit2 className="size-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="size-8 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    )}
                </div>
                
                {/* Assignments display */}
                {hasAssignments && (
                    <div className={cn("flex flex-wrap gap-1 mt-0.5", isReadOnly ? "pl-2" : "pl-6")}>
                        {assignedRoleNames.map((name: string, i: number) => (
                            <span key={`role-${i}`} className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                                {name}
                            </span>
                        ))}
                        {assignedUserNames.map((name: string, i: number) => (
                            <span key={`user-${i}`} className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                {name}
                            </span>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}