import { cva } from 'class-variance-authority';
import type { FC } from 'react';

export interface BadgeProps {
    text: string;
    variant?: 'info' | 'warning' | 'error' | 'default';
    capitalizeText?: boolean;
}

const badgeStyles = cva(
    'rounded-full border border-gray-300 px-2 py-1 min-w-20 flex items-center justify-center',
    {
        variants: {
            variant: {
                default: '',
                info: '',
                warning: 'text-yellow-700 bg-yellow-200 border-yellow-200',
                error: '',
            },
        },
    }
);

export const Badge: FC<BadgeProps> = ({ text, variant, capitalizeText }) => {
    return (
        <div className={badgeStyles({ variant })}>
            <span className={capitalizeText ? 'capitalize' : ''}>{text}</span>
        </div>
    );
};
