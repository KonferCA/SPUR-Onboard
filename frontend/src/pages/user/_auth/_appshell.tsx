// import { FiFolder, FiBook, FiStar, FiUser } from 'react-icons/fi';
import { FiFolder, FiSettings } from 'react-icons/fi';
import { DashboardTemplate } from '@templates';
import { createFileRoute, Outlet, Link } from '@tanstack/react-router';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { SETTINGS_ROUTES } from '@/constants/settings';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { ProfilePicture } from '@/components/ProfilePicture/ProfilePicture';
import { IoSettingsOutline, IoLogOutOutline } from "react-icons/io5";

export const Route = createFileRoute('/user/_auth/_appshell')({
    component: RouteComponent,
});

const userMenuItems = [
    { label: 'My Projects', path: '/user/dashboard', icon: <FiFolder /> },
    { label: 'Settings', path: '/user/settings', icon: <FiSettings /> },
    // { label: 'Resources', path: '/resources', icon: <FiBook /> },
    // { label: 'Favorites', path: '/favorites', icon: <FiStar /> },
    // { label: 'Profile', path: '/profile', icon: <FiUser /> },
];

// const userNavTabs = [
//     { label: 'All Projects', path: '/user/projects' },
//     { label: 'Drafts', path: '/drafts' },
// ];

function RouteComponent() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, clearAuth } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = async () => {
        setIsDropdownOpen(false);
        await clearAuth();
        navigate({ to: '/auth' });
    };

    const handleSettingsClick = () => {
        setIsDropdownOpen(false);
    }

    const isSettingsPage = location.pathname.includes('/settings');

    const userActions = (
        <div className="relative">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
            >
                <ProfilePicture
                    url={user?.profilePictureUrl}
                    initials={`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || 'U'}`}
                    size="sm"
                />
                <svg
                    className={`w-4 h-4 transition-transform ${
                        isDropdownOpen ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 9l6 6 6-6" // TIL: this is called a chevron
                    />
                </svg>
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-lg border border-gray-200">
                    <Link
                        to="/user/settings"
                        onClick={handleSettingsClick}
                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                    >
                        <IoSettingsOutline className="w-5 h-5 inline-block mr-2" />
                        Settings
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                    >
                        <IoLogOutOutline className="w-5 h-5 inline-block mr-2" />
                        Log Out
                    </button>
                </div>
            )}
        </div>
    );

    // Settings sidebar
    const SettingsSidebar = isSettingsPage ? (
        <div className="w-64 bg-white border-r border-gray-200">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Projects
                </h2>
                <nav className="space-y-1">
                    <Link
                        to="/user/dashboard"
                        className={` flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 `}
                    >
                        <FiFolder />
                        Projects
                    </Link>
                </nav>
                <div className="h-4"></div>
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
                                ${ location.pathname === route.path
                                    ? 'bg-gray-50 text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                            `}
                        >
                            {route.icon}
                            {route.label}
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
