import type { ReactNode } from 'react';

interface HeaderProps {
    children: ReactNode;
    className?: string;
}

const Header: React.FC<HeaderProps> = ({ children, className = '' }) => {
    return (
        <header
            className={`flex-shrink-0 w-full border-b border-gray-200 bg-white ${className}`}
        >
            {children}
        </header>
    );
};

export { Header };
