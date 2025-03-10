import { createFileRoute, Outlet, Link } from '@tanstack/react-router';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { FiFolder, FiSettings, FiUser, FiCreditCard } from 'react-icons/fi';
import { DashboardTemplate } from '@/templates';
import { useAuth } from '@/contexts/AuthContext';
import { UserDropdown } from '@/components/UserDropdown';

export const Route = createFileRoute('/user/_auth/_appshell')({
    component: RouteComponent,
});

// dashboard nav items
const userMenuItems = [
    {
        path: '/user/dashboard',
        label: 'Projects',
        icon: <FiFolder />,
    },
    {
        path: '/user/settings/profile',
        label: 'Settings',
        icon: <FiSettings />,
    },
];

// settings nav items
const settingsItems = [
    {
        path: '/user/settings/profile',
        label: 'Profile',
        icon: <FiUser className="w-4 h-4" />,
    },
    {
        path: '/user/settings/wallet',
        label: 'Wallet',
        icon: <FiCreditCard className="w-4 h-4" />,
    },
];

function RouteComponent() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, clearAuth } = useAuth();

    const isSettingsPage = location.pathname.includes('/settings');

    const handleLogout = async () => {
        await clearAuth();

        navigate({ to: '/auth' });
    };

    const userActions = user ? (
        <UserDropdown user={user} onLogout={handleLogout} />
    ) : null;

    const desktopSidebar = (
        <div className="hidden md:block w-48 bg-white border-r border-gray-200">
            <div className="p-6">
                <nav className="space-y-1">
                    {userMenuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md 
                                ${
                                    (
                                        item.path === '/user/dashboard' &&
                                            location.pathname.startsWith(
                                                '/user/dashboard'
                                            )
                                    ) ||
                                    (
                                        item.path ===
                                            '/user/settings/profile' &&
                                            location.pathname.startsWith(
                                                '/user/settings'
                                            )
                                    )
                                        ? 'bg-gray-50 text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                            `}
                        >
                            {item.icon}

                            <span className="truncate">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {isSettingsPage && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <nav className="space-y-1">
                            {settingsItems.map((route) => (
                                <Link
                                    key={route.path}
                                    to={route.path}
                                    className={`
                                        flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md 
                                        ${
                                            location.pathname === route.path
                                                ? 'bg-gray-50 text-gray-900'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    {route.icon}

                                    <span className="truncate">
                                        {route.label}
                                    </span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );

    const mobileMenuItems = isSettingsPage
        ? [
              ...userMenuItems,

              // seperator
              { path: '', label: '', icon: null, isSeparator: true },

              // include settings subitems in mobile menu
              ...settingsItems.map((item) => ({
                  ...item,
                  label: `${item.label}`,
                  isSubmenu: true,
              })),
          ]
        : userMenuItems;

    return (
        <DashboardTemplate
            menuItems={mobileMenuItems}
            actions={userActions}
            customSidebar={desktopSidebar}
        >
            <Outlet />
        </DashboardTemplate>
    );
}
