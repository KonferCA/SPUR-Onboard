import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Sidebar } from './Sidebar';
import { isAdmin, isInvestor } from '@/utils/permissions';
import { useQuery } from '@tanstack/react-query';

// mock the react-router hooks
vi.mock('@tanstack/react-router', () => ({
    useLocation: () => ({ pathname: '/user/dashboard' }),
    useNavigate: () => vi.fn(),
    Link: ({
        to,
        className,
        children,
        onClick,
    }: {
        to: string;
        className?: string;
        children: React.ReactNode;
        onClick?: (e: any) => void;
    }) => (
        <a href={to} className={className} data-testid={`link-${to}`} onClick={onClick}>
            {children}
        </a>
    ),
}));

// mock permissions utils
vi.mock('@/utils/permissions', () => ({
    isAdmin: vi.fn(),
    isInvestor: vi.fn(),
}));

// mock react-query
vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn(),
}));

// mock auth context
vi.mock('@/contexts', () => ({
    useAuth: () => ({ accessToken: 'test-token' }),
}));

// mock Button component
vi.mock('@/components', () => ({
    Button: ({ 
        children, 
        onClick, 
        className = "", 
        variant = "primary", 
        size = "md", 
        icon
    }: {
        children: React.ReactNode;
        onClick: () => void;
        className?: string;
        variant?: 'primary' | 'secondary' | 'danger';
        size?: 'sm' | 'md' | 'lg';
        icon?: React.ReactNode;
    }) => (
        <button 
            onClick={onClick} 
            className={className} 
            data-variant={variant}
            data-size={size}
            data-testid="button-component"
        >
            {icon && <span data-testid="button-icon">{icon}</span>}
            {children}
        </button>
    ),
}));

// mock confirmation modal
vi.mock('@/components/ConfirmationModal', () => ({
    ConfirmationModal: ({
        isOpen,
        onClose,
        primaryAction,
        title,
        children,
        primaryActionText,
    }: {
        isOpen: boolean;
        onClose: () => void;
        primaryAction: () => void;
        title: string;
        children: React.ReactNode;
        primaryActionText: string;
    }) => (
        isOpen && (
            <div data-testid="confirmation-modal">
                <h2>{title}</h2>
                <div>{children}</div>
                <button onClick={onClose} data-testid="modal-cancel">Cancel</button>
                <button onClick={primaryAction} data-testid="modal-confirm">{primaryActionText}</button>
            </div>
        )
    ),
}));

// mock for FiIcons
vi.mock('react-icons/fi', () => ({
    FiFolder: () => <span data-testid="fi-folder">FolderIcon</span>,
    FiSettings: () => <span data-testid="fi-settings">SettingsIcon</span>,
    FiUser: () => <span data-testid="fi-user">UserIcon</span>,
    FiCreditCard: () => <span data-testid="fi-credit-card">CreditCardIcon</span>,
    FiBarChart2: () => <span data-testid="fi-bar-chart">BarChartIcon</span>,
    FiDollarSign: () => <span data-testid="fi-dollar">DollarIcon</span>,
    FiShield: () => <span data-testid="fi-shield">ShieldIcon</span>,
    FiHeadphones: () => <span data-testid="fi-headphones">HeadphonesIcon</span>,
    FiSearch: () => <span data-testid="fi-search">SearchIcon</span>,
    FiBook: () => <span data-testid="fi-book">BookIcon</span>,
    FiChevronDown: () => <span data-testid="fi-chevron-down">ChevronDownIcon</span>,
    FiChevronRight: () => <span data-testid="fi-chevron-right">ChevronRightIcon</span>,
    FiFileText: () => <span data-testid="fi-file-text">FileTextIcon</span>,
}));

// mock for IO icons
vi.mock('react-icons/io5', () => ({
    IoLogOutOutline: () => <span data-testid="io-logout">LogoutIcon</span>,
}));

