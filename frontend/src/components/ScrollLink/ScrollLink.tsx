import { FC } from 'react';
import type { ComponentProps } from '@t';
import { scrollTo, scrollToWithOffset } from '@utils';

interface ScrollLinkProps extends ComponentProps {
    to: string | HTMLElement;
    offset?: number;
    offsetType?: 'before' | 'after' | 'default';
}

const ScrollLink: FC<ScrollLinkProps> = ({
    children,
    to,
    offset,
    offsetType,
}) => {
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
                scrollToWithOffset(target, offset, offsetType);
            } else {
                scrollTo(target);
            }
        }
    };

    return <a onClick={onClick}>{children}</a>;
};

export { ScrollLink };
export type { ScrollLinkProps };
