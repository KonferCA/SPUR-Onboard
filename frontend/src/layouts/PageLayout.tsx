import { ReactNode } from 'react';
import { Container } from './Container';
import { Stack } from './Stack';

interface PageLayoutProps {
    children: ReactNode;
    className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
    children,
    className = '',
}) => {
    return (
        <Container width="screen" fullHeight className={className}>
            <Stack gap="none">{children}</Stack>
        </Container>
    );
};
