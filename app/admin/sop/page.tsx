"use client";

import React from "react";
import { SopRulesView } from "@/components/sop/SopRulesView";

export default function AdminSopPage() {
    return (
        <SopRulesView
            title="SOP for Administrators"
            category="sop"
            entityType="team"
            teamCategory="admin"
        />
    );
}
