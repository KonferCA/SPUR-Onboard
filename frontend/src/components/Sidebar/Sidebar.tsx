import { useState, useEffect, useCallback } from 'react';
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
    FiFileText,
} from 'react-icons/fi';
import { IoLogOutOutline } from 'react-icons/io5';
import { isAdmin, isInvestor } from '@/utils/permissions';
import { Button } from '@/components';
import { LogoSVG } from '@/assets';
import { listProjects } from '@/services/project';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useSidebar } from '@/contexts/SidebarContext/SidebarContext';
import type { MenuItem, SidebarProps } from './types';

export const Sidebar = ({
    userPermissions,
    user,
    onLogout,
}: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { accessToken } = useAuth();
    const { 
        currentProjectId, 
        projectConfig,
        isMobileDrawerOpen,
        setMobileDrawerOpen 
    } = useSidebar();

    const [expandedProject, setExpandedProject] = useState<string | null>(
        'show-all'
    );
    const [expandedProjectItems, setExpandedProjectItems] = useState<
        Record<string, boolean>
    >({});
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const { data: projects = [] } = useQuery({
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

    const projectSections = projectConfig?.sections || [
        'The Basics',
        'The Details',
        'The Team',
        'The Financials',
    ];

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

    const getActiveSection = (projectId: string): string | null => {
        if (projectConfig?.getActiveSection) {
            return projectConfig.getActiveSection(projectId);
        }
        
        if (projectId === currentProjectId && location.search) {
            const params = new URLSearchParams(location.search);
            const section = params.get('section');

            if (section) {
                // convert - section back to title case
                const normalizedSection = section
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                
                const matchingSection = projectSections.find(
                    s => s.toLowerCase().replace(/\s+/g, '-') === section
                );
                
                return matchingSection || normalizedSection;
            }
        }
        
        return null;
    };

    const getNavItemClass = (item: MenuItem, isExpanded = false) => {
        let baseClass = 'flex items-center gap-3 text-sm font-medium';

        baseClass += ' py-2.5 px-3';

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

        return baseClass;
    };

    const toggleProjectsDropdown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        setExpandedProject(expandedProject ? null : 'show-all');
    };    

    const navigateToProjectSection = useCallback((
        projectId: string,
        section?: string
    ) => {
        const searchParams = section 
            ? { section: section.toLowerCase().replace(/\s+/g, '-') }
            : undefined;
            
        navigate({
            to: `/user/project/${projectId}/form`,
            search: searchParams,
            replace: false,
        });
    }, [navigate]);

    const handleGoToProject = (
        projectId: string,
        e: React.MouseEvent | React.KeyboardEvent
    ) => {
        e.stopPropagation();
        
        setExpandedProjectItems((prev) => ({
            ...prev,
            [projectId]: !prev[projectId],
        }));
        
        if (projectId !== currentProjectId) {
            navigateToProjectSection(projectId);
        }
    };

    const handleSectionClick = (
        projectId: string,
        section: string,
        sectionIndex: number,
        e: React.MouseEvent
    ) => {
        e.preventDefault();
        e.stopPropagation();
        
        const clickedProject = projectId;
        
        if (projectConfig?.sectionClickHandler) {
            projectConfig.sectionClickHandler(projectId, section, sectionIndex);
            
            setExpandedProjectItems((prev) => ({
                ...prev,
                [clickedProject]: true,
            }));
        } else {
            navigateToProjectSection(projectId, section);
            
            setExpandedProjectItems((prev) => ({
                ...prev,
                [clickedProject]: true,
            }));
        }
    };

    const handleExpandProject = (
        projectId: string,
        e: React.MouseEvent
    ) => {
        e.stopPropagation();
        e.preventDefault();
        
        setExpandedProjectItems((prev) => ({
            ...prev,
            [projectId]: !prev[projectId],
        }));
    }; 

    const handleLogout = async () => {
        setShowLogoutModal(false);
        if (onLogout) {
            await onLogout();
        } else {
            navigate({ to: '/auth' });
        }
    };

    useEffect(() => {
        return () => {
            if (isMobileDrawerOpen) {
                setMobileDrawerOpen(false);
            }
        };
    }, [isMobileDrawerOpen, setMobileDrawerOpen]);

    useEffect(() => {
        if (currentProjectId) {
            setExpandedProjectItems((prev) => ({
                ...prev,
                [currentProjectId]: true,
            }));
        }
    }, [currentProjectId]);

    useEffect(() => {
        if (currentProjectId && location.search) {
            const params = new URLSearchParams(location.search);
            const currentSection = params.get('section');
            
            if (currentSection) {
                setExpandedProjectItems((prev) => ({
                    ...prev,
                    [currentProjectId]: true,
                }));
            }
        }
    }, [location.search, currentProjectId]);

    const navItems: MenuItem[] = [];
    
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
    
    const renderSidebarContent = (isMobile: boolean) => (
        <>
            {isMobile ? 
                navItems
                    .filter((item) => !commonItems.includes(item))
                    .map((item) => {
                        if (item.isSectionTitle) {
                            return (
                                <div
                                    key={item.id || `section-${item.label}`}
                                    className="text-sm font-bold text-gray-900 px-4 pt-6 pb-2"
                                >
                                    {item.label}
                                </div>
                            );
                        }

                        if (item.isSeparator) {
                            return (
                                <div
                                    key={item.id || `separator-${item.label}`}
                                    className="border-t border-gray-200 my-2"
                                />
                            );
                        }

                        if (item.id === 'my-projects') {
                            const isProjectsActive =
                                location.pathname.startsWith('/user/dashboard') ||
                                location.pathname.includes('/project/');
                            return (
                                <div key={item.id}>
                                    <div
                                        className={`${getNavItemClass(item, isProjectsActive)} rounded-lg mx-2`}
                                    >
                                        <Link
                                            to={item.path}
                                            className="flex-1 flex items-center gap-3"
                                            onClick={() => {
                                                if (isMobileDrawerOpen) {
                                                    setTimeout(() => setMobileDrawerOpen(false), 150);
                                                }
                                            }}
                                        >
                                            {item.icon}
                                            <span className="truncate">
                                                {item.label}
                                            </span>
                                        </Link>

                                        <button
                                            onClick={toggleProjectsDropdown}
                                            className="focus:outline-none"
                                            type="button"
                                            aria-expanded={!!expandedProject}
                                            aria-label={expandedProject ? "Collapse projects" : "Expand projects"}
                                        >
                                            {expandedProject ? (
                                                <FiChevronDown className="w-4 h-4" />
                                            ) : (
                                                <FiChevronRight className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>

                                    {expandedProject && renderProjectsList(isMobile)}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.path || item.id || `item-${item.label}`}
                                to={item.path}
                                className={`${getNavItemClass(item)} rounded-lg mx-2`}
                                onClick={() => {
                                    if (isMobileDrawerOpen) {
                                        setTimeout(() => setMobileDrawerOpen(false), 150);
                                    }
                                }}
                            >
                                {item.icon}
                                <span className="truncate">{item.label}</span>
                            </Link>
                        );
                    })
                :
                sections.map((section) => (
                    <div key={section.id || `section-${section.title}`}>
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
                                                item.id || `separator-${item.label}`
                                            }
                                            className="border-t border-gray-200 my-2"
                                        />
                                    );
                                }

                                if (item.id === 'my-projects') {
                                    const isProjectsActive =
                                        location.pathname.startsWith(
                                            '/user/dashboard'
                                        ) ||
                                        location.pathname.includes('/project/');
                                    return (
                                        <div key={item.id}>
                                            <div
                                                className={`${getNavItemClass(item, isProjectsActive)} rounded-lg mx-2`}
                                            >
                                                <Link
                                                    to={item.path}
                                                    className="flex-1 flex items-center gap-3"
                                                    onClick={() => {
                                                        if (isMobileDrawerOpen) {
                                                            setTimeout(() => setMobileDrawerOpen(false), 150);
                                                        }
                                                    }}
                                                >
                                                    {item.icon}

                                                    <span className="truncate">
                                                        {item.label}
                                                    </span>
                                                </Link>

                                                <button
                                                    onClick={toggleProjectsDropdown}
                                                    className="focus:outline-none"
                                                    type="button"
                                                    aria-expanded={!!expandedProject}
                                                    aria-label={expandedProject ? "Collapse projects" : "Expand projects"}
                                                >
                                                    {expandedProject ? (
                                                        <FiChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <FiChevronRight className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>

                                            {expandedProject && renderProjectsList(isMobile)}
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
                                        className={`${getNavItemClass(item)} rounded-lg mx-2`}
                                        onClick={() => {
                                            if (isMobileDrawerOpen) {
                                                setTimeout(() => setMobileDrawerOpen(false), 150);
                                            }
                                        }}
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
                ))
            }
        </>
    );

    const renderProjectsList = (isMobile: boolean) => (
        <div className="mt-1 mb-2">
            {projects && projects.length > 0 ? (
                <div>
                    {projects.map((project) => {
                        const isCurrentProject = project.id === currentProjectId;
                        const activeSection = getActiveSection(project.id);
                                            
                        return (
                            <div
                                key={project.id}
                                className="relative"
                            >
                                <div className="flex items-center ml-6">
                                    <button
                                        onClick={(e) => handleExpandProject(project.id, e)}
                                        className="w-5 h-5 flex items-center justify-center text-gray-400 focus:outline-none"
                                        type="button"
                                        aria-expanded={!!expandedProjectItems[project.id]}
                                        aria-label={expandedProjectItems[project.id] ? "Collapse project" : "Expand project"}
                                    >
                                        {expandedProjectItems[project.id] ? (
                                            <FiChevronDown className="w-4 h-4" />
                                        ) : (
                                            <FiChevronRight className="w-4 h-4" />
                                        )}
                                    </button>

                                    <button
                                        className={`flex items-center gap-2 py-2 pr-2 w-full text-left ${
                                            isCurrentProject
                                                ? 'text-gray-900 font-medium'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                        onClick={(e) => handleGoToProject(project.id, e)}
                                        type="button"
                                    >
                                        <FiFileText className="w-4 h-4 shrink-0" />
                                        <span className="truncate max-w-[160px] text-sm">
                                            {project.title ||
                                                `Project ${project.id.slice(0, 6)}`}
                                        </span>
                                    </button>
                                </div>

                                {expandedProjectItems[project.id] && (
                                    <div className="relative ml-9">
                                        <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-200" />
                                        {projectSections.map(
                                            (section, sectionIndex) => {
                                                const isSectionActive = activeSection === section || 
                                                    (activeSection && 
                                                        section.toLowerCase().replace(/\s+/g, '-') === 
                                                        activeSection.toLowerCase().replace(/\s+/g, '-'));
                                                    
                                                return (
                                                    <div
                                                        key={`${project.id}-${section}`}
                                                        className="flex items-center"
                                                    >
                                                        <div className="w-6 flex items-center ml-4">
                                                            <div className="w-3 h-px bg-gray-200" />
                                                        </div>

                                                        <button
                                                            className={`text-sm py-1.5 block w-full text-left ${
                                                                isSectionActive
                                                                    ? 'text-gray-900 font-medium'
                                                                    : 'text-gray-500 hover:text-gray-900'
                                                            }`}
                                                            onClick={(e) => 
                                                                handleSectionClick(
                                                                    project.id, 
                                                                    section, 
                                                                    sectionIndex, 
                                                                    e
                                                                )
                                                            }
                                                            type="button"
                                                        >
                                                            {section}
                                                        </button>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <Link
                        to="/user/project/new"
                        className="text-sm text-button-primary-100 flex items-center gap-2 pl-7 py-2 hover:underline"
                    >
                        + Create new project
                    </Link>
                </div>
            ) : (
                <div className="text-sm text-gray-500 pl-7 py-2">
                    No projects found
                </div>
            )}
        </div>
    );
    
    const { isSidebarVisible } = useSidebar();
    if (!isSidebarVisible) return null;
    
    const containerClasses = isMobileDrawerOpen
        ? "fixed inset-0 z-50 bg-black bg-opacity-50"
        : "";

    const sidebarClasses = isMobileDrawerOpen
        ? "fixed top-0 left-0 w-72 h-full z-50 bg-white shadow-lg transform transition-transform ease-in-out duration-300 translate-x-0"
        : "w-64 bg-white border-r border-gray-200 fixed h-screen flex flex-col";

    return (
        <>
            {isMobileDrawerOpen && (
                <div 
                    className={containerClasses}
                    onClick={() => setMobileDrawerOpen(false)}
                    onKeyUp={(e) => e.key === 'Escape' && setMobileDrawerOpen(false)}
                    role="presentation"
                />
            )}
            
            <div className={sidebarClasses}>
                <div className="flex-shrink-0 flex justify-between items-center py-4 mt-2 px-4">
                    <Link
                        to="/user/dashboard"
                        className="flex items-center justify-center"
                    >
                        <img src={LogoSVG} alt="Logo" className="h-10 w-auto" />
                    </Link>

                    {isMobileDrawerOpen && (
                        <button
                            type="button"
                            onClick={() => setMobileDrawerOpen(false)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            aria-label="Close sidebar"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-6 w-6" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <title>Close sidebar</title>
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M6 18L18 6M6 6l12 12" 
                                />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto">
                    {renderSidebarContent(isMobileDrawerOpen)}
                </div>

                <div className="flex-shrink-0 border-t border-gray-200 bg-white">
                    <div className="py-2">
                        {commonItems.map((item) => (
                            <Link
                                key={item.path || item.id || `common-${item.label}`}
                                to={item.path}
                                className={`flex items-center gap-3 text-sm font-medium rounded-lg py-2.5 px-3 mx-2 ${
                                    location.pathname.startsWith(item.path)
                                        ? 'bg-gray-100 text-gray-900 [&>svg]:text-orange-400'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                                onClick={() => {
                                    if (isMobileDrawerOpen) {
                                        setTimeout(() => setMobileDrawerOpen(false), 150);
                                    }
                                }}
                            >
                                {item.icon}
                                <span className="truncate">{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    {user && (
                        <div className="mx-3 my-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium text-md">
                                    {user?.firstName?.[0] || ''}
                                </div>

                                <div className="ml-3">
                                    <div className="text-gray-900 font-medium text-sm">
                                        {user?.firstName} {user?.lastName}
                                    </div>

                                    <div className="text-gray-600 text-sm truncate max-w-[120px]">
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
        </>
    );
};