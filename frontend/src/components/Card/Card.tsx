import type { FC, ReactNode } from 'react';
import clsx from 'clsx';

export interface CardProps {
    children?: ReactNode;
    className?: string;
}

export const Card: FC<CardProps> = ({ children, className }) => {
    return (
        <div
            className={clsx('rounded-md border border-gray-300 p-4', className)}
        >
            {children}
        </div>
    );
};
