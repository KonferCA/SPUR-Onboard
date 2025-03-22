import { useState } from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import {
    FiFolder,
    FiSettings,
    FiUser,
    FiCreditCard,
    FiBarChart2,
    FiDollarSign,
    FiShield,
    FiHeadphones,
    FiSearch,
    FiBook,
    FiChevronDown,
    FiChevronRight,
    FiFileText
} from 'react-icons/fi';
import { IoLogOutOutline } from 'react-icons/io5';
import { isAdmin, isInvestor } from '@/utils/permissions';
import { Button } from '@/components';
import type { User } from '@/types';
import { LogoSVG } from '@/assets';
import { listProjects } from '@/services/project';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts';
import type { AnchorLinkItem } from '@/components/AnchorLinks/AnchorLinks';
import type { ReactNode } from 'react';
import { ConfirmationModal } from '@/components/ConfirmationModal';

export interface SidebarProps {
    userPermissions: number;
    isMobile?: boolean;
    user?: User;
    onLogout?: () => Promise<void>;
    anchorLinks?: AnchorLinkItem[];
    currentProjectId?: string;
}

export interface MenuItem {
    path: string;
    label: string;
    icon: ReactNode;
    permissions?: number[];
    isSeparator?: boolean;
    isSubmenu?: boolean;
    isSectionTitle?: boolean;
    id?: string;
}

