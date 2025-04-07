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
        onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    }) => (
        <a
            href={to}
            className={className}
            data-testid={`link-${to}`}
            onClick={onClick}
        >
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
    useAuth: () => ({ 
        accessToken: 'test-token',
        getAccessToken: () => 'test-token'
    }),
}));

// mock sidebar context
vi.mock('@/contexts/SidebarContext/SidebarContext', () => {
    return {
        useSidebar: vi.fn().mockImplementation(() => ({
            currentProjectId: 'project1',
            projectConfig: {
                sections: [
                    'The Basics',
                    'The Details',
                    'The Team',
                    'The Financials',
                ],
                getActiveSection: () => 'The Basics',
                sectionClickHandler: vi.fn(),
            },
            isMobileDrawerOpen: false,
            setMobileDrawerOpen: vi.fn(),
            isSidebarVisible: true,
        })),
        permissions: 0,
    };
});

// mock notification context
vi.mock('@/contexts/NotificationContext', () => ({
    useNotification: () => ({
        push: vi.fn(),
    }),
}));

// mock button component
vi.mock('@/components', () => ({
    Button: ({
        children,
        onClick,
        className = '',
        variant = 'primary',
        size = 'md',
        icon,
    }: {
        children?: React.ReactNode;
        onClick: () => void;
        className?: string;
        variant?: 'primary' | 'secondary' | 'danger' | 'outline';
        size?: 'sm' | 'md' | 'lg';
        icon?: React.ReactNode;
    }) => (
        <button
            onClick={onClick}
            className={className}
            data-variant={variant}
            data-size={size}
            data-testid="button-component"
            type="button"
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
    }) =>
        isOpen && (
            <div data-testid="confirmation-modal">
                <h2>{title}</h2>
                <div>{children}</div>
                <button
                    onClick={onClose}
                    data-testid="modal-cancel"
                    type="button"
                >
                    Cancel
                </button>
                <button
                    onClick={primaryAction}
                    data-testid="modal-confirm"
                    type="button"
                >
                    {primaryActionText}
                </button>
            </div>
        ),
}));

// mock for FiIcons
vi.mock('react-icons/fi', () => ({
    FiHome: () => <span data-testid="fi-home">HomeIcon</span>,
    FiFolder: () => <span data-testid="fi-folder">FolderIcon</span>,
    FiSettings: () => <span data-testid="fi-settings">SettingsIcon</span>,
    FiUser: () => <span data-testid="fi-user">UserIcon</span>,
    FiCreditCard: () => (
        <span data-testid="fi-credit-card">CreditCardIcon</span>
    ),
    FiBarChart2: () => <span data-testid="fi-bar-chart">BarChartIcon</span>,
    FiDollarSign: () => <span data-testid="fi-dollar">DollarIcon</span>,
    FiTool: () => <span data-testid="fi-tool">ToolIcon</span>,
    FiHeadphones: () => <span data-testid="fi-headphones">HeadphonesIcon</span>,
    FiSearch: () => <span data-testid="fi-search">SearchIcon</span>,
    FiBook: () => <span data-testid="fi-book">BookIcon</span>,
    FiChevronDown: () => (
        <span data-testid="fi-chevron-down">ChevronDownIcon</span>
    ),
    FiChevronRight: () => (
        <span data-testid="fi-chevron-right">ChevronRightIcon</span>
    ),
    FiFileText: () => <span data-testid="fi-file-text">FileTextIcon</span>,
    FiX: () => <span data-testid="fi-x">XIcon</span>,
    FiEye: () => <span data-testid="fi-eye">EyeIcon</span>,
    FiKey: () => <span data-testid="fi-key">KeyIcon</span>,
}));

// mock for IO icons
vi.mock('react-icons/io5', () => ({
    IoLogOutOutline: () => <span data-testid="io-logout">LogoutIcon</span>,
}));

// mock logo
vi.mock('@/assets', () => ({
    LogoSVG: 'test-logo-path',
}));

