import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

// main container for the entire page
const PageLayout: React.FC<PageLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen w-full flex flex-col ${className}`}>
      {children}
    </div>
  );
};

export { PageLayout }; 