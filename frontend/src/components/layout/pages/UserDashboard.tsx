import React, { ReactNode } from 'react';
import { FiFolder, FiBook, FiStar, FiUser } from 'react-icons/fi';
import { DashboardTemplate } from '../templates/DashboardTemplate';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const userMenuItems = [
    { label: 'My Projects', path: '/projects', icon: <FiFolder /> },
    { label: 'Resources', path: '/resources', icon: <FiBook /> },
    { label: 'Favorites', path: '/favorites', icon: <FiStar /> },
    { label: 'Profile', path: '/profile', icon: <FiUser /> },
];

const userNavTabs = [
    { label: 'All Projects', path: '/projects' },
    { label: 'Drafts', path: '/drafts' },
];

interface UserDashboardProps {
    children: ReactNode;
    customSidebar?: ReactNode;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
    children,
    customSidebar,
}) => {
    const navigate = useNavigate();
    const { companyId } = useAuth();

    const userActions = (
        <>
            <button
                onClick={() =>
                    !companyId
                        ? navigate('/new-company')
                        : navigate('/submit-project')
                }
                className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {!companyId ? 'Create company' : 'Submit a project'}
            </button>
            <div className="relative">
                <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full">
                    <span className="sr-only">User menu</span>
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                </button>
            </div>
        </>
    );

    return (
        <DashboardTemplate
            menuItems={userMenuItems}
            navTabs={userNavTabs}
            actions={userActions}
            customSidebar={customSidebar}
        >
            {children}
        </DashboardTemplate>
    );
};
