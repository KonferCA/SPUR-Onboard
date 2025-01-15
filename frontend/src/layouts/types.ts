import { ReactNode } from 'react';

export type Spacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type Width =
    | 'full'
    | 'screen'
    | 'wide'
    | 'normal'
    | 'narrow'
    | 'content';
export type Alignment = 'left' | 'center' | 'right';
export type Direction = 'row' | 'column';
export type Gap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface BaseLayoutProps {
    children: ReactNode;
    className?: string;
    id?: string;
    testId?: string;
}

export interface LayoutSpacingProps {
    padding?: Spacing | { x?: Spacing; y?: Spacing };
    margin?: Spacing | { x?: Spacing; y?: Spacing };
    gap?: Gap;
}

export interface LayoutAlignmentProps {
    align?: Alignment;
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    direction?: Direction;
}

export interface LayoutContainerProps extends BaseLayoutProps {
    width?: Width;
    background?: string;
    fullHeight?: boolean;
}

export interface LayoutGridProps extends BaseLayoutProps, LayoutSpacingProps {
    columns?: number | { sm?: number; md?: number; lg?: number };
    rows?: number;
    autoFit?: boolean;
    minChildWidth?: string;
}

export type NavItem = {
    label: string;
    href: string;
};
  
export type SidebarItem = {
    label: string;
    href: string;
    icon?: React.ReactNode;
};
  
export interface DashboardLayoutProps {
    isAdmin?: boolean;
    children: React.ReactNode;
    isVerified?: boolean;
    isAccepted?: boolean;
}