// mock route config
vi.mock('@/config/routes', () => ({
    isRouteAvailable: (path: string) => path !== '/user/resources',
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
        {
            id: 'project1',
            title: 'Project One',
            status: 'DRAFT',
        },
        {
            id: 'project2',
            title: 'Project Two',
            status: 'SUBMITTED',
        },
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
        } as ReturnType<typeof useQuery>);
    });

    describe('Basic rendering', () => {
        it('renders basic user menu items', () => {
            render(<Sidebar userPermissions={0} />);

            // check for basic user menu items
            expect(screen.getByText('Home')).toBeInTheDocument();
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

            render(<Sidebar userPermissions={64} />);

            // check for investor menu items
            expect(screen.getByText('INVESTOR')).toBeInTheDocument();
            expect(screen.getByText('My Investments')).toBeInTheDocument();
            expect(screen.getByText('Statistics')).toBeInTheDocument();
        });

        it('renders admin items when user has admin permissions', () => {
            vi.mocked(isAdmin).mockReturnValue(true);

            render(<Sidebar userPermissions={1024} />);

            // check for admin menu items
            expect(screen.getByText('ADMIN')).toBeInTheDocument();
            expect(screen.getByText('Manage Permissions')).toBeInTheDocument();
        });

        it('renders both investor and admin items when user has both permissions', () => {
            vi.mocked(isInvestor).mockReturnValue(true);
            vi.mocked(isAdmin).mockReturnValue(true);

            render(<Sidebar userPermissions={1088} />);

            // check for both investor and admin sections
            expect(screen.getByText('INVESTOR')).toBeInTheDocument();
            expect(screen.getByText('ADMIN')).toBeInTheDocument();
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
        it('keeps projects section collapsed by default', () => {
            render(<Sidebar userPermissions={0} />);

            // projects dropdown should be collapsed by default
            expect(screen.queryByText('The Basics')).not.toBeInTheDocument();
            expect(screen.queryByText('The Details')).not.toBeInTheDocument();
            expect(screen.queryByText('The Team')).not.toBeInTheDocument();
            expect(
                screen.queryByText('The Financials')
            ).not.toBeInTheDocument();
        });

        it('expands projects section when dropdown button is clicked', () => {
            render(<Sidebar userPermissions={0} />);

            // find the My Projects text first
            const myProjectsElement = screen.getByText('My Projects');
            expect(myProjectsElement).toBeInTheDocument();

            const toggleButton = myProjectsElement
                .closest('div')
                ?.querySelector('button');
            expect(toggleButton).not.toBeNull();

            if (toggleButton) {
                fireEvent.click(toggleButton);

                expect(screen.getByText('Project One')).toBeInTheDocument();
                expect(screen.getByText('Project Two')).toBeInTheDocument();
            }
        });

        it('shows project sections when project is expanded', () => {
            render(<Sidebar userPermissions={0} />);

            // expand the projects dropdown
            const myProjectsElement = screen.getByText('My Projects');
            const toggleButton = myProjectsElement
                .closest('div')
                ?.querySelector('button');
            if (toggleButton) {
                fireEvent.click(toggleButton);
            }

            // find the first project's expand button
            const projectExpanders = screen.getAllByTestId('fi-chevron-right');
            const expander = projectExpanders[0].closest('button');

            if (expander) {
                fireEvent.click(expander);

                expect(screen.getByText('The Basics')).toBeInTheDocument();
                expect(screen.getByText('The Details')).toBeInTheDocument();
                expect(screen.getByText('The Team')).toBeInTheDocument();
                expect(screen.getByText('The Financials')).toBeInTheDocument();
            }
        });

        it('shows the "Submitted" label for submitted projects', () => {
            render(<Sidebar userPermissions={0} />);

            // expand the projects dropdown to see the projects
            const myProjectsElement = screen.getByText('My Projects');
            const toggleButton = myProjectsElement
                .closest('div')
                ?.querySelector('button');
            if (toggleButton) {
                fireEvent.click(toggleButton);

                expect(screen.getByText('Submitted')).toBeInTheDocument();
            }
        });

        it('shows "Create new project" link when projects dropdown is open', () => {
            render(<Sidebar userPermissions={0} />);

            // expand the projects dropdown
            const myProjectsElement = screen.getByText('My Projects');
            const toggleButton = myProjectsElement
                .closest('div')
                ?.querySelector('button');
            if (toggleButton) {
                fireEvent.click(toggleButton);

                expect(
                    screen.getByText('+ Create new project')
                ).toBeInTheDocument();
            }
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
            expect(
                screen.getByTestId('confirmation-modal')
            ).toBeInTheDocument();
            expect(screen.getByText('Logout')).toBeInTheDocument();
            expect(
                screen.getByText('Are you sure you want to logout?')
            ).toBeInTheDocument();
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

    describe('Route availability', () => {
        it('shows notification for unavailable routes', () => {
            render(<Sidebar userPermissions={0} />);

            const resourcesLink = screen.getByText('Resources').closest('a');
            if (resourcesLink) {
                expect(resourcesLink.className).toContain('opacity-70');
                expect(resourcesLink.className).toContain('cursor-not-allowed');
            }
        });
    });
});
