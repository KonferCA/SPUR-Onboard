import { FC } from 'react';
import { LayoutProps } from './types';
import { AnchorLinkItem, AnchorLinks } from '@/components';

export interface SectionedLayoutProps extends LayoutProps {
    /*
     * asideTitle is the bolded title that goes before the links on the side
     */
    asideTitle: string;
    /*
     * links is an array of AnchorLinkItem which are passed to the component AnchorLinks
     */
    links: AnchorLinkItem[];
}

/*
 * SectionedLayout is composed of a aside sticky links and a centered main content section.
 * The links are displayed using a
 */
const SectionedLayout: FC<SectionedLayoutProps> = ({
    children,
    links,
    asideTitle,
}) => {
    return (
        <div>
            <nav
                data-testid="sectioned-layout-aside"
                className="fixed bottom-0 left-0 top-14 px-6 w-64"
            >
                <h1 className="text-lg font-bold mb-2">{asideTitle}</h1>
                <AnchorLinks links={links} />
            </nav>
            <div data-testid="sectione-layout-main" className="pt-14 px-64">
                {children}
            </div>
        </div>
    );
};

export { SectionedLayout };
