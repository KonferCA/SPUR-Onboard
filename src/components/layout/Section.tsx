import { ReactNode } from 'react';

type SectionWidth = 'full' | 'wide' | 'normal' | 'narrow';
type SectionPadding = 'none' | 'small' | 'normal' | 'large';
type SectionAlignment = 'left' | 'center' | 'right';

interface SectionProps {
  children: ReactNode;
  width?: SectionWidth;
  padding?: SectionPadding;
  align?: SectionAlignment;
  className?: string;
  background?: string;
  container?: boolean; // new prop to control container width
}

// predefined width classes
const widthClasses: Record<SectionWidth, string> = {
  full: 'w-full',
  wide: 'max-w-7xl',
  normal: 'max-w-5xl',
  narrow: 'max-w-3xl'
};

// predefined padding classes
const paddingClasses: Record<SectionPadding, string> = {
  none: 'p-0',
  small: 'py-4 px-4',
  normal: 'py-8 px-6',
  large: 'py-16 px-8'
};

const Section: React.FC<SectionProps> = ({
  children,
  width = 'normal',
  padding = 'normal',
  align = 'center',
  className = '',
  background = 'bg-white',
  container = true // default to using container
}) => {
  const content = container ? (
    <div className={`
      ${widthClasses[width]}
      ${align === 'center' ? 'mx-auto' : ''}
      ${className}
    `}>
      {children}
    </div>
  ) : children;

  return (
    <section className={`
      ${background} 
      ${paddingClasses[padding]}
      w-full
    `}>
      {content}
    </section>
  );
};

export { Section };