"use client";

import React from "react";
import { useAuth } from "@/src/context/AuthContext";
import { SopRulesView } from "@/components/sop/SopRulesView";

import { useRouter } from "next/navigation";

export default function SuperadminSopViewPage() {
    const { user } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (user?.role === "Superadmin") {
            router.replace("/superadmin/sop");
        }
    }, [user, router]);

    return (
        <SopRulesView
            title="My Standard Operating Procedures"
            category="sop"
            entityType="superadmin"
            entityId={user?._id || user?.id}
        />
    );
}
