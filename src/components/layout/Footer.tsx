import { ReactNode } from 'react';

interface FooterProps {
  children: ReactNode;
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ children, className = '' }) => {
  return (
    <footer className={`flex-shrink-0 w-full ${className}`}>
      {children}
    </footer>
  );
};

export { Footer }; 