"use client";

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import Cookies from 'js-cookie';

export function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth(); // Ensure we only fetch if user is logged in

    const handleNotificationClick = () => {
        if (pathname?.startsWith("/team")) {
            router.push("/team/notifications");
        } else {
            router.push("/superadmin/notifications");
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const token = Cookies.get("token");
            if (!token) return;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/unread-count`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setUnreadCount(data.count);
            }
        } catch (error) {
            console.error("Failed to fetch unread notifications", error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            // Optional: Poll every 60 seconds to update count
            const interval = setInterval(fetchUnreadCount, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    return (
        <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={handleNotificationClick}
        >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Button>
    );
}
