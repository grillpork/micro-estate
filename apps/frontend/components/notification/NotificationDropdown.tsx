"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Heart,
  MessageSquare,
  Building2,
  Check,
  CheckCheck,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  notificationsService,
  type Notification,
<<<<<<< HEAD
} from "@/stores/features/notifications/notifications.service";
import { useNotificationStore } from "@/stores";
=======
} from "@/services/notifications/notifications.service";
>>>>>>> 3f33e72 (feat: Add new UI components, chat features, and services, while updating admin layout, backend user service, and frontend pages.)
import Link from "next/link";
import { useWebSocket } from "@/hooks";
import { useSession } from "@/services";

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  // Use notification store instead of local state
  const {
    notifications,
    unreadCount,
    isLoading,
    isOpen,
    hasFetched,
    setIsOpen,
    fetchNotifications,
    markAsRead: storeMarkAsRead,
    markAllAsRead: storeMarkAllAsRead,
    removeNotification,
  } = useNotificationStore();

  // Fetch notifications when dropdown opens
  const handleToggle = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen && !hasFetched) {
      fetchNotifications();
    }
<<<<<<< HEAD
  }, [isOpen, hasFetched, setIsOpen, fetchNotifications]);
=======
  }, [isLoading]);

  const { data: session } = useSession();

  // WebSocket connection for real-time notifications
  const { connect } = useWebSocket({
    onConnect: () => console.log("Notification WebSocket connected"),
    onMessage: (msg: { type: string; payload: unknown }) => {
      if (msg.type === "notification") {
        const newNotification = msg.payload as Notification;
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    },
  });

  // Connect WebSocket on mount if user is logged in
  useEffect(() => {
    if (session?.user) {
      connect();
    }
  }, [session, connect]);

  // Fetch only once on first mount (not on every render)
  useEffect(() => {
    if (!hasFetched && session?.user) {
      // Delay initial fetch to avoid race conditions with other requests
      const timer = setTimeout(() => {
        Promise.all([
          notificationsService.getAll(10),
          notificationsService.getUnreadCount(),
        ])
          .then(([data, count]) => {
            setNotifications(data.notifications);
            setUnreadCount(count);
            setHasFetched(true);
          })
          .catch((err) =>
            console.error("Failed to fetch initial notifications:", err)
          );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasFetched, session]);
>>>>>>> 3f33e72 (feat: Add new UI components, chat features, and services, while updating admin layout, backend user service, and frontend pages.)

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead([id]);
      storeMarkAsRead(id);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      storeMarkAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsService.delete(id);
      removeNotification(id);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "favorite":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "property":
        return <Building2 className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationLink = (notification: Notification): string | null => {
    const data = notification.data;
    if (!data) return null;

    switch (notification.type) {
      case "favorite":
        return data.propertyId ? `/properties/${data.propertyId}` : null;
      case "message":
        return data.senderId
          ? `/messages?conversation=${data.senderId}`
          : "/messages";
      case "property":
        return data.propertyId ? `/properties/${data.propertyId}` : null;
      default:
        return null;
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={handleToggle}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 h-5 min-w-[20px] p-0 text-[10px] flex items-center justify-center"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 origin-top-right rounded-xl border bg-card shadow-lg"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <h3 className="font-semibold">การแจ้งเตือน</h3>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {unreadCount} ใหม่
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs"
                    >
                      <CheckCheck className="mr-1 h-3 w-3" />
                      อ่านทั้งหมด
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              <ScrollArea className="h-[400px]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="h-10 w-10 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      ยังไม่มีการแจ้งเตือน
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => {
                      const link = getNotificationLink(notification);
                      const Content = (
                        <div
                          className={cn(
                            "flex gap-3 p-4 transition-colors hover:bg-accent/50 cursor-pointer group",
                            !notification.isRead && "bg-primary/5"
                          )}
                          onClick={() => {
                            if (!notification.isRead) {
                              handleMarkAsRead(notification.id);
                            }
                            if (link) setIsOpen(false);
                          }}
                        >
                          {/* Icon */}
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm line-clamp-1",
                                !notification.isRead && "font-medium"
                              )}
                            >
                              {notification.title}
                            </p>
                            {notification.body && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {notification.body}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatRelativeTime(
                                new Date(notification.createdAt)
                              )}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );

                      return link ? (
                        <Link key={notification.id} href={link}>
                          {Content}
                        </Link>
                      ) : (
                        <div key={notification.id}>{Content}</div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t p-2">
                  <Link href="/notifications" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full text-sm">
                      ดูทั้งหมด
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
