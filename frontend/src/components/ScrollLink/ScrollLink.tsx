import type { FC } from 'react';
import type { ComponentProps } from '@t';
import { scrollTo, scrollToWithOffset } from '@utils';

interface ScrollLinkProps extends ComponentProps {
    to: string | HTMLElement;
    offset?: number;
}

const ScrollLink: FC<ScrollLinkProps> = ({ children, to, offset }) => {
    const onClick: React.MouseEventHandler = (e) => {
        e.preventDefault();
        let target: HTMLElement | null = null;
        // get element
        if (typeof to === 'string') {
            target = document.querySelector(to);
        } else {
            target = to;
        }
        if (target) {
            if (offset !== undefined) {
                scrollToWithOffset(target, offset);
            } else {
                scrollTo(target);
            }
        }
    };

    // biome-ignore lint: have to use a link here instead of a button because it doesn't make sense to be a button
    return <a onClick={onClick}>{children}</a>;
};

export { ScrollLink };
export type { ScrollLinkProps };
