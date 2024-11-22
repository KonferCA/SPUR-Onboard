import { FC, ReactNode, useEffect, useState } from 'react';
import { ScrollLink } from '@components';
import { isElementInView } from '@utils';

export interface AnchorLinkItem {
    label: string;
    // provide the id of the target, or a query selector
    target: string;
    offset?: number;
}

type ControlledLink = AnchorLinkItem & {
    el: Element | null;
    isInView: boolean;
    active: boolean;
    index: number;
};

export interface AnchorLinksProps {
    links: AnchorLinkItem[];
    children: (link: ControlledLink) => ReactNode;
}

const AnchorLinks: FC<AnchorLinksProps> = ({ links, children }) => {
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
            <ul>
                {controlledLinks.map((link) => (
                    <li>
                        <ScrollLink to={link.target} offset={link.offset}>
                            {children(link)}
                        </ScrollLink>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export { AnchorLinks };
