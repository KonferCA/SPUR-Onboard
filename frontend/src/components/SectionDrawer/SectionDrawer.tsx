import { FC, useEffect, useState } from 'react';
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer';
import type { SectionDrawerProps } from './SectionDrawer.types';
import { AnchorLinks, ControlledLink } from '../AnchorLinks';
import { isElementInView, scrollToWithOffset } from '@/utils';

export const SectionDrawer: FC<SectionDrawerProps> = ({
    activeSection,
    subSectionLinks,
}) => {
    const [open, setOpen] = useState(false);
    const [activeSubSection, setActiveSubSection] = useState('');

    const handleLinkClick = (link: ControlledLink) => {
        setOpen(false);

        if (link.el) {
            setTimeout(() => {
                scrollToWithOffset(
                    link.el as HTMLElement,
                    link.offset,
                    link.offsetType
                );
            }, 500);
        }
    };

    useEffect(() => {
        const handler = () => {
            const controlled: ControlledLink[] = subSectionLinks.map(
                (link, index) => {
                    const el = document.querySelector<HTMLElement>(link.target);
                    const isInView = isElementInView(el);

                    return {
                        ...link,
                        el,
                        isInView,
                        index,
                        active: false,
                    };
                }
            );

            // filter in view elements
            const visibleLinks: ControlledLink[] = controlled.filter(
                (link) => link.isInView
            );

            // find closest to top
            if (visibleLinks.length) {
                const closest: ControlledLink = visibleLinks.reduce(
                    (closest, current) => {
                        const closestDistance = Math.abs(
                            closest.el!.getBoundingClientRect().top
                        );
                        const currentDistance = Math.abs(
                            current.el!.getBoundingClientRect().top
                        );
                        return currentDistance < closestDistance
                            ? current
                            : closest;
                    }
                );

                // set the closest index active
                setActiveSubSection(
                    `${closest.index + 1}. ${controlled[closest.index].label}`
                );
            }
        };

        // init
        handler();

        window.addEventListener('scroll', handler);

        return () => {
            window.removeEventListener('scroll', handler);
        };
    }, [subSectionLinks]);

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <div className="fixed bottom-0 inset-x-0 md:max-w-3xl md:mx-auto p-6 rounded-tl-2xl rounded-tr-2xl bg-white outline outline-1 outline-gray-300 shadow-2xl">
                    <button
                        aria-description="Open drawer for sub section links"
                        type="button"
                        className="absolute inset-0 rounded-tr-2xl rounded-tl-2xl"
                    >
                        <span className="sr-only">open drawer</span>
                    </button>
                    <div className="max-w-3xl mx-auto">
                        <div className="flex justify-between">
                            <h1 className="text-xl font-semibold">
                                {activeSection}
                            </h1>
                            <p className="text-custom-blue-200">Go to...</p>
                        </div>
                        <div>
                            <p>{activeSubSection}</p>
                        </div>
                    </div>
                </div>
            </DrawerTrigger>
            <DrawerContent className="md:max-w-3xl md:mx-auto">
                <div>
                    <DrawerHeader>
                        <DrawerTitle className="text-left">
                            {activeSection}
                        </DrawerTitle>
                        <DrawerDescription className="sr-only">
                            Go to...
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 pt-0 pb-6 max-h-[80%] overflow-y-auto">
                        <AnchorLinks
                            yGap="md"
                            manualScroll
                            links={subSectionLinks}
                            onClick={handleLinkClick}
                        />
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
