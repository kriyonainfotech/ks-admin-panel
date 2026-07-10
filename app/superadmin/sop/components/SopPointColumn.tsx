// "use client";

// import React, { useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { cn } from "@/lib/utils";
// import { Plus, Edit2, Trash2, ListChecks, CheckCircle2, ChevronUp, ChevronDown } from "lucide-react";

// interface SopPointColumnProps {
//     points: any[];
//     groupId: string | null;
//     onAdd: (content: string) => void;
//     onEdit: (point: any) => void;
//     onDelete: (id: string) => void;
//     onMove: (index: number, direction: 'up' | 'down') => void;
//     isLoading?: boolean;
// }

// export function SopPointColumn({ points, groupId, onAdd, onEdit, onDelete, onMove, isLoading }: SopPointColumnProps) {
//     const [newPoint, setNewPoint] = useState("");

//     const handleAdd = () => {
//         if (!newPoint.trim()) return;
//         onAdd(newPoint);
//         setNewPoint("");
//     };

//     const handleMove = (index: number, direction: 'up' | 'down') => {
//         if (typeof onMove === 'function') {
//             onMove(index, direction);
//         } else {
//             console.error("onMove is not a function:", onMove);
//         }
//     };

//     if (!groupId) {
//         return (
//             <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-white/50 rounded-xl border border-dashed border-slate-200">
//                 <ListChecks className="size-12 mb-4 opacity-20" />
//                 <p className="text-sm font-medium">Select a group to see points</p>
//             </div>
//         );
//     }

//     return (
//         <div className="flex flex-col h-full gap-4">
//             <div className="flex items-center justify-between pb-2 border-b">
//                 <div className="flex items-center gap-2">
//                     <CheckCircle2 className="size-5 text-primary" />
//                     <h2 className="font-bold text-slate-800">Process Points</h2>
//                     <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
//                         {points.length}
//                     </span>
//                 </div>
//             </div>

//             <div className="flex gap-2">
//                 <Input
//                     placeholder="Add a new point..."
//                     value={newPoint}
//                     onChange={(e) => setNewPoint(e.target.value)}
//                     onKeyDown={(e) => e.key === "Enter" && handleAdd()}
//                     className="flex-1 bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/10 transition-all font-medium text-sm"
//                 />
//                 <Button
//                     onClick={handleAdd}
//                     className="bg-primary hover:bg-primary/90 text-white shadow-sm transition-all"
//                 >
//                     <Plus className="size-4 mr-2" /> Add
//                 </Button>
//             </div>

//             <ScrollArea className="flex-1 pr-4">
//                 <div className="flex flex-col gap-2.5">
//                     {points.map((point, index) => (
//                         <PointCard
//                             key={point._id}
//                             id={point._id}
//                             content={point.content}
//                             onEdit={() => onEdit(point)}
//                             onDelete={() => onDelete(point._id)}
//                             onMoveUp={() => handleMove(index, 'up')}
//                             onMoveDown={() => handleMove(index, 'down')}
//                             isFirst={index === 0}
//                             isLast={index === points.length - 1}
//                         />
//                     ))}
//                     {points.length === 0 && !isLoading && (
//                         <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
//                             <p className="text-sm text-muted-foreground italic">No points added yet.</p>
//                         </div>
//                     )}
//                 </div>
//             </ScrollArea>
//         </div>
//     );
// }

