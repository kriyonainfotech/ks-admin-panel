"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
    className?: string;
    variant?: "full" | "inline" | "table-row";
    text?: string;
    colSpan?: number; // For table-row variant
}

export function Loading({ className, variant = "full", text = "Loading data...", colSpan = 5 }: LoadingProps) {
    if (variant === "table-row") {
        return (
            <tr className={cn("animate-in fade-in duration-500", className)}>
                <td colSpan={colSpan} className="h-32 text-center align-middle">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-80" />
                        <p className="text-sm font-medium text-muted-foreground animate-pulse">
                            {text}
                        </p>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-4 p-8 animate-in fade-in duration-500",
                variant === "full" && "min-h-[400px] flex-1",
                variant === "inline" && "p-4 min-h-[100px]",
                className
            )}
        >
            <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="absolute inset-0 h-10 w-10 animate-ping rounded-full bg-primary/20" />
            </div>
            <p className="text-base font-semibold text-muted-foreground tracking-tight animate-pulse">
                {text}
            </p>
        </div>
    );
}
