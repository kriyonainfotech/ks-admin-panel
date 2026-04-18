import { ReactNode } from "react";
import { usePermission } from "@/hooks/usePermission";

interface PermissionGuardProps {
    required: string;
    children: ReactNode;
    fallback?: ReactNode; // Optional: Show "Access Denied" text instead of null
}

export const PermissionGuard = ({ required, children, fallback = null }: PermissionGuardProps) => {
    const hasAccess = usePermission(required);

    if (hasAccess) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};