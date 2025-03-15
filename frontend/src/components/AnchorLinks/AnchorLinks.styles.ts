import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassProp } from 'class-variance-authority/types';

const rootListStyles = cva('flex flex-col', {
    variants: {
        yGap: {
            lg: 'gap-6',
            md: 'gap-4',
            sm: 'gap-2',
            default: 'gap-2',
        },
    },
});

export type RootListStylesVariant = VariantProps<typeof rootListStyles> &
    ClassProp;

export function getRootListStyles(opts?: RootListStylesVariant) {
    return rootListStyles(opts);
}
