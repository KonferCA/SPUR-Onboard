import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Sidebar } from './Sidebar';
import { isAdmin, isInvestor } from '@/utils/permissions';

// mock the react-router hooks
vi.mock('@tanstack/react-router', () => ({
    useLocation: () => ({ pathname: '/user/dashboard' }),
    useNavigate: () => vi.fn(),
    Link: ({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) => (
        <a 
            href={to} 
            className={className} 
            data-testid={`link-${to}`}
        >
            {children}
        </a>
    )
}));

// mock permissions utils
vi.mock('@/utils/permissions', () => ({
    isAdmin: vi.fn(),
    isInvestor: vi.fn()
}));

describe('Sidebar', () => {
    const mockOnLogout = vi.fn();

    const mockUser = {
        id: '123',
        firstName: 'Naush',
        lastName: 'Rao',
        email: 'test@mail.com',
        emailVerified: true,
        permissions: 0
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockOnLogout.mockReset();

        // default mock implementations
        vi.mocked(isAdmin).mockReturnValue(false);
        vi.mocked(isInvestor).mockReturnValue(false);
    });

    describe('Basic rendering', () => {
        it('renders basic user menu items', () => {
            render(
                <Sidebar 
                    userPermissions={0} 
                />
            );
            
            // check for basic user menu items
            expect(screen.getByText('My Projects')).toBeInTheDocument();
            expect(screen.getByText('Browse Projects')).toBeInTheDocument();
            expect(screen.getByText('Resources')).toBeInTheDocument();
        });

        it('renders common items', () => {
            render(
                <Sidebar 
                    userPermissions={0} 
                />
            );
            
            // check for common menu items
            expect(screen.getByText('Settings')).toBeInTheDocument();
            expect(screen.getByText('Support')).toBeInTheDocument();
        });

        it('renders section titles', () => {
            render(
                <Sidebar 
                    userPermissions={0}
                />
            );
            
            // check for section title
            expect(screen.getByText('MAIN')).toBeInTheDocument();
        });
    });

    describe('Permission-based rendering', () => {
        it('renders investor items when user has investor permissions', () => {
            vi.mocked(isInvestor).mockReturnValue(true);
            
            render(
                <Sidebar 
                    userPermissions={1}
                />
            );
            
            // check for investor menu items
            expect(screen.getByText('INVESTOR')).toBeInTheDocument();
            expect(screen.getByText('My Investments')).toBeInTheDocument();
            expect(screen.getByText('Statistics')).toBeInTheDocument();
        });

        it('renders admin items when user has admin permissions', () => {
            vi.mocked(isAdmin).mockReturnValue(true);
            
            render(
                <Sidebar 
                    userPermissions={2}
                />
            );
            
            // check for admin menu items
            expect(screen.getByText('ADMIN')).toBeInTheDocument();
            expect(screen.getByText('Manage Permissions')).toBeInTheDocument();
        });

        it('renders both investor and admin items when user has both permissions', () => {
            vi.mocked(isInvestor).mockReturnValue(true);
            vi.mocked(isAdmin).mockReturnValue(true);
            
            render(
                <Sidebar 
                    userPermissions={3} 
                />
            );
            
            // check for both investor and admin sections
            expect(screen.getByText('INVESTOR')).toBeInTheDocument();
            expect(screen.getByText('ADMIN')).toBeInTheDocument();
        });
    });

    describe('Mobile view', () => {
        it('displays all items in mobile view', () => {
            render(
                <Sidebar 
                    userPermissions={0} 
                    isMobile={true} 
                />
            );
            
            // check that mobile sections are properly shown
            expect(screen.getByText('MAIN')).toBeInTheDocument();
        });

        it('applies correct mobile styles', () => {
            render(
                <Sidebar 
                    userPermissions={0} 
                    isMobile={true} 
                />
            );
            
            // check for mobile-specific classes
            const sidebarElement = screen.getByText('My Projects').closest('a');
            expect(sidebarElement).toHaveClass('py-3', 'px-6', 'mx-2');
        });
    });

    describe('Desktop view', () => {
        it('applies correct desktop styles', () => {
            render(
                <Sidebar 
                    userPermissions={0} 
                    isMobile={false} 
                />
            );
            
            // check for desktop-specific classes
            const sidebarElement = screen.getByText('My Projects').closest('a');
            expect(sidebarElement).toHaveClass('py-3', 'px-4', 'mx-4');
        });
    });

    describe('User profile section', () => {
        it('renders user information when user is provided', () => {
            render(
                <Sidebar 
                    userPermissions={0} 
                    user={mockUser} 
                />
            );
            
            // check for user profile information
            expect(screen.getByText('Naush Rao')).toBeInTheDocument();
            expect(screen.getByText('test@mail.com')).toBeInTheDocument();
            expect(screen.getByText('N')).toBeInTheDocument();
        });

        it('does not render user information when user is not provided', () => {
            render(
                <Sidebar 
                    userPermissions={0} 
                />
            );
            
            // ensure user profile section is not rendered
            expect(screen.queryByText('Naush Rao')).not.toBeInTheDocument();
        });
    });

    describe('Logout functionality', () => {
        beforeEach(() => {
            // mock window.confirm - will update if and when we add the modal component (if necessary)
            vi.spyOn(window, 'confirm').mockReturnValue(true);
        });

        it('calls onLogout function when logout button is clicked and confirmed', () => {
            render(
                <Sidebar 
                    userPermissions={0} 
                    user={mockUser} 
                    onLogout={mockOnLogout} 
                />
            );
            
            // find and click the logout button
            const logoutButton = screen.getByRole('button');
            fireEvent.click(logoutButton);
            
            // check if onLogout was called
            expect(mockOnLogout).toHaveBeenCalledTimes(1);
        });

        it('does not call onLogout when logout is canceled', () => {
            // mock confirm to return false (cancel)
            vi.spyOn(window, 'confirm').mockReturnValue(false);
            
            render(
                <Sidebar 
                    userPermissions={0} 
                    user={mockUser} 
                    onLogout={mockOnLogout} 
                />
            );
            
            // find and click the logout button
            const logoutButton = screen.getByRole('button');
            fireEvent.click(logoutButton);
            
            // check that onLogout was not called
            expect(mockOnLogout).not.toHaveBeenCalled();
        });
    });
});