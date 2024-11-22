import { FC, useEffect, useState } from 'react';
import clsx from 'clsx';
import { ScrollLink } from '@components';
import { isElementInView } from '@utils';

export interface AnchorLinkProps {
    active: boolean;
    label: string;
    // provide the id of the target, or a query selector
    target: string;
    offset?: number;
    numbered?: boolean;
    index: number;
}

type AnchorLinkItem = Omit<AnchorLinkProps, 'active' | 'numbered' | 'index'>;

type ControlledLink = AnchorLinkProps & {
    el: Element | null;
    isInView: boolean;
    index: number;
};

export interface AnchorLinksProps {
    links: AnchorLinkItem[];
    numbered?: boolean;
}

const AnchorLinks: FC<AnchorLinksProps> = ({ links, numbered }) => {
    const [controlledLinks, setControlledLinks] = useState<ControlledLink[]>(
        []
    );

    // separate the props links with a state controlled links
    // able to trigger ui render when link's target is in view
    useEffect(() => {
        const controlled: ControlledLink[] = links.map((link, index) => {
            const el = document.querySelector(link.target);
            const isInView = isElementInView(el);

            return {
                ...link,
                numbered,
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
            controlled[closest.index].active = true;
        }

        setControlledLinks(controlled);
    }, [links, numbered]);

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
                    newLinks[closest.index].active = true;
                }

                return newLinks;
            });
        };

        window.addEventListener('scroll', handler);

        return () => {
            window.removeEventListener('scroll', handler);
        };
    }, []);

    return (
        <div className="flex flex-col gap-4">
            {numbered ? (
                <ol>
                    {controlledLinks.map((link) => (
                        <AnchorLink key={link.label} {...link} />
                    ))}
                </ol>
            ) : (
                <ul>
                    {controlledLinks.map((link) => (
                        <AnchorLink key={link.label} {...link} />
                    ))}
                </ul>
            )}
        </div>
    );
};

const AnchorLink: FC<AnchorLinkProps> = ({
    label,
    target,
    offset,
    active,
    numbered,
}) => {
    const classes = clsx('text-gray-400', {
        'list-decimal': numbered,
        'text-gray-900': active,
    });

    return (
        <li className={classes}>
            <ScrollLink to={target} offset={offset}>
                {label}
            </ScrollLink>
        </li>
    );
};

export { AnchorLinks };
