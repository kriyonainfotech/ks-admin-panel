"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
    Loader2,
    CheckCheck,
    Bell,
    MessageSquare,
    AlertCircle,
    Info,
    CheckCircle2,
    Clock,
    Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Cookies from 'js-cookie';
import { cn } from "@/lib/utils";

interface Notification {
    _id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    type: string;
}

export default function TeamNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const token = Cookies.get("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const token = Cookies.get("token");
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const markAllRead = async () => {
        try {
            const token = Cookies.get("token");
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/read-all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success("All marked as read");
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const filteredNotifications = activeTab === "unread"
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'warning': return <AlertCircle className="h-4 w-4 text-amber-500" />;
            case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'info': return <Info className="h-4 w-4 text-blue-500" />;
            case 'message': return <MessageSquare className="h-4 w-4 text-primary" />;
            default: return <Bell className="h-4 w-4 text-primary" />;
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] max-w-5xl mx-auto p-4 md:p-6 gap-6">
            {/* Header */}
            <div className="flex flex-row items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">Notifications</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllRead}
                        disabled={unreadCount === 0 || loading}
                        className="text-muted-foreground hover:text-primary h-8"
                    >
                        <CheckCheck className="mr-2 h-3.5 w-3.5" />
                        Mark all read
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchNotifications}
                        className="h-8 w-8 text-muted-foreground"
                    >
                        <Loader2 className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-background rounded-xl border shadow-sm">
                <Tabs defaultValue="all" className="flex-1 flex flex-col h-full" onValueChange={setActiveTab}>
                    <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
                        <TabsList className="bg-muted/50 p-1 rounded-lg h-9 gap-1">
                            <TabsTrigger
                                value="all"
                                className="rounded-md px-4 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all h-7"
                            >
                                All
                                <span className="ml-1.5 text-[10px] opacity-70">
                                    {notifications.length}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="unread"
                                className="rounded-md px-4 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all h-7"
                            >
                                Unread
                                {unreadCount > 0 && (
                                    <span className="ml-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary/10 text-primary text-[9px] font-bold px-1">
                                        {unreadCount}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="flex flex-col">
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 px-6 py-3 border-b">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <Skeleton className="h-4 w-[200px]" />
                                        <div className="ml-auto">
                                            <Skeleton className="h-3 w-[100px]" />
                                        </div>
                                    </div>
                                ))
                            ) : filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <Bell className="h-10 w-10 text-muted-foreground/20 mb-3" />
                                    <p className="text-sm text-muted-foreground">No notifications found</p>
                                </div>
                            ) : (
                                filteredNotifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        onClick={() => !notification.isRead && markAsRead({ stopPropagation: () => { } } as any, notification._id)}
                                        className={cn(
                                            "group flex items-center gap-4 px-6 py-3 border-b last:border-0 transition-colors cursor-pointer hover:bg-muted/30",
                                            !notification.isRead ? "bg-primary/[0.02]" : "bg-background"
                                        )}
                                    >
                                        {/* Status Dot */}
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full shrink-0",
                                            !notification.isRead ? "bg-primary" : "bg-transparent"
                                        )} />

                                        {/* Icon */}
                                        <div className={cn(
                                            "h-9 w-9 rounded-full flex items-center justify-center shrink-0 border",
                                            !notification.isRead
                                                ? "bg-primary/5 border-primary/20 text-primary"
                                                : "bg-muted/30 border-muted text-muted-foreground"
                                        )}>
                                            {getIcon(notification.type)}
                                        </div>

                                        {/* Content - Single Line */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <span className={cn(
                                                "text-sm font-medium truncate",
                                                !notification.isRead ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {notification.title}
                                            </span>

                                            <span className="hidden sm:inline text-xs text-muted-foreground/60 truncate max-w-[300px] border-l pl-3 h-3 flex items-center">
                                                {notification.message}
                                            </span>
                                        </div>

                                        {/* Right Side Info */}
                                        <div className="flex items-center gap-6 shrink-0">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                                                <Calendar className="h-3 w-3 opacity-70" />
                                                <span>{format(new Date(notification.createdAt), "MMM d")}</span>
                                                <span className="text-muted-foreground/30">|</span>
                                                <Clock className="h-3 w-3 opacity-70" />
                                                <span>{format(new Date(notification.createdAt), "h:mm a")}</span>
                                            </div>

                                            <div className="w-8 flex justify-end">
                                                {!notification.isRead && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => markAsRead(e, notification._id)}
                                                        title="Mark as read"
                                                    >
                                                        <CheckCheck className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </Tabs>
            </div>
        </div>
    );
}
