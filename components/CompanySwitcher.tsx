"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/src/context/AuthContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Building2, Globe, RefreshCcw } from "lucide-react";
import { axiosInstance as axios } from "@/src/services/apiConnector";
import { toast } from "sonner";

export function CompanySwitcher() {
    const { user } = useAuth();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Refresh Profile on mount to get latest accessibleCompanies
    useEffect(() => {
        const refreshProfile = async () => {
            try {
                const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/me`, {}, { withCredentials: true });
                if (data.success) {
                    localStorage.setItem("kriyona_user", JSON.stringify(data.user));
                    // Note: We might need to trigger a state update in AuthContext here 
                    // if the UI doesn't react to localStorage changes.
                    console.log(data.user, "data")
                }
            } catch (error) {
                console.error("Failed to refresh profile", error);
            }
        };
        refreshProfile();
    }, []);

    // 1. Sync local selected state with localStorage or user default
    useEffect(() => {
        if (typeof window !== "undefined" && user) {
            const stored = localStorage.getItem("active_company_id");
            if (stored) {
                setSelectedId(stored);
            } else if (user.company) {
                const id = typeof user.company === 'string' ? user.company : user.company._id;
                setSelectedId(id);
                localStorage.setItem("active_company_id", id);
            }
        }
    }, [user]);

    // 2. Compute accessible options directly from user object
    const options = useMemo(() => {
        if (!user) return [];

        const main = user.company && typeof user.company === 'object' ? user.company : null;
        const accessible = user.accessibleCompanies || [];

        let combined = [...accessible];

        // Add main company to the top if not already there
        if (main && !combined.find(o => o._id === main._id)) {
            combined.unshift(main);
        }

        return combined;
    }, [user]);

    const handleSwitch = (id: string) => {
        if (id === selectedId) return;

        setSelectedId(id);
        localStorage.setItem("active_company_id", id);

        toast.info("Switching company context...", { 
            duration: 1000,
            icon: <RefreshCcw className="animate-spin text-primary" size={16} />
        });

        // Reload to sync all data with new company context
        setTimeout(() => {
            window.location.reload();
        }, 800);
    };

    if (!user) return null;

    const activeOption = options.find(o => o._id === selectedId);

    return (
        <div className="p-1">
            <Select value={selectedId || ""} onValueChange={handleSwitch}>
                <SelectTrigger className="w-full bg-white border-none hover:bg-slate-100 transition-all h-14 rounded-lg focus:ring-0 shadow-none">
                    <div className="flex items-center gap-3 text-left overflow-hidden">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                            {user.role === "Superadmin" ? <Globe size={18} className="text-primary" /> : <Building2 size={18} className="text-primary" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Active Context</span>
                            <span className="text-xs font-bold truncate text-slate-900">
                                {activeOption?.name || "Select Entity"}
                            </span>
                        </div>
                    </div>
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-700 shadow-2xl rounded-xl ring-1 ring-black/5">
                    <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                        Switch Identity
                    </div>
                    {options.map((company) => (
                        <SelectItem
                            key={company._id}
                            value={company._id}
                            className="focus:bg-primary/5 focus:text-primary cursor-pointer rounded-lg mx-1 my-1 transition-all py-2"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded bg-slate-50 flex items-center justify-center border border-slate-100">
                                    <Building2 size={12} className="text-slate-400" />
                                </div>
                                <span className="font-medium text-xs">{company.name}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
