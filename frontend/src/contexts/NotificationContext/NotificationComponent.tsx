// NotificationComponent.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Notification } from './types';
import { TbConfetti } from 'react-icons/tb';
import { TbBellExclamation } from 'react-icons/tb';
import { TbAlertTriangle } from 'react-icons/tb';
import { cva } from 'class-variance-authority';

type Props = {
    notification: Notification;
    onRemove: (id: string) => void;
};

const iconStyles = cva('text-lg', {
    variants: {
        level: {
            error: ['text-red-400'],
            info: ['text-sky-400'],
            success: ['text-green-400'],
            undefined: ['text-green-400'],
        },
    },
});

export const NotificationComponent: React.FC<Props> = ({
    notification,
    onRemove,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const timeoutIdRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const remainingTimeRef = useRef<number>(notification.duration || 5000);

    // Handle auto-closing
    useEffect(() => {
        if (!notification.autoClose) return () => {};

        if (isHovered) {
            if (timeoutIdRef.current !== null) {
                clearTimeout(timeoutIdRef.current);
                timeoutIdRef.current = null;
            }
            remainingTimeRef.current = Date.now() - startTimeRef.current;
        } else {
            startTimeRef.current = Date.now();
            timeoutIdRef.current = window.setTimeout(() => {
                onRemove(notification.id);
            }, remainingTimeRef.current); // Default duration: 5 seconds
        }

        return () => {
            if (timeoutIdRef.current !== null)
                clearTimeout(timeoutIdRef.current);
        };
    }, [notification, isHovered, onRemove]);

    let icon = <TbConfetti />;
    switch (notification.level) {
        case 'error':
            icon = <TbAlertTriangle />;
            break;
        case 'info':
            icon = <TbBellExclamation />;
    }

    return (
        <div
            className="p-3 bg-gray-800 text-sm text-gray-100 rounded-2xl shadow-sm relative flex gap-2 items-center min-w-[200px] max-w-full md:max-w-2xl lg:max-w-3xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span className={iconStyles({ level: notification.level })}>
                {icon}
            </span>
            <span>{notification.message}</span>
        </div>
    );
};
