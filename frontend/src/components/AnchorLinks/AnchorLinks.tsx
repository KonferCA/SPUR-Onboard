import type React from 'react';
import {
    type FC,
    type ReactNode,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { ScrollLink } from '@components';
import { isAtEndOfPage, isElementInView } from '@utils';
import clsx from 'clsx';
import { getRootListStyles } from './AnchorLinks.styles';

export interface AnchorLinkItem {
    label: string;
    // provide the id of the target, or a query selector
    target: string;
    offset?: number;
    offsetType?: 'after' | 'before' | 'default';
}

export type ControlledLink = AnchorLinkItem & {
    el: HTMLElement | null;
    isInView: boolean;
    active: boolean;
    index: number;
};

export interface AnchorLinksProps {
    links: AnchorLinkItem[];
    /*
     * Optionally pass a function as children to have control over how each link
     * should look. This also allows the usage of stateful components as children
     * that are controlled by the page using the AnchorLinks component.
     */
    children?: (link: ControlledLink, idx: number) => ReactNode;
    /*
     * onClick handler for when a link item is clicked. Pass this if additional operations
     * are desired on top of scrolling to the target.
     */
    onClick?:
    | ((
        link: ControlledLink,
        event:
            | React.MouseEvent<HTMLLIElement, MouseEvent>
            | React.KeyboardEvent<HTMLLIElement>
    ) => void)
    | ((
        link: ControlledLink,
        event:
            | React.MouseEvent<HTMLLIElement, MouseEvent>
            | React.KeyboardEvent<HTMLLIElement>
    ) => Promise<void>);
    /*
     * Sets the scrolling to manual. Use the onClick prop to handle.
     */
    manualScroll?: boolean;
    /*
     * Sets the gap in the y-axis between links.
     */
    yGap?: 'sm' | 'md' | 'lg' | 'default';
}

const AnchorLinks: FC<AnchorLinksProps> = ({
    links,
    manualScroll,
    yGap = 'default',
    children,
    onClick,
}) => {
    const [controlledLinks, setControlledLinks] = useState<ControlledLink[]>(
        []
    );

    // separate the props links with a state controlled links
    // able to trigger ui render when link's target is in view
    useEffect(() => {
        const controlled: ControlledLink[] = links.map((link, index) => {
            const el = document.querySelector<HTMLElement>(link.target);
            const isInView = isElementInView(el);

            return {
                ...link,
                el,
                isInView,
                index,
                active: false,
            };
        });

        // filter in view elements
        const visibleLinks: ControlledLink[] = controlled.filter(
            (link) => link.isInView
        );

        // find closest to top
        if (visibleLinks.length) {
            const closest: ControlledLink = visibleLinks.reduce(
                (closest, current) => {
                    if (!closest.el || !current.el) return current;
                    const closestDistance = Math.abs(
                        closest.el.getBoundingClientRect().top
                    );
                    const currentDistance = Math.abs(
                        current.el.getBoundingClientRect().top
                    );
                    return currentDistance < closestDistance
                        ? current
                        : closest;
                }
            );

            // set the closest index active
            controlled[closest.index].active = true;
        }

        setControlledLinks(controlled);
    }, [links]);

    useEffect(() => {
        const handler = () => {
            setControlledLinks((currentLinks) => {
                // update links in view field
                const newLinks: ControlledLink[] = currentLinks.map((link) => {
                    return {
                        ...link,
                        active: false,
                        isInView: isElementInView(link.el),
                    };
                });
                const visibleLinks: ControlledLink[] = newLinks.filter(
                    (link) => link.isInView
                );

                // find closest to top
                if (visibleLinks.length) {
                    if (isAtEndOfPage()) {
                        // set the last visible section to active if bottom of page has been reached
                        newLinks[
                            visibleLinks[visibleLinks.length - 1].index
                        ].active = true;
                    } else {
                        // get the visible section closest to the top of page
                        const closest: ControlledLink = visibleLinks.reduce(
                            (closest, current) => {
                                if (!closest.el || !current.el) return current;
                                const closestDistance = Math.abs(
                                    closest.el.getBoundingClientRect().top
                                );
                                const currentDistance = Math.abs(
                                    current.el.getBoundingClientRect().top
                                );
                                return currentDistance < closestDistance
                                    ? current
                                    : closest;
                            }
                        );

                        // set the closest index active
                        newLinks[closest.index].active = true;
                    }
                }

                return newLinks;
            });
        };

        window.addEventListener('scroll', handler);

        return () => {
            window.removeEventListener('scroll', handler);
        };
    }, []);

    const handleClick = useCallback(
        (link: ControlledLink) => {
            return async (
                e:
                    | React.MouseEvent<HTMLLIElement, MouseEvent>
                    | React.KeyboardEvent<HTMLLIElement>
            ) => {
                onClick && (await onClick(link, e));
            };
        },
        [onClick]
    );

    return (
        <ul className={getRootListStyles({ yGap })}>
            {controlledLinks.map((link, idx) => (
                <li
                    key={link.label}
                    onKeyUp={handleClick(link)}
                    onClick={handleClick(link)}
                    className="cursor-pointer"
                >
                    {manualScroll ? (
                        <a>
                            {typeof children === 'function' ? (
                                children(link, idx)
                            ) : (
                                <span
                                    className={clsx(
                                        'flex gap-2 transition hover:text-gray-800 hover:cursor-pointer',
                                        link.active && 'text-black',
                                        !link.active && 'text-gray-400'
                                    )}
                                >
                                    <span>{idx + 1}.</span>
                                    <span>{link.label}</span>
                                </span>
                            )}
                        </a>
                    ) : (
                        <ScrollLink
                            to={link.el ?? link.target}
                            offset={link.offset}
                            offsetType={link.offsetType}
                        >
                            {typeof children === 'function' ? (
                                children(link, idx)
                            ) : (
                                <span
                                    className={clsx(
                                        'flex gap-2 transition hover:text-gray-800 hover:cursor-pointer',
                                        link.active && 'text-black',
                                        !link.active && 'text-gray-400'
                                    )}
                                >
                                    <span>{idx + 1}.</span>
                                    <span>{link.label}</span>
                                </span>
                            )}
                        </ScrollLink>
                    )}
                </li>
            ))}
        </ul>
    );
};

export { AnchorLinks };