// function PointCard({ id, content, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
//     id: string,
//     content: string,
//     onEdit: () => void,
//     onDelete: () => void,
//     onMoveUp: () => void,
//     onMoveDown: () => void,
//     isFirst: boolean,
//     isLast: boolean
// }) {
//     return (
//         <Card
//             className="transition-all duration-200 border shadow-sm group relative overflow-hidden py-0 border-slate-200 bg-white hover:border-primary/30 hover:shadow-md"
//         >
//             <CardContent className="p-2.5 pl-3 flex items-start gap-2.5 group">
//                 <div className="flex flex-row gap-1 items-center bg-red-50 rounded-md p-0.5 mt-0.5 border border-red-100/50">
//                     <Button
//                         size="icon"
//                         variant="ghost"
//                         className={cn(
//                             "size-6 hover:bg-red-600 hover:text-white text-red-600 transition-all duration-200",
//                             isFirst ? "opacity-0 pointer-events-none" : "opacity-60 group-hover:opacity-100"
//                         )}
//                         onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
//                     >
//                         <ChevronUp className="size-3.5" />
//                     </Button>
//                     <Button
//                         size="icon"
//                         variant="ghost"
//                         className={cn(
//                             "size-6 hover:bg-red-600 hover:text-white text-red-600 transition-all duration-200",
//                             isLast ? "opacity-0 pointer-events-none" : "opacity-60 group-hover:opacity-100"
//                         )}
//                         onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
//                     >
//                         <ChevronDown className="size-3.5" />
//                     </Button>
//                 </div>
//                 <div className="flex-1 min-w-0 pt-0.5">
//                     <p className="text-sm font-medium leading-relaxed text-slate-700 break-words group-hover:text-slate-900 transition-colors">
//                         {content}
//                     </p>
//                 </div>
//                 <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0 ml-2">
//                     <Button
//                         size="icon"
//                         variant="ghost"
//                         className="size-7 hover:bg-primary/10 hover:text-primary"
//                         onClick={(e) => { e.stopPropagation(); onEdit(); }}
//                     >
//                         <Edit2 className="size-3" />
//                     </Button>
//                     <Button
//                         size="icon"
//                         variant="ghost"
//                         className="size-7 text-destructive hover:bg-destructive/10"
//                         onClick={(e) => { e.stopPropagation(); onDelete(); }}
//                     >
//                         <Trash2 className="size-3" />
//                     </Button>
//                 </div>
//             </CardContent>
//         </Card>
//     );
// }


"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, Edit2, Trash2, ListChecks, CheckCircle2, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Textarea } from "@/components/ui/textarea";

interface SopPointColumnProps {
    points: any[];
    groupId: string | null;
    onAdd: (content: string) => void;
    onEdit: (point: any) => void;
    onDelete: (id: string) => void;
    onMove: (sourceIndex: number, destinationIndex: number) => void;
    isLoading?: boolean;
    isReadOnly?: boolean;
}

export function SopPointColumn({ points, groupId, onAdd, onEdit, onDelete, onMove, isLoading, isReadOnly = false }: SopPointColumnProps) {
    const [newPoint, setNewPoint] = useState("");

    const handleAdd = () => {
        if (!newPoint.trim() || isReadOnly) return;
        onAdd(newPoint);
        setNewPoint("");
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination || isReadOnly) return;
        onMove(result.source.index, result.destination.index);
    };

    if (!groupId) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-white/50 rounded-xl border border-dashed border-slate-200">
                <ListChecks className="size-12 mb-4 opacity-20" />
                <p className="text-sm font-medium">Select a group to see points</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-4 max-h-full overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b shrink-0">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-primary" />
                    <h2 className="font-bold text-slate-800">Process Points</h2>
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {points.length}
                    </span>
                </div>
            </div>

            {!isReadOnly && (
                <div className="flex gap-2 shrink-0 px-1">
                    <Textarea
                        placeholder="Add a new point..."
                        value={newPoint}
                        onChange={(e) => setNewPoint(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleAdd())}
                        rows={2}
                        className="flex-1 bg-white border-slate-200 resize-none"
                    />
                    <Button onClick={handleAdd} size="sm" className="self-end">
                        <Plus className="size-4" />
                    </Button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="points-list" isDropDisabled={isReadOnly}>
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-2.5 p-2">
                                {points.map((point, index) => (
                                    <Draggable 
                                        key={point._id} 
                                        draggableId={point._id} 
                                        index={index}
                                        isDragDisabled={isReadOnly}
                                    >
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps}>
                                                <PointCard
                                                    dragHandleProps={provided.dragHandleProps}
                                                    content={point.content}
                                                    onEdit={() => onEdit(point)}
                                                    onDelete={() => onDelete(point._id)}
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

function PointCard({ content, onEdit, onDelete, dragHandleProps, isReadOnly }: any) {
    return (
        <Card className="transition-all duration-200 border shadow-sm group relative py-0 border-slate-200 bg-white hover:border-primary/30 overflow-hidden">
            <CardContent className="p-2.5 pl-2 pr-1.5 flex items-start gap-2">
                {!isReadOnly && (
                    <div {...dragHandleProps} className="text-muted-foreground/30 hover:text-primary cursor-grab mt-1 shrink-0">
                        <GripVertical className="size-4" />
                    </div>
                )}
                <div className="flex-1 min-w-0 pt-0.5">
                    <p className={cn(
                        "text-sm font-medium leading-relaxed text-slate-700 break-words whitespace-pre-wrap min-w-0 flex-1 line-clamp-2 group-hover:line-clamp-none",
                        isReadOnly && "pl-2"
                    )}>
                        {content}
                    </p>
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
            </CardContent>
        </Card>
    );
}