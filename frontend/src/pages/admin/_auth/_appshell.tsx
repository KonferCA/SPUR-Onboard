import { createFileRoute, Outlet } from '@tanstack/react-router';
import { FiFolder, FiSettings } from 'react-icons/fi';
import { DashboardTemplate } from '@templates';

export const Route = createFileRoute('/admin/_auth/_appshell')({
    component: RouteComponent,
});

const adminMenuItems = [
    { label: 'Projects', path: '/admin/dashboard', icon: <FiFolder /> },
    // { label: 'Resources', path: '/admin/resources', icon: <FiBook /> },
    // { label: 'Users', path: '/admin/users', icon: <FiUsers /> },
    {
        label: 'Settings',
        path: '/admin/settings/permissions',
        icon: <FiSettings />,
    },
];

function RouteComponent() {
    // const adminActions = (
    //     <>
    //         <button className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-700">
    //             New Project
    //         </button>
    //         <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full">
    //             <span className="sr-only">Admin menu</span>
    //             <div className="w-8 h-8 bg-gray-200 rounded-full" />
    //         </button>
    //     </>
    // );

    return (
        <DashboardTemplate
            menuItems={adminMenuItems}
        >
            <Outlet />
        </DashboardTemplate>
    );
}
