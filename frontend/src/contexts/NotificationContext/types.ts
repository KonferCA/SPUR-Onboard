export type Notification = {
    id: string;
    message: string;
    level?: 'success' | 'error' | 'info';
    duration?: number; // in ms
    autoClose?: boolean; // default: true
};

export type NotificationInput = Omit<Notification, 'id'>;
