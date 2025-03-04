import { FC, useEffect, useState } from 'react';
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer';
import { IoMdAlert } from 'react-icons/io';
import { BiChevronDown } from 'react-icons/bi';
import { motion } from 'framer-motion';
import type { SectionDrawerProps } from './SectionDrawer.types';
import { AnchorLinks, ControlledLink } from '@components';
import { isElementInView, scrollToWithOffset } from '@/utils';
import clsx from 'clsx';

export const SectionDrawer: FC<SectionDrawerProps> = ({
    activeSection,
    subSectionLinks,
    validationErrors,
}) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [sectionListOpen, _] = useState(false);
    const [activeSubSection, setActiveSubSection] = useState('');

    const handleLinkClick = (link: ControlledLink) => {
        setDrawerOpen(false);

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
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
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
                        {validationErrors.length > 0 && (
                            <p className="text-lg text-red-500 font-bold flex items-center gap-2 mb-2">
                                <IoMdAlert className="w-6 h-6" />
                                <span>Oops! You're missing information</span>
                            </p>
                        )}
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
            <DrawerContent className="md:max-w-3xl md:mx-auto max-h-[80%] lg:max-h-[60%]">
                <div className="overflow-y-auto">
                    <DrawerHeader className="">
                        {validationErrors.length > 0 && (
                            <p className="text-lg text-red-500 font-bold flex items-center gap-2 mb-2">
                                <IoMdAlert className="w-6 h-6" />
                                <span>Oops! You're missing information</span>
                            </p>
                        )}
                        <div className="relative flex items-center justify-between">
                            <button
                                type="button"
                                className="absolute inset-0 left-0 right-0 h-full w-full"
                            >
                                <span className="sr-only">
                                    open list of sections
                                </span>
                            </button>
                            <div className="flex items-center gap-1">
                                <DrawerTitle className="text-xl font-semibold text-left">
                                    {activeSection}
                                </DrawerTitle>
                            </div>
                            <DrawerDescription className="text-custom-blue-200">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        rotate: sectionListOpen ? 180 : 360,
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <BiChevronDown className="w-6 h-6" />
                                </motion.div>
                            </DrawerDescription>
                        </div>
                    </DrawerHeader>
                    <div className="p-4 pt-0 pb-6 overflow-y-auto">
                        <AnchorLinks
                            manualScroll
                            links={subSectionLinks}
                            onClick={handleLinkClick}
                        >
                            {(link: ControlledLink, idx: number) => (
                                <span
                                    className={clsx(
                                        'flex gap-2 transition',
                                        link.active && 'text-black',
                                        !link.active && 'text-gray-300'
                                    )}
                                >
                                    <span>{idx + 1}.</span>
                                    <span>{link.label}</span>
                                </span>
                            )}
                        </AnchorLinks>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
