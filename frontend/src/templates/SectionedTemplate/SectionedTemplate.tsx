import type { FC } from 'react';
import { type AnchorLinkItem, AnchorLinks } from '@/components';
import type { ReactNode } from '@tanstack/react-router';
import { twMerge } from 'tailwind-merge';

export interface SectionedLayoutProps {
    children?: ReactNode;
    /*
     * asideDetails is an area in between the title and the links. This area is for any
     * custom jsx that the page would like to render in that area.
     */
    asideDetails?: ReactNode;
    /*
     * links is an array of AnchorLinkItem which are passed to the component AnchorLinks
     */
    links: AnchorLinkItem[];
    linkContainerClassnames?: string;
}

/*
 * SectionedLayout is composed of a aside sticky links and a centered main content section.
 * The links are displayed using a
 */
export const SectionedLayout: FC<SectionedLayoutProps> = ({
    children,
    links,
    asideDetails = null,
    linkContainerClassnames,
}) => {
    return (
        <div className="relative">
            <nav
                data-testid="sectioned-layout-aside"
                className={twMerge(
                    'fixed bottom-0 left-0 top-12 px-6 w-64',
                    linkContainerClassnames
                )}
            >
                {asideDetails}
                <div className="h-4" />
                {/* TODO: Update anchor links to work better - currently offsets badly */}
                <AnchorLinks links={links} />
            </nav>
            <div data-testid="sectione-layout-main" className="pt-12 px-64">
                {children}
            </div>
        </div>
    );
};
