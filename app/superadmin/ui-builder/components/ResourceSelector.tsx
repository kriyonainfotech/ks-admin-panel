"use client";

import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const resources = [
    { value: "task", label: "Tasks" },
    { value: "client", label: "Clients" },
    { value: "lead", label: "Leads" },
    { value: "project", label: "Projects" },
];

interface ResourceSelectorProps {
    selectedResource: string;
    onSelect: (resource: string) => void;
}

export function ResourceSelector({ selectedResource, onSelect }: ResourceSelectorProps) {
    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Select Resource
                </CardTitle>
                <CardDescription>
                    Choose a module to customize its fields
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <div className="grid grid-cols-2 gap-3">
                    {resources.map((resource) => (
                        <Button
                            key={resource.value}
                            variant={selectedResource === resource.value ? "default" : "outline"}
                            className={cn(
                                "h-20 flex-col gap-2 transition-all duration-300",
                                selectedResource === resource.value
                                    ? "shadow-lg shadow-primary/20 scale-[1.02]"
                                    : "hover:border-primary/50"
                            )}
                            onClick={() => onSelect(resource.value)}
                        >
                            <span className="text-xs uppercase tracking-wider font-bold opacity-70">
                                {resource.value}
                            </span>
                            <span className="text-base font-semibold">{resource.label}</span>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
