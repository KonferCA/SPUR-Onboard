import type { FC, ReactNode } from 'react';

export interface CardProps {
    children?: ReactNode;
}

export const Card: FC<CardProps> = ({ children }) => {
    return (
        <div className="rounded-md border border-gray-300 p-4">{children}</div>
    );
};
