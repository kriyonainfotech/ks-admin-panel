"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { Loader2 } from "lucide-react"; // Optional spinner

interface PrivateRouteProps {
    children: React.ReactNode;
    roles?: string[];
}

export default function PrivateRoute({ children, roles }: PrivateRouteProps) {
    // 1. Destructure isLoading
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // 2. DO NOT redirect if still loading
        if (isLoading) return;

        // Not logged in → redirect
        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }

        // Role check
        if (roles && user && !roles.includes(user.role)) {
            router.replace("/");
            return;
        }
    }, [isAuthenticated, isLoading, user, roles, router]);

    // 3. Show Spinner while checking LocalStorage
    if (isLoading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // 4. If finished loading and not authenticated (or wrong role), render nothing (useEffect will handle redirect)
    if (!isAuthenticated || (roles && user && !roles.includes(user.role))) {
        return null;
    }

    return <>{children}</>;
}