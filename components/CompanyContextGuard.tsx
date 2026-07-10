"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { setActiveCompany } from "@/src/redux/slices/authSlice";
import { Loading } from "@/components/ui/Loading";

export function CompanyContextGuard({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const { user, isAuthenticated, activeCompanyId, isLoading: authLoading } = useAppSelector((state) => state.auth);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Only run logic once auth is resolved
        if (!authLoading && isAuthenticated && user) {
            const storedId = localStorage.getItem("active_company_id");
            
            // Options: Main company + Accessible companies
            const main = user.company && typeof user.company !== 'string' ? user.company : null;
            const accessible = user.accessibleCompanies || [];
            
            // Build temporary options list to find match
            const allOptions = [...accessible];
            if (main && !allOptions.find(o => o._id === main._id)) {
                allOptions.unshift(main);
            }

            let resolvedCompany = null;

            // Try to match stored ID
            if (storedId) {
                resolvedCompany = allOptions.find(o => o._id === storedId);
            }

            // Fallback: Default to primary company if context is missing or invalid
            if (!resolvedCompany && allOptions.length > 0) {
                resolvedCompany = allOptions[0];
            }

            if (resolvedCompany) {
                dispatch(setActiveCompany({ _id: resolvedCompany._id, name: resolvedCompany.name }));
            }
            
            setIsInitialized(true);
        } else if (!authLoading && !isAuthenticated) {
            // Not logged in? Just let them pass through (to Login pages)
            setIsInitialized(true);
        }
    }, [authLoading, isAuthenticated, user, dispatch]);

    // Show a premium initialization screen
    if (!isInitialized || authLoading) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-2 w-2 bg-primary rounded-full animate-ping" />
                        </div>
                    </div>
                    <div className="text-center space-y-1">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Kriyona Studio</h3>
                        <p className="text-xs text-slate-500 font-medium animate-pulse">Syncing Company Context...</p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
