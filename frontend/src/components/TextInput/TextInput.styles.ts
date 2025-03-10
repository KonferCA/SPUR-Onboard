import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassProp } from 'class-variance-authority/types';

const inputStyles = cva(
    [
        'w-full px-4 py-3',
        'bg-white',
        'outline outline-1 -outline-offset-1 outline-gray-300',
        'rounded-md',
        'focus:outline focus:outline-2 focus:outline-blue-500',
        'data-[invalid]:border-red-500',
    ],
    {
        variants: {
            prefix: {
                true: ['rounded-tl-none rounded-bl-none -ml-px'],
            },
            error: {
                true: ['outline-red-500'],
            },
            disabled: {
                true: ['bg-gray-100 text-gray-400', 'cursor-not-allowed'],
            },
        },
        compoundVariants: [
            {
                error: true,
                disabled: true,
                className: 'outline-red-300',
            },
        ],
    }
);

type InputStylesVariants = VariantProps<typeof inputStyles>;
type InputStylesProps = InputStylesVariants & ClassProp;

export function getInputStyles(props?: InputStylesProps) {
    return inputStyles(props);
}

const prefixStyles = cva(
    [
        'flex shrink-0 items-center',
        'rounded-l-md bg-white px-3',
        'text-base text-gray-500',
        'outline outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6',
    ],
    {
        variants: {},
    }
);

type PrefixStylesVariants = VariantProps<typeof prefixStyles>;
type PrefixStylesProps = PrefixStylesVariants & ClassProp;

export function getPrefixStyles(props?: PrefixStylesProps) {
    return prefixStyles(props);
}

const descriptionStyles = cva('mt-1 text-sm text-gray-500', {
    variants: {
        error: {
            true: 'text-red-500',
        },
    },
});

type DescriptionStylesVariants = VariantProps<typeof descriptionStyles>;
type DescriptionStylesProps = DescriptionStylesVariants & ClassProp;

export function getDescriptionStyles(props?: DescriptionStylesProps) {
    return descriptionStyles(props);
}
