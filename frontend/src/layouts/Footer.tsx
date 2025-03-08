import type { ReactNode } from 'react';
import { Container } from './Container';
import { Stack } from './Stack';

interface FooterProps {
    children: ReactNode;
    className?: string;
}

const Footer: React.FC<FooterProps> = ({ children, className = '' }) => {
    return (
        <Container
            width="full"
            className={`flex-shrink-0 border-t border-gray-200 ${className}`}
        >
            <div className="max-w-[1440px] mx-auto px-6 py-4">
                <Stack gap="md">{children}</Stack>
            </div>
        </Container>
    );
};

export { Footer };