export const Sidebar = ({
    userPermissions,
    isMobile = false,
    user,
    onLogout,
    currentProjectId
}: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { accessToken } = useAuth();
    const [expandedProject, setExpandedProject] = useState<string | null>('show-all');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    const { data: projects } = useQuery({
        queryKey: ['sidebar_projects', accessToken],
        queryFn: async () => {
            if (!accessToken) {
                return [];
            }

            return await listProjects(accessToken);
        },
        refetchOnWindowFocus: false,
        initialData: [],
    });

    const userItems: MenuItem[] = [
        {
            path: '/user/dashboard',
            label: 'My Projects',
            icon: <FiFolder className="w-5 h-5" />,
            id: 'my-projects',
        },
        {
            path: '/user/browse',
            label: 'Browse Projects',
            icon: <FiSearch className="w-5 h-5" />,
            id: 'browse-projects',
        },
        {
            path: '/user/resources',
            label: 'Resources',
            icon: <FiBook className="w-5 h-5" />,
            id: 'resources',
        },
    ];

    const investorItems: MenuItem[] = [
        {
            path: '/user/investor/investments',
            label: 'My Investments',
            icon: <FiDollarSign className="w-5 h-5" />,
            id: 'investments',
        },
        {
            path: '/user/investor/statistics',
            label: 'Statistics',
            icon: <FiBarChart2 className="w-5 h-5" />,
            id: 'statistics',
        },
    ];

    const adminItems: MenuItem[] = [
        {
            path: '/user/admin/permissions',
            label: 'Manage Permissions',
            icon: <FiShield className="w-5 h-5" />,
            id: 'permissions',
        },
    ];

    const commonItems: MenuItem[] = [
        {
            path: '/user/settings/profile',
            label: 'Settings',
            icon: <FiSettings className="w-5 h-5" />,
            id: 'settings',
        },
        {
            path: '/user/support',
            label: 'Support',
            icon: <FiHeadphones className="w-5 h-5" />,
            id: 'support',
        },
    ];

    const settingsItems: MenuItem[] = [
        {
            path: '/user/settings/profile',
            label: 'Profile',
            icon: <FiUser className="w-5 h-5" />,
            isSubmenu: true,
            id: 'profile',
        },
        {
            path: '/user/settings/wallet',
            label: 'Wallet',
            icon: <FiCreditCard className="w-5 h-5" />,
            isSubmenu: true,
            id: 'wallet',
        },
    ];

    const sections = [
        {
            title: 'MAIN',
            id: 'main',
            items: [...userItems],
        },
    ];

    if (isInvestor(userPermissions) || isAdmin(userPermissions)) {
        sections.push({
            title: 'INVESTOR',
            id: 'investor',
            items: [...investorItems],
        });
    }

    if (isAdmin(userPermissions)) {
        sections.push({
            title: 'ADMIN',
            id: 'admin',
            items: [...adminItems],
        });
    }

    const navItems: MenuItem[] = [];

    if (isMobile) {
        sections.forEach((section) => {
            if (section.title) {
                navItems.push({
                    path: '',
                    label: section.title,
                    icon: null,
                    isSectionTitle: true,
                    id: `section-${section.id}`,
                });
            }

            navItems.push(...section.items);
        });

        const isSettingsPage = location.pathname.includes('/settings');

        if (isSettingsPage) {
            const settingsIndex = navItems.findIndex(
                (item) => item.path === '/user/settings/profile'
            );

            if (settingsIndex !== -1) {
                navItems.splice(settingsIndex + 1, 0, ...settingsItems);
            }
        }
    }

    const getNavItemClass = (item: MenuItem, isExpanded: boolean = false) => {
        let baseClass =
            'flex items-center gap-3 text-sm font-medium rounded-lg';

        if (item.isSubmenu) {
            baseClass += ' pl-8';
        }

        const isActive =
            (item.path === '/user/dashboard' &&
                (location.pathname.startsWith('/user/dashboard') || 
                 location.pathname.includes('/project/'))) ||
            (item.path === '/user/settings/profile' &&
                location.pathname.startsWith('/user/settings')) ||
            location.pathname === item.path ||
            isExpanded;

        if (isActive) {
            baseClass += ' bg-gray-100 text-gray-900 [&>svg]:text-orange-400';
        } else {
            baseClass += ' text-gray-600 hover:bg-gray-50 hover:text-gray-900';
        }

        if (isMobile) {
            baseClass += ' py-3 px-6 mx-2';
        } else {
            baseClass += ' py-3 px-4 mx-4';
        }

        return baseClass;
    };

    const toggleProjectsDropdown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedProject(expandedProject ? null : 'show-all');
    };

    const handleGoToProject = (projectId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        navigate({ 
            to: `/user/project/${projectId}/form`,
            replace: false
        });
    };

    const getProjectClass = (projectId: string) => {
        const isActive = currentProjectId === projectId;
        let baseClass = 'flex items-center gap-2 text-sm rounded-lg pl-8 py-2 mx-4 transition-colors cursor-pointer';
        
        if (isActive) {
            baseClass += ' text-gray-900 font-medium';
        } else {
            baseClass += ' text-gray-600 hover:text-gray-900 hover:bg-gray-50';
        }
        
        return baseClass;
    };

    const handleLogout = async () => {
        setShowLogoutModal(false);
        if (onLogout) {
            await onLogout();
        } else {
            navigate({ to: '/auth' });
        }
    };

    const renderNormalSidebar = () => (
        <>
            {sections.map((section) => (
                <div
                    key={section.id || `section-${section.title}`}
                >
                    {section.title && (
                        <div className="text-sm font-bold text-gray-900 px-4 pt-6 pb-2">
                            {section.title}
                        </div>
                    )}

                    <div>
                        {section.items.map((item) => {
                            if (commonItems.includes(item)) {
                                return null;
                            }

                            if (item.isSeparator) {
                                return (
                                    <div
                                        key={
                                            item.id ||
                                            `separator-${item.label}`
                                        }
                                        className="border-t border-gray-200 my-2"
                                    />
                                );
                            }

                            if (item.id === 'my-projects') {
                                const isProjectsActive = location.pathname.startsWith('/user/dashboard') || 
                                                        location.pathname.includes('/project/');
                                return (
                                    <div key={item.id}>
                                        <div className={getNavItemClass(item, isProjectsActive)}>
                                            <Link 
                                                to={item.path}
                                                className="flex-1 flex items-center gap-3"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {item.icon}
                                                <span className="truncate">
                                                    {item.label}
                                                </span>
                                            </Link>
                                            <button 
                                                onClick={toggleProjectsDropdown}
                                                className="ml-auto focus:outline-none"
                                            >
                                                {expandedProject ? (
                                                    <FiChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <FiChevronRight className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>

                                        {expandedProject && (
                                            <div className="mt-1">
                                                {projects && projects.length > 0 ? (
                                                    projects.map((project) => (
                                                        <div 
                                                            key={project.id}
                                                            className={getProjectClass(project.id)}
                                                            onClick={(e) => handleGoToProject(project.id, e)}
                                                        >
                                                            <FiFileText className="w-4 h-4" />
                                                            <span className="truncate flex-1">
                                                                {project.title || `Project ${project.id.slice(0, 6)}`}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-sm text-gray-500 pl-8 py-2 mx-4">
                                                        No projects found
                                                    </div>
                                                )}

                                                <Link
                                                    to="/user/project/new"
                                                    className="text-sm text-button-primary-100 flex items-center gap-2 pl-8 py-2 mb-2 mx-4 hover:underline"
                                                >
                                                    + Create new project
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={
                                        item.path ||
                                        item.id ||
                                        `item-${item.label}`
                                    }
                                    to={item.path}
                                    className={getNavItemClass(
                                        item
                                    )}
                                >
                                    {item.icon}

                                    <span className="truncate">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </>
    );

    const renderMobileSidebar = () => (
        <>
            {navItems
                .filter((item) => !commonItems.includes(item))
                .map((item) => {
                    if (item.isSectionTitle) {
                        return (
                            <div
                                key={
                                    item.id ||
                                    `section-${item.label}`
                                }
                                className="text-sm font-bold text-gray-900 px-6 pt-6 pb-2"
                            >
                                {item.label}
                            </div>
                        );
                    }

                    if (item.isSeparator) {
                        return (
                            <div
                                key={
                                    item.id ||
                                    `separator-${item.label}`
                                }
                                className="border-t border-gray-200 my-2"
                            />
                        );
                    }

                    if (item.id === 'my-projects') {
                        const isProjectsActive = location.pathname.startsWith('/user/dashboard') || 
                                               location.pathname.includes('/project/');
                        return (
                            <div key={item.id}>
                                <div className={getNavItemClass(item, isProjectsActive)}>
                                    <Link 
                                        to={item.path}
                                        className="flex-1 flex items-center gap-3"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {item.icon}
                                        <span className="truncate">
                                            {item.label}
                                        </span>
                                    </Link>
                                    <button 
                                        onClick={toggleProjectsDropdown}
                                        className="ml-auto focus:outline-none"
                                    >
                                        {expandedProject ? (
                                            <FiChevronDown className="w-4 h-4" />
                                        ) : (
                                            <FiChevronRight className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                {expandedProject && (
                                    <div className="mt-1">
                                        {projects && projects.length > 0 ? (
                                            projects.map((project) => (
                                                <div 
                                                    key={project.id}
                                                    className={`${getProjectClass(project.id)} py-3 px-6 mx-2`}
                                                    onClick={(e) => handleGoToProject(project.id, e)}
                                                >
                                                    <FiFileText className="w-4 h-4" />
                                                    <span className="truncate flex-1">
                                                        {project.title || `Project ${project.id.slice(0, 6)}`}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-gray-500 pl-8 py-2 px-6 mx-2">
                                                No projects found
                                            </div>
                                        )}

                                        <Link
                                            to="/user/project/new"
                                            className="text-sm text-button-primary-100 flex items-center gap-2 pl-8 py-2 mb-2 px-6 mx-2 hover:underline"
                                        >
                                            + Create new project
                                        </Link>
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={
                                item.path ||
                                item.id ||
                                `item-${item.label}`
                            }
                            to={item.path}
                            className={getNavItemClass(item)}
                        >
                            {item.icon}

                            <span className="truncate">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
        </>
    );

    return (
        <div
            className={`${isMobile ? 'w-64' : 'w-60'} bg-white border-r border-gray-200 fixed h-screen flex flex-col`}
        >
            {/* Logo Section */}
            <div className="flex justify-center items-center py-4 mt-2">
                <Link
                    to="/user/dashboard"
                    className="flex items-center justify-center"
                >
                    <img src={LogoSVG} alt="Logo" className="h-10 w-auto" />
                </Link>
            </div>

            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    {isMobile ? renderMobileSidebar() : renderNormalSidebar()}
                </div>

                <div className="border-t border-gray-200 pt-2 mt-auto">
                    {commonItems.map((item) => (
                        <Link
                            key={item.path || item.id || `common-${item.label}`}
                            to={item.path}
                            className={getNavItemClass(item)}
                        >
                            {item.icon}

                            <span className="truncate">{item.label}</span>
                        </Link>
                    ))}

                    {user && (
                        <div className="mx-3 mt-3 mb-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium text-md">
                                    {user?.firstName?.[0] || ''}
                                </div>

                                <div className="ml-3">
                                    <div className="text-gray-900 font-medium text-sm">
                                        {user?.firstName} {user?.lastName}
                                    </div>

                                    <div className="text-gray-600 text-sm">
                                        {user?.email || ''}
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowLogoutModal(true)}
                                className="!border-0 !p-2 hover:bg-gray-200"
                                icon={<IoLogOutOutline className="w-6 h-6" />}
                            />
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                primaryAction={handleLogout}
                title="Logout"
                primaryActionText="Yes, logout"
            >
                <div className="space-y-4">
                    <p>Are you sure you want to logout?</p>
                </div>
            </ConfirmationModal>
        </div>
    );
};