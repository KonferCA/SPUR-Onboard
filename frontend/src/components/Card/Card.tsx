import { FC, ReactNode } from 'react';

export interface CardProps {
    children?: ReactNode;
}

export const Card: FC<CardProps> = ({ children }) => {
    return <div className="rounded-md shadow-md p-4">{children}</div>;
};
