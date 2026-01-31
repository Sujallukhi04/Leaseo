"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/actions/customer/notification";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string; // REWARD, ORDER, etc.
    isRead: boolean;
    createdAt: Date;
    metadata?: any;
}

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const prevUnreadCountRef = useRef(0);

    const fetchNotifications = async () => {
        const res = await getNotifications();
        if (res.notifications) {
            // @ts-ignore
            setNotifications(res.notifications);
            setUnreadCount(res.notifications.filter((n: any) => !n.isRead).length);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Handle animation logic: 
    // Animate if we have unread items AND (it's new OR we haven't acknowledged it yet)
    useEffect(() => {
        // If unread count increased (new items) or initial load > 0
        if (unreadCount > 0 && unreadCount > prevUnreadCountRef.current) {
            setShouldAnimate(true);
        }
        prevUnreadCountRef.current = unreadCount;
    }, [unreadCount]);

    const handleMarkAsRead = async (id: string, isRead: boolean) => {
        if (isRead) return;

        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        await markNotificationAsRead(id);
    };

    const copyToClipboard = (text: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        toast.success("Coupon code copied!");
    };

    return (
        <Popover open={isOpen} onOpenChange={async (open) => {
            setIsOpen(open);
            if (open) {
                setShouldAnimate(false);
                if (unreadCount > 0) {
                    setUnreadCount(0);
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                    await markAllNotificationsAsRead().catch(e => console.error(e));
                }
            }
        }}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    {/* Bell Icon with Shake Animation on Unread */}
                    <div className={`${shouldAnimate ? "animate-bounce" : ""}`}>
                        <Bell className={`h-5 w-5 ${unreadCount > 0 ? "text-primary" : ""}`} />
                    </div>

                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className={`absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px] ${shouldAnimate ? "animate-pulse" : ""}`}
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            {/* ... rest of component ... */}
            <PopoverContent className="w-80 p-0" align="end">
                {/* ... existing header ... */}
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                            {unreadCount} unread
                        </span>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="grid divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 transition-colors hover:bg-muted/50 cursor-pointer ${!notification.isRead ? "bg-primary/5" : ""
                                        }`}
                                    onClick={() => handleMarkAsRead(notification.id, notification.isRead)}
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`text-sm font-medium leading-none ${!notification.isRead ? "text-primary" : ""}`}>
                                                {notification.title}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                                                {formatDistanceToNow(new Date(notification.createdAt), {
                                                    addSuffix: true,
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                            {notification.message}
                                        </p>

                                        {/* Updated Condition for Coupon Display */}
                                        {(notification.type === "REWARD" || notification.type === "WELCOME_REWARD" || notification.type === "FIRST_ORDER_REWARD") && notification.metadata?.couponCode && (
                                            <div className="mt-2 pt-2 border-t flex items-center justify-between bg-muted/30 -mx-2 px-2 rounded-b-sm">
                                                <code className="text-xs font-mono font-bold text-primary">
                                                    {notification.metadata.couponCode}
                                                </code>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2 text-[10px]"
                                                    onClick={(e) => copyToClipboard(notification.metadata.couponCode, e)}
                                                >
                                                    <Copy className="h-3 w-3 mr-1" />
                                                    Copy
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};
