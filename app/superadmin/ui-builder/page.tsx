"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchSchema, saveSchema, clearSchemaError } from "@/src/redux/slices/uiSchemaSlice";
import { ResourceSelector } from "./components/ResourceSelector";
import { FieldList } from "./components/FieldList";
import { FieldDialog } from "./components/FieldDialog";
import { LivePreview } from "./components/LivePreview";
import { Button } from "@/components/ui/button";
import { Save, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { UiField } from "@/lib/uiSchemaData";
import { toast } from "sonner";

export default function UIBuilderPage() {
    const dispatch = useAppDispatch();
    const { schemas, isLoading, error } = useAppSelector((state) => state.uiSchema);

    const [selectedResource, setSelectedResource] = useState("task");
    const [localFields, setLocalFields] = useState<UiField[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [fieldToEdit, setFieldToEdit] = useState<UiField | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch schema when resource changes
    useEffect(() => {
        dispatch(fetchSchema({ resource: selectedResource }));
    }, [selectedResource, dispatch]);

    // Update local fields when schema is loaded
    useEffect(() => {
        if (schemas[selectedResource]) {
            setLocalFields(schemas[selectedResource].fields || []);
            setHasChanges(false);
        } else {
            setLocalFields([]);
        }
    }, [schemas, selectedResource]);

    const handleAddField = () => {
        setFieldToEdit(null);
        setIsDialogOpen(true);
    };

    const handleEditField = (field: UiField) => {
        setFieldToEdit(field);
        setIsDialogOpen(true);
    };

    const handleDeleteField = (fieldKey: string) => {
        const updated = localFields.filter((f) => f.key !== fieldKey);
        setLocalFields(updated);
        setHasChanges(true);
    };

    const handleSaveField = (field: UiField) => {
        if (fieldToEdit) {
            // Update existing
            const updated = localFields.map((f) => (f.key === fieldToEdit.key ? field : f));
            setLocalFields(updated);
        } else {
            // Add new
            if (localFields.some(f => f.key === field.key)) {
                toast.error("A field with this key already exists!");
                return;
            }
            setLocalFields([...localFields, { ...field, order: localFields.length }]);
        }
        setHasChanges(true);
    };

    const handleSaveChanges = async () => {
        try {
            await dispatch(saveSchema({ resource: selectedResource, fields: localFields })).unwrap();
            setHasChanges(false);
            toast.success("Schema saved successfully!");
        } catch (err) {
            toast.error("Failed to save schema: " + err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50 p-6 space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 italic">UI Schema Builder</h1>
                    <p className="text-slate-500 font-medium">Customize the form fields for your application modules</p>
                </div>

                <div className="flex items-center gap-3">
                    {hasChanges && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 animate-pulse">
                            <AlertCircle className="size-3" /> Unsaved Changes
                        </span>
                    )}
                    <Button
                        onClick={handleSaveChanges}
                        disabled={!hasChanges || isLoading}
                        className="gap-2 shadow-lg shadow-primary/20"
                    >
                        {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                        Save Changes
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Editor */}
                <div className="lg:col-span-7 space-y-8">
                    <ResourceSelector
                        selectedResource={selectedResource}
                        onSelect={(r) => {
                            if (hasChanges && !confirm("You have unsaved changes. Change resource anyway?")) return;
                            setSelectedResource(r);
                        }}
                    />

                    <div className="p-6 rounded-2xl border bg-white shadow-sm">
                        <FieldList
                            fields={localFields}
                            onEdit={handleEditField}
                            onDelete={handleDeleteField}
                            onAdd={handleAddField}
                        />
                    </div>
                </div>

                {/* Right Column: Preview */}
                <div className="lg:col-span-5 sticky top-6">
                    <div className="p-2 rounded-3xl border bg-slate-100/50 backdrop-blur-sm">
                        <LivePreview fields={localFields} />
                    </div>
                </div>
            </div>

            <FieldDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveField}
                fieldToEdit={fieldToEdit}
            />
        </div>
    );
}
