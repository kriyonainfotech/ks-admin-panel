"use client";

import React from "react";
import { SopRulesView } from "@/components/sop/SopRulesView";

export default function AdminRulesPage() {
    return (
        <SopRulesView
            title="Rules & Regulations for Administrators"
            category="rule"
            entityType="team"
            teamCategory="admin"
        />
    );
}
