import type React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiChevronUp } from 'react-icons/bi';

export interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
}

export const CollapsibleSection = ({
    title,
    children,
}: CollapsibleSectionProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleClick = () => {
        const newValue = !isCollapsed;

        setIsCollapsed(newValue);
    };

    return (
        <div className="w-full">
            <div>
                <div
                    className="flex items-center justify-between mb-2 cursor-pointer group"
                    onClick={handleClick}
                >
                    <h1 className="font-bold text-xl align-left">{title}</h1>

                    <motion.div
                        className="text-gray-500 group-hover:text-gray-700"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: isCollapsed ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <BiChevronUp size={24} />
                    </motion.div>
                </div>

                <div className="my-4 bg-gray-400 w-full h-[2px]" />
            </div>

            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                            duration: 0.3,
                            ease: 'easeInOut',
                            opacity: { duration: 0.2 },
                        }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
