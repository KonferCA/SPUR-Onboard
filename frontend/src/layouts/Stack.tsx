import type {
    BaseLayoutProps,
    LayoutSpacingProps,
    LayoutAlignmentProps,
} from './types';
import { getSpacingClasses, gaps } from './utils';

interface StackProps
    extends BaseLayoutProps,
        LayoutSpacingProps,
        LayoutAlignmentProps {}

export const Stack: React.FC<StackProps> = ({
    children,
    direction = 'column',
    align = 'left',
    justify = 'start',
    gap = 'md',
    padding,
    margin,
    className = '',
    id,
    testId,
}) => {
    const paddingClasses = getSpacingClasses('p', padding);
    const marginClasses = getSpacingClasses('m', margin);

    return (
        <div
            id={id}
            data-testid={testId}
            className={`
        flex
        ${direction === 'column' ? 'flex-col' : 'flex-row'}
        ${gaps[gap]}
        ${align === 'center' ? 'items-center' : align === 'right' ? 'items-end' : 'items-start'}
        ${
            justify === 'center'
                ? 'justify-center'
                : justify === 'end'
                  ? 'justify-end'
                  : justify === 'between'
                    ? 'justify-between'
                    : justify === 'around'
                      ? 'justify-around'
                      : 'justify-start'
        }
        ${paddingClasses}
        ${marginClasses}
        ${className}
      `.trim()}
        >
            {children}
        </div>
    );
};
