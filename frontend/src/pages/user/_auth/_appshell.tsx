import { FiFolder, FiSettings } from 'react-icons/fi';
import { DashboardTemplate } from '@templates';
import { createFileRoute, Outlet, Link } from '@tanstack/react-router';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { SETTINGS_ROUTES } from '@/constants/settings';
import { useAuth } from '@/contexts/AuthContext';
import { UserDropdown } from '@/components/UserDropdown'; 

export const Route = createFileRoute('/user/_auth/_appshell')({
    component: RouteComponent,
});

const userMenuItems = [
    { label: 'Projects', path: '/user/dashboard', icon: <FiFolder /> },
    { label: 'Settings', path: '/user/settings', icon: <FiSettings /> },
    // { label: 'Resources', path: '/resources', icon: <FiBook /> },
    // { label: 'Favorites', path: '/favorites', icon: <FiStar /> },
    // { label: 'Profile', path: '/profile', icon: <FiUser /> },
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

    const userActions = (
        <UserDropdown 
            user={user} 
            onLogout={handleLogout} 
        />
    );

    const SettingsSidebar = isSettingsPage ? (
        <div className="w-56 md:w-48 bg-white border-r border-gray-200">
            <div className="p-4 md:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Projects
                </h2>

                <nav className="space-y-1">
                    <Link
                        to="/user/dashboard"
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900`}
                    >
                        <FiFolder />
                        Projects
                    </Link>
                </nav>

                <div className="h-4" />

                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Settings
                </h2>

                <nav className="space-y-1">
                    {SETTINGS_ROUTES.map((route) => (
                        <Link
                            key={route.path}
                            to={route.path}
                            className={`
                                flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md 
                                ${location.pathname === route.path
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
        </div>
    ) : null;

    return (
        <DashboardTemplate
            menuItems={userMenuItems}
            actions={userActions}
            customSidebar={SettingsSidebar}
        >
            <Outlet />
        </DashboardTemplate>
    );
}