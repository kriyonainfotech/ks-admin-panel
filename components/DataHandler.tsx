"use client";

import React from "react";
import { Loading } from "@/components/ui/Loading";
import { cn } from "@/lib/utils";
import { FileSearch } from "lucide-react";

interface DataHandlerProps {
    loading: boolean;
    isEmpty: boolean;
    emptyText?: string;
    loadingText?: string;
    children: React.ReactNode;
    variant?: "full" | "inline" | "table-row";
    colSpan?: number; // For table-row empty state
    className?: string;
}

export function DataHandler({
    loading,
    isEmpty,
    emptyText = "No data found.",
    loadingText = "Fetching data...",
    children,
    variant = "full",
    colSpan = 5,
    className,
}: DataHandlerProps) {
    if (loading) {
        return <Loading variant={variant} text={loadingText} colSpan={colSpan} className={className} />;
    }

    if (isEmpty) {
        if (variant === "table-row") {
            return (
                <tr className={cn("animate-in fade-in duration-500", className)}>
                    <td colSpan={colSpan} className="h-32 text-center align-middle">
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <FileSearch className="h-8 w-8 opacity-20" />
                            <p className="text-sm font-medium">{emptyText}</p>
                        </div>
                    </td>
                </tr>
            );
        }

        return (
            <div
                className={cn(
                    "flex flex-col items-center justify-center gap-3 p-12 text-center animate-in fade-in duration-500",
                    variant === "full" && "min-h-[400px] flex-1",
                    variant === "inline" && "p-6 min-h-[150px]",
                    className
                )}
            >
                <div className="rounded-full bg-muted p-4">
                    <FileSearch className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
                <div className="space-y-1">
                    <p className="text-lg font-semibold tracking-tight">{emptyText}</p>
                    <p className="text-sm text-muted-foreground max-w-[250px]">
                        Try adjusting your filters or search terms.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
