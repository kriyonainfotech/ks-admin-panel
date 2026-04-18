"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchSopGroups } from "@/src/redux/slices/sopGroupSlice";
import { fetchSopPoints } from "@/src/redux/slices/sopPointSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText, ShieldCheck, ChevronRight, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SopRulesViewProps {
    title: string;
    category: "sop" | "rule";
    entityType: "superadmin" | "team";
    entityId?: string;
    teamCategory?: string;
}

export function SopRulesView({ title, category, entityType, entityId, teamCategory }: SopRulesViewProps) {
    const dispatch = useAppDispatch();
    const { groups, isLoading: groupsLoading } = useAppSelector((state) => state.sopGroups);
    const { points, isLoading: pointsLoading } = useAppSelector((state) => state.sopPoints);
    const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

    useEffect(() => {
        const params: any = { category, entityType };
        if (entityType === "superadmin") params.entityId = entityId;
        else params.teamCategory = teamCategory;

        dispatch(fetchSopGroups(params));
    }, [dispatch, category, entityType, entityId, teamCategory]);

    const toggleGroup = (groupId: string) => {
        if (expandedGroupId === groupId) {
            setExpandedGroupId(null);
        } else {
            setExpandedGroupId(groupId);
            dispatch(fetchSopPoints(groupId));
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-full mx-auto p-4 md:p-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                    {category === "sop" ? (
                        <FileText className="size-6 text-primary" />
                    ) : (
                        <ShieldCheck className="size-6 text-primary" />
                    )}
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                </div>
                <p className="text-muted-foreground text-sm">
                    {category === "sop"
                        ? "Standard Operating Procedures tailored for your role."
                        : "Rules and Regulations to be followed within the studio."}
                </p>
            </div>

            <Separator />

            {groupsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                    <Loader2 className="size-8 animate-spin" />
                    <p className="text-sm font-medium">Loading {category.toUpperCase()}...</p>
                </div>
            ) : groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/30 rounded-2xl border-2 border-dashed border-muted">
                    <div className="p-4 bg-background rounded-full shadow-sm mb-4">
                        {category === "sop" ? <FileText className="size-10 text-muted-foreground/40" /> : <ShieldCheck className="size-10 text-muted-foreground/40" />}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">No {category.toUpperCase()} Found</h3>
                    <p className="text-muted-foreground max-w-[280px] mt-2">
                        There are currently no {category === "sop" ? "procedures" : "rules"} defined for this category.
                    </p>
                </div>
            ) : (
                <div className="w-full space-y-4">
                    {groups.map((group) => {
                        const isExpanded = expandedGroupId === group._id;
                        return (
                            <div
                                key={group._id}
                                className="border rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                            >
                                <button
                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                    onClick={() => toggleGroup(group._id)}
                                >
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary font-bold text-sm shrink-0">
                                            {group.order + 1}
                                        </div>
                                        <span className="font-bold text-slate-800">
                                            {group.title}
                                        </span>
                                    </div>
                                    {isExpanded ? <ChevronDown className="size-5 text-slate-400" /> : <ChevronRight className="size-5 text-slate-400" />}
                                </button>

                                {isExpanded && (
                                    <div className="pb-6 pt-2 border-t bg-slate-50/30">
                                        {pointsLoading ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : points.length === 0 ? (
                                            <p className="text-center text-sm text-muted-foreground italic py-4">
                                                No details available for this section.
                                            </p>
                                        ) : (
                                            <ul className="space-y-3 pl-11 pr-4">
                                                {points.map((point) => (
                                                    <li key={point._id} className="flex gap-3 group/item">
                                                        <div className="size-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0 group-hover/item:bg-primary transition-colors" />
                                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                                            {point.content}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
