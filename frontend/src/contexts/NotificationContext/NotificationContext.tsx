// NotificationContext.tsx
import type React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import type { Notification, NotificationInput } from './types';
import { NotificationComponent } from './NotificationComponent';

type NotificationContextType = {
    notifications: Notification[];
    push: (notification: NotificationInput) => string;
    remove: (id: string) => void;
    update: (id: string, updates: Partial<NotificationInput>) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Add a new notification
    const push = useCallback((notification: NotificationInput): string => {
        const id = Math.random().toString(36).substring(2, 9); // Generate a unique ID
        const newNotification = {
            ...notification,
            id,
            autoClose: notification.autoClose ?? true,
        };
        setNotifications((prev) => [...prev, newNotification]);
        return id;
    }, []);

    // Remove a notification by ID
    const remove = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    // Update a notification by ID
    const update = useCallback(
        (id: string, updates: Partial<NotificationInput>) => {
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
            );
        },
        []
    );

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                push,
                remove,
                update,
            }}
        >
            {children}
            {/* Render notifications in a fixed container */}
            <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3">
                {notifications.map((notification) => (
                    <NotificationComponent
                        key={notification.id}
                        notification={notification}
                        onRemove={remove}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

// Custom hook to use the notification context
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            'useNotification must be used within a NotificationProvider'
        );
    }
    return context;
};
