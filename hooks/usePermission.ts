import { useAppSelector } from "@/src/redux/hooks";

export const usePermission = (requiredPermission: string) => {
    const { user } = useAppSelector((state) => state.auth);

    if (!user) return false;

    // 1. Superadmin has access to EVERYTHING ("God Mode")
    if (user.role === "Superadmin") return true;

    // 2. Check if the user has the specific key
    if (user.permissions && user.permissions.includes(requiredPermission)) {
        return true;
    }

    // 3. Otherwise, Access Denied
    return false;
};