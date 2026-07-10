"use client";

import React from "react";
import { Edit2, GripVertical, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UiField } from "@/lib/uiSchemaData";
import { cn } from "@/lib/utils";

interface FieldListProps {
    fields: UiField[];
    onEdit: (field: UiField) => void;
    onDelete: (fieldKey: string) => void;
    onAdd: () => void;
}

export function FieldList({ fields, onEdit, onDelete, onAdd }: FieldListProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Configured Fields</h3>
                <Button size="sm" onClick={onAdd} className="gap-2">
                    <Plus className="size-4" /> Add Field
                </Button>
            </div>

            <div className="flex flex-col gap-2">
                {fields.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/30">
                        <p className="text-muted-foreground text-sm italic">No fields configured yet</p>
                    </div>
                ) : (
                    fields.map((field) => (
                        <div
                            key={field.key}
                            className="group flex items-center gap-3 p-3 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300"
                        >
                            <div className="cursor-grab opacity-30 group-hover:opacity-100">
                                <GripVertical className="size-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium truncate">{field.label}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted font-mono uppercase tracking-tighter">
                                        {field.type}
                                    </span>
                                    {field.required && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-bold uppercase tracking-tighter">
                                            Required
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate font-mono">
                                    {field.key}
                                </p>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" onClick={() => onEdit(field)}>
                                    <Edit2 className="size-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onDelete(field.key)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
