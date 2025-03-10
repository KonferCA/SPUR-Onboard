import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface NotificationBannerProps {
    message: ReactNode;
    variant?: 'info' | 'warning' | 'error';
    position?: 'inline' | 'bottom';
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({
    message,
    variant = 'info',
    position = 'inline',
}) => {
    const variantStyles = {
        info: 'bg-gray-50 border-gray-200 text-gray-600',
        warning: 'bg-gray-50 border-gray-200 text-gray-600',
        error: 'bg-red-50 border-red-200 text-red-600',
    };

    if (position === 'bottom') {
        return (
            <motion.div
                className="absolute bottom-0 left-0 right-0 mx-auto px-4 mb-4 flex justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.3,
                    ease: 'easeOut',
                }}
            >
                <motion.div
                    className={`
            inline-block px-6 py-4 rounded-full border text-center
            ${variantStyles[variant]}
          `}
                    transition={{ duration: 0.2 }}
                >
                    <p className="text-sm">{message}</p>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <div
            className={`w-full border rounded-lg p-4 ${variantStyles[variant]}`}
        >
            <p className="text-sm text-center">{message}</p>
        </div>
    );
};

export { NotificationBanner };
