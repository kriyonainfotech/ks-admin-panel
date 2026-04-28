"use client";

import React, { useMemo } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { SopRulesView } from "@/components/sop/SopRulesView";

export default function TeamRulesPage() {
    const { user } = useAuth();

    const teamCategory = useMemo(() => {
        if (user?.role === "Admin") return "admin";
        const spec = (user?.profile?.specialization || user?.specialization || "").toLowerCase().trim();
        if (spec.includes("design") || spec.includes("graphic") || spec.includes("art")) return "design";
        if (spec.includes("video") || spec.includes("edit")) return "video";
        if (spec.includes("marketing") || spec.includes("market")) return "marketing";
        if (spec.includes("web") || spec.includes("dev")) return "web";
        return "default";
    }, [user]);

    return (
        <SopRulesView
            title="My Rules & Regulations"
            category="rule"
            entityType="team"
            teamCategory={teamCategory}
        />
    );
}
