import { ReactNode } from 'react';

type GridColumns = 1 | 2 | 3 | 4 | 6 | 12;
type GridGap = 'none' | 'small' | 'normal' | 'large';

interface GridProps {
    children: ReactNode;
    columns?: GridColumns;
    gap?: GridGap;
    className?: string;
}

const gapClasses: Record<GridGap, string> = {
    none: 'gap-0',
    small: 'gap-2',
    normal: 'gap-4',
    large: 'gap-8',
};

const Grid: React.FC<GridProps> = ({
    children,
    columns = 3,
    gap = 'normal',
    className = '',
}) => {
    return (
        <div
            className={`
      grid
      grid-cols-1
      sm:grid-cols-2
      ${columns > 2 ? `lg:grid-cols-${columns}` : ''}
      ${gapClasses[gap]}
      ${className}
    `}
        >
            {children}
        </div>
    );
};

export { Grid };