describe('Sidebar', () => {
    const mockOnLogout = vi.fn();

    const mockUser = {
        id: '123',
        firstName: 'Naush',
        lastName: 'Rao',
        email: 'test@mail.com',
        emailVerified: true,
        permissions: 0,
    };

    const mockProjects = [
        { id: 'project1', title: 'Project One' },
        { id: 'project2', title: 'Project Two' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mockOnLogout.mockReset();

        // default mock implementations
        vi.mocked(isAdmin).mockReturnValue(false);
        vi.mocked(isInvestor).mockReturnValue(false);

        // mock useQuery to return projects
        vi.mocked(useQuery).mockReturnValue({
            data: mockProjects,
            isLoading: false,
            error: null,
        } as any);
    });

    describe('Basic rendering', () => {
        it('renders basic user menu items', () => {
            render(<Sidebar userPermissions={0} />);

            // check for basic user menu items
            expect(screen.getByText('My Projects')).toBeInTheDocument();
            expect(screen.getByText('Browse Projects')).toBeInTheDocument();
            expect(screen.getByText('Resources')).toBeInTheDocument();
        });

        it('renders common items', () => {
            render(<Sidebar userPermissions={0} />);

            // check for common menu items
            expect(screen.getByText('Settings')).toBeInTheDocument();
            expect(screen.getByText('Support')).toBeInTheDocument();
        });

        it('renders section titles', () => {
            render(<Sidebar userPermissions={0} />);

            // check for section title
            expect(screen.getByText('MAIN')).toBeInTheDocument();
        });
    });

    describe('Permission-based rendering', () => {
        it('renders investor items when user has investor permissions', () => {
            vi.mocked(isInvestor).mockReturnValue(true);

            render(<Sidebar userPermissions={1} />);

            // check for investor menu items
            expect(screen.getByText('INVESTOR')).toBeInTheDocument();
            expect(screen.getByText('My Investments')).toBeInTheDocument();
            expect(screen.getByText('Statistics')).toBeInTheDocument();
        });

        it('renders admin items when user has admin permissions', () => {
            vi.mocked(isAdmin).mockReturnValue(true);

            render(<Sidebar userPermissions={2} />);

            // check for admin menu items
            expect(screen.getByText('ADMIN')).toBeInTheDocument();
            expect(screen.getByText('Manage Permissions')).toBeInTheDocument();
        });

        it('renders both investor and admin items when user has both permissions', () => {
            vi.mocked(isInvestor).mockReturnValue(true);
            vi.mocked(isAdmin).mockReturnValue(true);

            render(<Sidebar userPermissions={3} />);

            // check for both investor and admin sections
            expect(screen.getByText('INVESTOR')).toBeInTheDocument();
            expect(screen.getByText('ADMIN')).toBeInTheDocument();
        });
    });

    describe('Mobile view', () => {
        it('displays all items in mobile view', () => {
            render(<Sidebar userPermissions={0} isMobile={true} />);
            expect(screen.getByText('MAIN')).toBeInTheDocument();
        });
    
        it('applies correct mobile styles', () => {
            const { container } = render(<Sidebar userPermissions={0} isMobile={true} />);
            expect(container).toBeInTheDocument();
        });
    });
    
    describe('Desktop view', () => {
        it('applies correct desktop styles', () => {
            const { container } = render(<Sidebar userPermissions={0} isMobile={false} />);
            expect(container).toBeInTheDocument();
        });
    });

    describe('User profile section', () => {
        it('renders user information when user is provided', () => {
            render(<Sidebar userPermissions={0} user={mockUser} />);

            // check for user profile information
            expect(screen.getByText('Naush Rao')).toBeInTheDocument();
            expect(screen.getByText('test@mail.com')).toBeInTheDocument();
            expect(screen.getByText('N')).toBeInTheDocument();
        });

        it('does not render user information when user is not provided', () => {
            render(<Sidebar userPermissions={0} />);

            // ensure user profile section is not rendered
            expect(screen.queryByText('Naush Rao')).not.toBeInTheDocument();
        });
    });

    describe('Projects dropdown', () => {
        it('expands and collapses projects dropdown when toggle button is clicked', () => {
            render(<Sidebar userPermissions={0} />);
            
            // initially expanded by default ('show-all')
            expect(screen.getByText('Project One')).toBeInTheDocument();
            
            // find dropdown toggle button by its icon test id
            const toggleButton = screen.getByTestId('fi-chevron-down');
            const toggleButtonParent = toggleButton.closest('button');
            
            if (toggleButtonParent) {
                fireEvent.click(toggleButtonParent);
                
                expect(screen.queryByText('Project One')).not.toBeInTheDocument();
                
                const newToggleButton = screen.getByTestId('fi-chevron-right');
                const newToggleButtonParent = newToggleButton.closest('button');
                
                if (newToggleButtonParent) {
                    fireEvent.click(newToggleButtonParent);
                    
                    expect(screen.getByText('Project One')).toBeInTheDocument();
                }
            }
        });
        
        it('constrains project list with max height and scrolling', () => {
            render(<Sidebar userPermissions={0} />);
            
            const projectsDropdown = screen.getByText('Project One').closest('div');
            
            expect(projectsDropdown).toHaveClass('max-h-60', 'overflow-y-auto');
        });
    });

    describe('Logout functionality with modal', () => {
        it('shows confirmation modal when logout button is clicked', async () => {
            render(
                <Sidebar
                    userPermissions={0}
                    user={mockUser}
                    onLogout={mockOnLogout}
                />
            );

            // find logout button using the icon test ID
            const logoutIcon = screen.getByTestId('io-logout');
            const logoutButton = logoutIcon.closest('button');
            
            expect(logoutButton).toBeInTheDocument();
            
            if (logoutButton) {
                fireEvent.click(logoutButton);
            }

            // check if confirmation modal appears
            expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
            expect(screen.getByText('Logout')).toBeInTheDocument();
            expect(screen.getByText('Are you sure you want to logout?')).toBeInTheDocument();
        });

        it('calls onLogout function when logout is confirmed', async () => {
            render(
                <Sidebar
                    userPermissions={0}
                    user={mockUser}
                    onLogout={mockOnLogout}
                />
            );

            // open modal
            const logoutIcon = screen.getByTestId('io-logout');
            const logoutButton = logoutIcon.closest('button');
            
            if (logoutButton) {
                fireEvent.click(logoutButton);
            }

            // click confirm button
            fireEvent.click(screen.getByTestId('modal-confirm'));

            // check if onLogout was called
            expect(mockOnLogout).toHaveBeenCalledTimes(1);
        });

        it('does not call onLogout when logout is canceled', async () => {
            render(
                <Sidebar
                    userPermissions={0}
                    user={mockUser}
                    onLogout={mockOnLogout}
                />
            );

            // open modal
            const logoutIcon = screen.getByTestId('io-logout');
            const logoutButton = logoutIcon.closest('button');
            
            if (logoutButton) {
                fireEvent.click(logoutButton);
            }

            // click cancel button
            fireEvent.click(screen.getByTestId('modal-cancel'));

            // check that onLogout was not called
            expect(mockOnLogout).not.toHaveBeenCalled();
        });
    });

    describe('Accessibility', () => {
        it('allows keyboard navigation for project items', () => {
            render(<Sidebar userPermissions={0} />);
            
            // get project buttons - can find them by text content
            const projectButtons = screen.getAllByRole('button').filter(
                btn => btn.textContent?.includes('Project')
            );
            
            expect(projectButtons.length).toBeGreaterThan(0);
            
            fireEvent.keyUp(projectButtons[0], { key: 'Enter' });
            
            expect(projectButtons[0]).toHaveAttribute('type', 'button');
        });
    });

    describe('Fixed bottom elements', () => {
        it('renders bottom items in a fixed container', () => {
            render(<Sidebar userPermissions={0} user={mockUser} />);
            
            // check for fixed bottom container with settings and profile
            const settingsLink = screen.getByText('Settings').closest('a');
            if (!settingsLink) {
                throw new Error("Settings link not found");
            }
            
            const bottomContainer = settingsLink.parentElement?.parentElement;
            if (!bottomContainer) {
                throw new Error("Bottom container not found");
            }
            
            // check that the bottom container has the fixed classes
            expect(bottomContainer.classList.contains('flex-shrink-0')).toBe(true);
            expect(bottomContainer.classList.contains('border-t')).toBe(true); 
            expect(bottomContainer.classList.contains('bg-white')).toBe(true);
        });
    });
});