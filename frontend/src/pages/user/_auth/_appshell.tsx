import { createFileRoute, Outlet } from '@tanstack/react-router';
// import { FiFolder, FiBook, FiStar, FiUser } from 'react-icons/fi';
import { FiFolder } from 'react-icons/fi';
import { DashboardTemplate } from '@templates';

export const Route = createFileRoute('/user/_auth/_appshell')({
    component: RouteComponent,
});

const userMenuItems = [
    { label: 'My Projects', path: '/user/dashboard', icon: <FiFolder /> },
    // { label: 'Resources', path: '/resources', icon: <FiBook /> },
    // { label: 'Favorites', path: '/favorites', icon: <FiStar /> },
    // { label: 'Profile', path: '/profile', icon: <FiUser /> },
];

// const userNavTabs = [
//     { label: 'All Projects', path: '/user/projects' },
//     { label: 'Drafts', path: '/drafts' },
// ];

function RouteComponent() {
    const userActions = (
        <div className="relative">
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full">
                <span className="sr-only">User menu</span>
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
            </button>
        </div>
    );

    return (
        <DashboardTemplate menuItems={userMenuItems} actions={userActions}>
            <Outlet />
        </DashboardTemplate>
    );
}
