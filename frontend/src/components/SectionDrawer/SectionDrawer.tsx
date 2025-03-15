import { type FC, useEffect, useMemo, useState } from 'react';
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer';
import { IoMdAlert } from 'react-icons/io';
import type {
    SectionDrawerLinkItem,
    SectionDrawerProps,
} from './SectionDrawer.types';
import { AnchorLinks, type ControlledLink } from '@components';
import { IoIosAlert, IoIosCheckmarkCircle } from 'react-icons/io';
import { isElementInView, scrollToWithOffset } from '@/utils';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { BiChevronUp } from 'react-icons/bi';
import { cn } from '@/lib/utils';

export const SectionDrawer: FC<SectionDrawerProps> = ({
    activeSection,
    subSectionLinks,
    validationErrors,
    recommendedFields,
    onRequestChangeSection,
}) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeSubSection, setActiveSubSection] = useState('');
    const [isRecommendedFieldsCollapse, setIsRecommendedFieldsCollapse] =
        useState(false);
    const [isSubSectionsCollapse, setIsSubSectionsCollapse] = useState(false);

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

    // biome-ignore lint/correctness/useExhaustiveDependencies: onRequestChangeSection in dependencies causes drawer to always navigate back to first section with error and open.
    useEffect(() => {
        if (validationErrors.length) {
            const firstSectionWithError = validationErrors[0].section;

            const accepted = onRequestChangeSection(firstSectionWithError);
            if (accepted) {
                setTimeout(() => {
                    setIsSubSectionsCollapse(false);
                    setIsRecommendedFieldsCollapse(false);
                    setDrawerOpen(true);
                }, 500);
            }
        }
    }, [validationErrors]);

    const controlledLinks = useMemo(() => {
        const errors = validationErrors.filter(
            (e) => e.section === activeSection
        );
        return subSectionLinks.map((link) => {
            const count = errors.reduce(
                (count, err) =>
                    err.subsection === link.label && err.required
                        ? count + 1
                        : count,
                0
            );
            link.missingRequiredCount = count;
            link.hasErrors = count > 0;
            return link;
        });
    }, [activeSection, validationErrors, subSectionLinks]);

    const controlledRecommendedFields = useMemo(() => {
        const fields = recommendedFields.filter(
            (f) => f.section === activeSection
        );
        return subSectionLinks
            .map((link) => {
                const count = fields.reduce(
                    (count, f) =>
                        f.subsection === link.label ? count + 1 : count,
                    0
                );
                link.optionalCount = count;
                return link;
            })
            .filter((link) => link.optionalCount);
    }, [recommendedFields, activeSection, subSectionLinks]);

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
                            // biome-ignore lint/style/noNonNullAssertion: element is always defined in this case
                            closest.el!.getBoundingClientRect().top
                        );
                        const currentDistance = Math.abs(
                            // biome-ignore lint/style/noNonNullAssertion: element is always defined in this case
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
                        aria-label="Open drawer for sub section links"
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
                    <DrawerHeader className="py-0">
                        {validationErrors.length > 0 && (
                            <p className="text-lg text-red-500 font-bold flex items-center gap-2">
                                <IoMdAlert className="w-6 h-6" />
                                <span>Oops! You're missing information</span>
                            </p>
                        )}
                        <div className="relative flex items-center justify-between py-4">
                            <button
                                type="button"
                                className="absolute inset-0 left-0 right-0 h-full w-full"
                                onClick={() =>
                                    setIsSubSectionsCollapse((prev) => !prev)
                                }
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
                            <DrawerDescription>
                                <span className="sr-only">
                                    Go to sub-section...
                                </span>
                                <motion.span
                                    aria-hidden
                                    className="block"
                                    initial={{ rotate: 0 }}
                                    animate={{
                                        rotate: isSubSectionsCollapse ? 180 : 0,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <BiChevronUp className="w-6 h-6 text-black" />
                                </motion.span>
                            </DrawerDescription>
                        </div>
                    </DrawerHeader>
                    <div
                        className={cn(
                            'px-4 py-0 overflow-y-auto',
                            controlledRecommendedFields.length < 1 && 'pb-4'
                        )}
                    >
                        <motion.div
                            initial={{
                                height: 0,
                                opacity: 0,
                                overflow: 'hidden',
                            }}
                            animate={{
                                height: isSubSectionsCollapse ? 0 : 'auto',
                                opacity: isSubSectionsCollapse ? 0 : 1,
                            }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                                duration: 0.3,
                                ease: 'easeInOut',
                                opacity: { duration: 0.2 },
                            }}
                        >
                            <AnchorLinks
                                manualScroll
                                links={controlledLinks}
                                onClick={handleLinkClick}
                            >
                                {(
                                    link: ControlledLink &
                                        SectionDrawerLinkItem,
                                    idx: number
                                ) => (
                                    <span
                                        className={clsx(
                                            'flex p-2 justify-between gap-2 transition',
                                            (link.active ||
                                                (!link.hasErrors &&
                                                    validationErrors.length >
                                                        0)) &&
                                                'text-black',
                                            !link.active &&
                                                !link.hasErrors &&
                                                validationErrors.length < 1 &&
                                                'text-gray-300',
                                            link.hasErrors &&
                                                'text-red-500 bg-red-100 rounded-lg font-medium'
                                        )}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>{`${idx + 1}. ${link.label}`}</span>
                                            {link.hasErrors && (
                                                <IoIosAlert className="w-6 h-6" />
                                            )}
                                            {!link.hasErrors &&
                                                validationErrors.length > 0 && (
                                                    <IoIosCheckmarkCircle className="w-6 h-6 text-green-500" />
                                                )}
                                        </div>
                                        {link.hasErrors &&
                                            link.missingRequiredCount &&
                                            link.missingRequiredCount > 0 && (
                                                <span className="text-black underline">
                                                    {`${link.missingRequiredCount} ${link.missingRequiredCount > 1 ? 'required fields' : 'required field'}`}
                                                </span>
                                            )}
                                    </span>
                                )}
                            </AnchorLinks>
                        </motion.div>
                    </div>
                    {controlledRecommendedFields.length > 0 && (
                        <div className="p-4 pt-0 pb-6 overflow-y-auto">
                            <button
                                type="button"
                                className="w-full py-4"
                                onClick={() =>
                                    setIsRecommendedFieldsCollapse(
                                        (prev) => !prev
                                    )
                                }
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-left">
                                        Recommended Fields
                                    </h2>
                                    <motion.div
                                        initial={{ rotate: 0 }}
                                        animate={{
                                            rotate: isRecommendedFieldsCollapse
                                                ? 180
                                                : 0,
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <BiChevronUp className="w-6 h-6" />
                                    </motion.div>
                                </div>
                            </button>
                            <motion.div
                                initial={{
                                    height: 0,
                                    opacity: 0,
                                    overflow: 'hidden',
                                }}
                                animate={{
                                    height: isRecommendedFieldsCollapse
                                        ? 0
                                        : 'auto',
                                    opacity: isRecommendedFieldsCollapse
                                        ? 0
                                        : 1,
                                }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                    duration: 0.3,
                                    ease: 'easeInOut',
                                    opacity: { duration: 0.2 },
                                }}
                            >
                                <AnchorLinks
                                    manualScroll
                                    links={controlledRecommendedFields}
                                    onClick={handleLinkClick}
                                >
                                    {(
                                        link: ControlledLink &
                                            SectionDrawerLinkItem
                                    ) => (
                                        <span className="text-black flex justify-between p-2 bg-gray-100 rounded-lg">
                                            <span>{link.label}</span>
                                            <span>
                                                {`${link.optionalCount} optional ${link.optionalCount && link.optionalCount > 0 ? 'fields' : 'field'}`}
                                            </span>
                                        </span>
                                    )}
                                </AnchorLinks>
                            </motion.div>
                        </div>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
};
