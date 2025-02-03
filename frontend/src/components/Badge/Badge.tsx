import { FC } from 'react';

export interface BadgeProps {
    text: string;
}

export const Badge: FC<BadgeProps> = ({ text }) => {
    return (
        <div className="rounded-full border border-gray-300 px-2 py-1 min-w-20 flex items-center justify-center">
            <span>{text}</span>
        </div>
    );
};
