"use client";

import React from "react";
import { UiField } from "@/lib/uiSchemaData";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LivePreviewProps {
    fields: UiField[];
}

export function LivePreview({ fields }: LivePreviewProps) {
    return (
        <Card className="h-full border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-bold opacity-70">
                    Live Preview
                </CardTitle>
            </CardHeader>
            <CardContent className="px-5 py-6 rounded-2xl border bg-white/50 backdrop-blur-sm shadow-inner min-h-[400px]">
                <div className="space-y-6">
                    {fields.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                <span className="text-muted-foreground text-xl font-bold">?</span>
                            </div>
                            <p className="text-muted-foreground font-medium">Add fields to see the preview</p>
                        </div>
                    ) : (
                        fields.map((field) => (
                            <div key={field.key} className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                <div className="flex items-center gap-1">
                                    <Label className="text-sm font-semibold text-slate-700">
                                        {field.label}
                                    </Label>
                                    {field.required && <span className="text-destructive">*</span>}
                                </div>

                                {renderPreviewField(field)}

                                {field.placeholder && (
                                    <p className="text-[10px] text-muted-foreground ml-1">
                                        *{field.placeholder}
                                    </p>
                                )}
                            </div>
                        ))
                    )}

                    {fields.length > 0 && (
                        <div className="pt-4 border-t border-dashed">
                            <div className="h-10 w-full rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <span className="text-primary text-xs font-bold uppercase tracking-widest">
                                    Preview Only
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function renderPreviewField(field: UiField) {
    switch (field.type) {
        case "text":
            return <Input placeholder={field.placeholder || "Enter text..."} disabled />;
        case "number":
            return <Input type="number" placeholder={field.placeholder || "0"} disabled />;
        case "textarea":
            return (
                <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={field.placeholder || "Enter description..."}
                    disabled
                />
            );
        case "date":
            return <Input type="date" disabled />;
        case "select":
            return (
                <Select disabled>
                    <SelectTrigger>
                        <SelectValue placeholder={field.placeholder || "Select option"} />
                    </SelectTrigger>
                    <SelectContent />
                </Select>
            );
        case "boolean":
            return (
                <div className="flex items-center gap-2">
                    <Checkbox id={`preview-${field.key}`} disabled />
                    <Label htmlFor={`preview-${field.key}`} className="text-xs text-muted-foreground italic">
                        Default: False
                    </Label>
                </div>
            );
        default:
            return null;
    }
}
