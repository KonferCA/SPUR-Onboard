import { LayoutContainerProps } from './types';
import { widths } from './utils';

export const Container: React.FC<LayoutContainerProps> = ({
  children,
  width = 'normal',
  background = 'bg-white',
  fullHeight = false,
  className = '',
  id,
  testId,
}) => {
  return (
    <div
      id={id}
      data-testid={testId}
      className={`
        ${widths[width]}
        ${background}
        ${fullHeight ? 'min-h-screen' : ''}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
};
