"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { fetchSopGroups } from "@/src/redux/slices/sopGroupSlice";
import { fetchSopPoints } from "@/src/redux/slices/sopPointSlice";

import { SopGroupColumn } from "../sop/components/SopGroupColumn";
import { SopPointColumn } from "../sop/components/SopPointColumn";
import { useAuth } from "@/src/context/AuthContext";

export default function MySopsRulesPage() {
    const dispatch = useAppDispatch();
    const { user } = useAuth();

    // Redux State
    const { groups, isLoading: groupsLoading } = useAppSelector((state) => state.sopGroups);
    const { points, isLoading: pointsLoading } = useAppSelector((state) => state.sopPoints);

    // Context State
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    // 1. Fetch all SOPs & Rules
    useEffect(() => {
        // Omitting category fetches both if the backend ignores undefined
        dispatch(fetchSopGroups({}));
    }, [dispatch]);

    // Handle Group Selection
    useEffect(() => {
        if (selectedGroupId) {
            dispatch(fetchSopPoints(selectedGroupId));
        }
    }, [selectedGroupId, dispatch]);

    // 2. Filter groups based on user assignment
    const assignedGroups = useMemo(() => {
        if (!user) return [];
        
        return groups.filter((group: any) => {
            const hasUserAssignment = group.assignedUsers?.includes(user._id) || group.assignedUsers?.includes(user.id);
            const hasRoleAssignment = group.assignedRoles?.includes(user.role) || group.assignedRoles?.includes(user.specialization);
            return hasUserAssignment || hasRoleAssignment;
        });
    }, [groups, user]);

    // 3. Separate into SOPs and Rules for UI tabs
    const [activeTab, setActiveTab] = useState<"sop" | "rule">("sop");
    
    const filteredGroups = useMemo(() => {
        return assignedGroups.filter((g: any) => g.category === activeTab);
    }, [assignedGroups, activeTab]);

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-4 overflow-hidden">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My SOP & Rules</h1>
                <p className="text-muted-foreground text-sm">View guidelines and procedures assigned specifically to you.</p>
            </div>

            {/* Tabs for switching between SOP and Rules */}
            <div className="flex gap-4 border-b pb-2">
                <button
                    onClick={() => { setActiveTab("sop"); setSelectedGroupId(null); }}
                    className={`font-semibold text-sm pb-1 border-b-2 transition-all ${activeTab === "sop" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                    My SOPs
                </button>
                <button
                    onClick={() => { setActiveTab("rule"); setSelectedGroupId(null); }}
                    className={`font-semibold text-sm pb-1 border-b-2 transition-all ${activeTab === "rule" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                    My Rules
                </button>
            </div>

            {/* Mobile: breadcrumb for group → points drill-down */}
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground lg:hidden">
                <button
                    onClick={() => setSelectedGroupId(null)}
                    className={selectedGroupId ? "text-primary underline underline-offset-2" : "text-slate-500 cursor-default"}
                >
                    All {activeTab === "sop" ? "SOPs" : "Rules"}
                </button>
                {selectedGroupId && (
                    <>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-700 truncate max-w-[160px]">
                            {filteredGroups.find(g => g._id === selectedGroupId)?.title || "Points"}
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
                        groups={filteredGroups}
                        selectedGroupId={selectedGroupId}
                        onSelect={setSelectedGroupId}
                        onAdd={() => {}}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        onMove={() => {}}
                        isLoading={groupsLoading}
                        isReadOnly={true} // ENFORCE READ-ONLY
                        title={activeTab === "sop" ? "SOP Groups" : "Rule Groups"}
                    />
                </div>

                {/* Column 2: Points */}
                <div className={`bg-muted/5 p-4 rounded-xl border border-dashed border-muted h-full overflow-hidden
                    lg:flex lg:flex-col lg:flex-1
                    ${selectedGroupId ? "flex flex-col flex-1" : "hidden lg:flex"}`}>
                    
                    {selectedGroupId ? (
                        <SopPointColumn
                            points={points}
                            groupId={selectedGroupId}
                            onAdd={() => {}}
                            onEdit={() => {}}
                            onDelete={() => {}}
                            onMove={() => {}}
                            isLoading={pointsLoading}
                            isReadOnly={true} // ENFORCE READ-ONLY
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                            <p className="text-xs font-medium text-muted-foreground italic">
                                Select {activeTab === "sop" ? "an SOP" : "a Rule"} from the list to view its contents.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
