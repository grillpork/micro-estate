/**
 * Notifications Store
 * Manages notification state with WebSocket integration
 */
import { create } from "zustand";
import type { Notification } from "./notifications.service";
import notificationsService from "./notifications.service";

interface NotificationsState {
    // Data
    notifications: Notification[];
    unreadCount: number;
    hasMore: boolean;

    // UI State
    isLoading: boolean;
    isOpen: boolean;
    hasFetched: boolean;

    // Actions
    setUnreadCount: (count: number) => void;
    incrementUnreadCount: () => void;
    decrementUnreadCount: () => void;
    setNotifications: (notifications: Notification[]) => void;
    addNotification: (notification: Notification) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;

    // UI Actions
    setIsOpen: (isOpen: boolean) => void;
    setIsLoading: (isLoading: boolean) => void;

    // Fetch Actions
    fetchNotifications: () => Promise<void>;
    fetchUnreadCount: () => Promise<void>;

    // Reset
    reset: () => void;
}

const initialState = {
    notifications: [],
    unreadCount: 0,
    hasMore: false,
    isLoading: false,
    isOpen: false,
    hasFetched: false,
};

export const useNotificationStore = create<NotificationsState>((set, get) => ({
    ...initialState,

    setUnreadCount: (count) => set({ unreadCount: count }),

    incrementUnreadCount: () =>
        set((state) => ({ unreadCount: state.unreadCount + 1 })),

    decrementUnreadCount: () =>
        set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

    setNotifications: (notifications) => set({ notifications, hasFetched: true }),

    addNotification: (notification) =>
        set((state) => {
            // Check if notification already exists
            const exists = state.notifications.some((n) => n.id === notification.id);
            if (exists) return state;

            return {
                notifications: [notification, ...state.notifications],
                unreadCount: state.unreadCount + 1,
            };
        }),

    markAsRead: (id) =>
        set((state) => {
            const notification = state.notifications.find((n) => n.id === id);
            if (!notification || notification.isRead) return state;

            return {
                notifications: state.notifications.map((n) =>
                    n.id === id ? { ...n, isRead: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            };
        }),

    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
            unreadCount: 0,
        })),

    removeNotification: (id) =>
        set((state) => {
            const notification = state.notifications.find((n) => n.id === id);
            const wasUnread = notification && !notification.isRead;

            return {
                notifications: state.notifications.filter((n) => n.id !== id),
                unreadCount: wasUnread
                    ? Math.max(0, state.unreadCount - 1)
                    : state.unreadCount,
            };
        }),

    setIsOpen: (isOpen) => set({ isOpen }),

    setIsLoading: (isLoading) => set({ isLoading }),

    fetchNotifications: async () => {
        const { isLoading } = get();
        if (isLoading) return;

        set({ isLoading: true });
        try {
            const data = await notificationsService.getAll(10);
            set({
                notifications: data.notifications,
                hasMore: data.hasMore,
                hasFetched: true,
            });
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchUnreadCount: async () => {
        try {
            const count = await notificationsService.getUnreadCount();
            set({ unreadCount: count });
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        }
    },

    reset: () => set(initialState),
}));
