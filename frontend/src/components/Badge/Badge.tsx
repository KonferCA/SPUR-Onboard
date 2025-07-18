import { cva } from 'class-variance-authority';
import type { FC, ReactNode } from 'react';

export interface BadgeProps {
    text: string;
    variant?:
        | 'info'
        | 'warning'
        | 'error'
        | 'default'
        | 'success'
        | 'withdrawn';
    capitalizeText?: boolean;
    icon?: ReactNode;
}

const badgeStyles = cva(
    'rounded-full px-3 py-1.5 text-sm font-medium flex items-center gap-1.5',
    {
        variants: {
            variant: {
                default: 'bg-gray-100 text-gray-800 border border-gray-200',
                info: '',
                warning: 'bg-yellow-100 text-amber-700 border border-amber-200',
                error: 'bg-red-100 text-red-800 border border-red-200',
                success: 'bg-green-100 text-green-800 border border-green-200',
                withdrawn:
                    'bg-slate-100 text-slate-800 border border-slate-200',
            },
        },
    }
);

export const Badge: FC<BadgeProps> = ({
    text,
    variant,
    capitalizeText,
    icon,
}) => {
    return (
        <div className={badgeStyles({ variant })}>
            {icon}
            <span className={capitalizeText ? 'capitalize' : ''}>{text}</span>
        </div>
    );
};
