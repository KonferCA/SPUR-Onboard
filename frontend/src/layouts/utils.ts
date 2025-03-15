import type { Spacing, Width, Gap } from './types';

export const spacing: Record<Spacing, string> = {
    none: '0',
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
};

export const widths: Record<Width, string> = {
    full: 'w-full',
    screen: 'w-screen max-w-[100vw]',
    wide: 'max-w-7xl',
    normal: 'max-w-5xl',
    narrow: 'max-w-3xl',
    content: 'max-w-prose',
};

export const gaps: Record<Gap, string> = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
};

export const getSpacingClasses = (
    type: 'p' | 'm',
    spacing?: Spacing | { x?: Spacing; y?: Spacing }
): string => {
    if (!spacing) return '';

    if (typeof spacing === 'string') {
        return `${type}-${spacing}`;
    }

    const { x, y } = spacing;
    return `${y ? `${type}y-${y}` : ''} ${x ? `${type}x-${x}` : ''}`.trim();
};

export const getResponsiveGridColumns = (
    columns?: number | { sm?: number; md?: number; lg?: number }
): string => {
    if (!columns) return '';

    if (typeof columns === 'number') {
        return `grid-cols-${columns}`;
    }

    const { sm, md, lg } = columns;
    return `${sm ? `sm:grid-cols-${sm}` : ''} ${md ? `md:grid-cols-${md}` : ''} ${
        lg ? `lg:grid-cols-${lg}` : ''
    }`.trim();
};
