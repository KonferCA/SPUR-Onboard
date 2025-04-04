import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import {
    FiFolder,
    FiSettings,
    FiUser,
    FiCreditCard,
    FiBarChart2,
    FiDollarSign,
    FiHeadphones,
    FiSearch,
    FiBook,
    FiChevronDown,
    FiChevronRight,
    FiFileText,
    FiX,
    FiEye,
    FiKey,
    FiHome,
} from 'react-icons/fi';
import { IoLogOutOutline } from 'react-icons/io5';
import { isAdmin, isInvestor } from '@/utils/permissions';
import { Button } from '@/components';
import { LogoSVG } from '@/assets';
import { listProjects } from '@/services/project';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts';
import { useNotification } from '@/contexts/NotificationContext';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useSidebar } from '@/contexts/SidebarContext/SidebarContext';
import { isRouteAvailable } from '@/config/routes';
import type { MenuItem, SidebarProps } from '@/types/sidebar';
import type { ProjectResponse } from '@/types/project';

export const Sidebar = ({ userPermissions, user, onLogout }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { accessToken } = useAuth();
    const { push } = useNotification();
    const {
        currentProjectId,
        projectConfig,
        isMobileDrawerOpen,
        setMobileDrawerOpen,
    } = useSidebar();

    const [expandedProject, setExpandedProject] = useState<string | null>(null);
    const [expandedProjectItems, setExpandedProjectItems] = useState<
        Record<string, boolean>
    >({});
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const manuallyCollapsedRef = useRef(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const hasAdminPerms = isAdmin(userPermissions);
    const hasInvestorPerms = isInvestor(userPermissions);

    const { data: projects = [], refetch: refetchProjects } = useQuery({
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
            path: '/user/home',
            label: 'Home',
            icon: <FiHome className="w-5 h-5" />,
            id: 'my-home',
        },
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
            path: '/admin/settings/permissions',
            label: 'Manage Permissions',
            icon: <FiKey className="w-5 h-5" />,
            id: 'admin-permissions',
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

    if (hasInvestorPerms || hasAdminPerms) {
        sections.push({
            title: 'INVESTOR',
            id: 'investor',
            items: [...investorItems],
        });
    }

    if (hasAdminPerms) {
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
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                const matchingSection = projectSections.find(
                    (s) => s.toLowerCase().replace(/\s+/g, '-') === section
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
            location.pathname.startsWith(item.path) ||
            isExpanded;

        if (isActive) {
            baseClass += ' bg-gray-100 text-gray-900 [&>svg]:text-orange-400';
        } else {
            baseClass += ' text-gray-600 hover:bg-gray-50 hover:text-gray-900';
        }

        if (!isRouteAvailable(item.path)) {
            baseClass += ' opacity-70 cursor-not-allowed';
        }

        return baseClass;
    };

    const handleNavigate = (e: React.MouseEvent, path: string) => {
        e.preventDefault();

        if (!isRouteAvailable(path)) {
            push({
                message: 'This page is coming soon!',
                level: 'info',
            });
            return;
        }

        navigate({ to: path });

        if (isMobileDrawerOpen) {
            setTimeout(() => setMobileDrawerOpen(false), 150);
        }
    };

    const toggleProjectsDropdown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setExpandedProject(expandedProject ? null : 'show-all');
    };

    const navigateToProject = useCallback(
        (projectId: string, section?: string, project?: ProjectResponse) => {
            const isSubmitted =
                project?.status === 'SUBMITTED' ||
                project?.status === 'UNDER_REVIEW' ||
                project?.status === 'APPROVED';

            const searchParams = section
                ? { section: section.toLowerCase().replace(/\s+/g, '-') }
                : undefined;

            navigate({
                to: `/user/project/${projectId}/${isSubmitted ? 'view' : 'form'}`,
                search: searchParams,
                replace: true,
            });
        },
        [navigate]
    );

    const handleSectionClick = (
        project: ProjectResponse,
        section: string,
        sectionIndex: number,
        e: React.MouseEvent
    ) => {
        e.preventDefault();
        e.stopPropagation();

        setExpandedProjectItems({
            [project.id]: true,
        });

        const isSubmitted =
            project?.status === 'SUBMITTED' ||
            project?.status === 'UNDER_REVIEW' ||
            project?.status === 'APPROVED';

        if (projectConfig?.sectionClickHandler && !isSubmitted) {
            projectConfig.sectionClickHandler(
                project.id,
                section,
                sectionIndex
            );
        } else {
            navigateToProject(project.id, section, project);
        }

        if (isMobileDrawerOpen) {
            setTimeout(() => setMobileDrawerOpen(false), 150);
        }
    };

    const handleExpandProject = (projectId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        const project = projects.find((p) => p.id === projectId);

        setExpandedProjectItems((prev) => {
            if (prev[projectId]) {
                const newState = { ...prev };
                delete newState[projectId];
                manuallyCollapsedRef.current = true;

                setTimeout(() => {
                    manuallyCollapsedRef.current = false;
                }, 500);

                return newState;
            }

            return { [projectId]: true };
        });

        if (projectId !== currentProjectId && project) {
            if (projectConfig?.sections && projectConfig.sections.length > 0) {
                navigateToProject(
                    projectId,
                    projectConfig.sections[0],
                    project
                );
            } else {
                navigateToProject(projectId, undefined, project);
            }

            if (isMobileDrawerOpen) {
                setTimeout(() => setMobileDrawerOpen(false), 150);
            }
        }

        e.nativeEvent.stopImmediatePropagation();
    };

    const handleLogout = async () => {
        setShowLogoutModal(false);
        if (onLogout) {
            await onLogout();
        } else {
            navigate({ to: '/auth' });
        }
    };

    const handleCreateNewProject = (e: React.MouseEvent) => {
        e.preventDefault();

        navigate({ to: '/user/project/new' });

        if (!expandedProject) {
            setExpandedProject('show-all');
        }

        setTimeout(() => {
            refetchProjects();
        }, 1000);

        if (isMobileDrawerOpen) {
            setTimeout(() => setMobileDrawerOpen(false), 150);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isMobileDrawerOpen &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target as Node)
            ) {
                setMobileDrawerOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileDrawerOpen, setMobileDrawerOpen]);

    useEffect(() => {
        if (isMobileDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileDrawerOpen]);

    useEffect(() => {
        return () => {
            if (isMobileDrawerOpen) {
                setMobileDrawerOpen(false);
            }
        };
    }, [isMobileDrawerOpen, setMobileDrawerOpen]);

    useEffect(() => {
        const isProjectPage = location.pathname.includes('/project/');
        const isNewProject = location.pathname.includes('/project/new');

        if (isProjectPage) {
            refetchProjects();

            if (isNewProject && !expandedProject) {
                setExpandedProject('show-all');
            }
        }
    }, [location.pathname, expandedProject, refetchProjects]);

    useEffect(() => {
        if (
            currentProjectId &&
            !expandedProjectItems[currentProjectId] &&
            !manuallyCollapsedRef.current &&
            expandedProject
        ) {
            setExpandedProjectItems({
                [currentProjectId]: true,
            });
        }
    }, [currentProjectId, expandedProjectItems, expandedProject]);

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
            (item) => item.id === 'settings'
        );

        if (settingsIndex !== -1) {
            navItems.splice(settingsIndex + 1, 0, ...settingsItems);
        }
    }

    const renderSidebarContent = () => (
        <>
            {navItems
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
                                    <a
                                        href={item.path}
                                        className="flex-1 flex items-center gap-3"
                                        onClick={(e) =>
                                            handleNavigate(e, item.path)
                                        }
                                    >
                                        <span
                                            className={
                                                isProjectsActive
                                                    ? 'text-orange-400'
                                                    : ''
                                            }
                                        >
                                            {item.icon}
                                        </span>

                                        <span className="truncate">
                                            {item.label}
                                        </span>
                                    </a>

                                    <button
                                        onClick={toggleProjectsDropdown}
                                        className="focus:outline-none"
                                        type="button"
                                        aria-expanded={!!expandedProject}
                                        aria-label={
                                            expandedProject
                                                ? 'Collapse projects'
                                                : 'Expand projects'
                                        }
                                    >
                                        {expandedProject ? (
                                            <FiChevronDown className="w-4 h-4" />
                                        ) : (
                                            <FiChevronRight className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                {expandedProject && renderProjectsList()}
                            </div>
                        );
                    }

                    return (
                        <a
                            key={item.path || item.id || `item-${item.label}`}
                            href={item.path}
                            className={`${getNavItemClass(item)} rounded-lg mx-2`}
                            onClick={(e) => handleNavigate(e, item.path)}
                        >
                            {item.icon}
                            <span className="truncate">{item.label}</span>
                        </a>
                    );
                })}
        </>
    );

    const renderProjectsList = () => (
        <div className="mt-1 mb-2">
            {projects && projects.length > 0 ? (
                <div>
                    {projects.map((project) => {
                        const isCurrentProject =
                            project.id === currentProjectId;
                        const activeSection = getActiveSection(project.id);
                        const isSubmitted = project.status === 'SUBMITTED';

                        return (
                            <div key={project.id} className="relative">
                                <div className="flex items-center ml-6">
                                    <button
                                        onClick={(e) =>
                                            handleExpandProject(project.id, e)
                                        }
                                        className="w-5 h-5 flex items-center justify-center text-gray-400 focus:outline-none"
                                        type="button"
                                        aria-expanded={
                                            !!expandedProjectItems[project.id]
                                        }
                                        aria-label={
                                            expandedProjectItems[project.id]
                                                ? 'Collapse project'
                                                : 'Expand project'
                                        }
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
                                                ? 'text-gray-900 font-medium [&>svg]:text-orange-400'
                                                : 'text-gray-600 hover:text-gray-900 '
                                        }`}
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            if (
                                                project.id !== currentProjectId
                                            ) {
                                                if (
                                                    projectConfig?.sections &&
                                                    projectConfig.sections
                                                        .length > 0
                                                ) {
                                                    navigateToProject(
                                                        project.id,
                                                        projectConfig
                                                            .sections[0],
                                                        project
                                                    );
                                                } else {
                                                    navigateToProject(
                                                        project.id,
                                                        undefined,
                                                        project
                                                    );
                                                }

                                                setExpandedProjectItems({
                                                    [project.id]: true,
                                                });

                                                if (isMobileDrawerOpen) {
                                                    setTimeout(
                                                        () =>
                                                            setMobileDrawerOpen(
                                                                false
                                                            ),
                                                        150
                                                    );
                                                }
                                            }
                                        }}
                                        type="button"
                                    >
                                        {isSubmitted ? (
                                            <FiEye
                                                className={`w-4 h-4 shrink-0 ${isCurrentProject ? 'text-orange-400' : ''}`}
                                            />
                                        ) : (
                                            <FiFileText
                                                className={`w-4 h-4 shrink-0 ${isCurrentProject ? 'text-orange-400' : ''}`}
                                            />
                                        )}
                                        <span className="truncate max-w-[160px] text-sm">
                                            {project.title ||
                                                `Project ${project.id.slice(0, 6)}`}
                                        </span>
                                        {isSubmitted && (
                                            <span className="ml-1 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                                Submitted
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {expandedProjectItems[project.id] && (
                                    <div className="relative ml-9">
                                        <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-200" />
                                        {projectSections.map(
                                            (section, sectionIndex) => {
                                                const isSectionActive =
                                                    activeSection === section ||
                                                    (activeSection &&
                                                        section
                                                            .toLowerCase()
                                                            .replace(
                                                                /\s+/g,
                                                                '-'
                                                            ) ===
                                                            activeSection
                                                                .toLowerCase()
                                                                .replace(
                                                                    /\s+/g,
                                                                    '-'
                                                                ));

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
                                                            } ${isSubmitted ? 'flex items-center gap-1' : ''}`}
                                                            onClick={(e) =>
                                                                handleSectionClick(
                                                                    project,
                                                                    section,
                                                                    sectionIndex,
                                                                    e
                                                                )
                                                            }
                                                            type="button"
                                                        >
                                                            {isSubmitted && (
                                                                <FiEye className="w-3 h-3 text-gray-400" />
                                                            )}
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

                    <a
                        href="/user/project/new"
                        className="text-sm text-button-primary-100 flex items-center gap-2 pl-7 py-2 hover:underline"
                        onClick={handleCreateNewProject}
                    >
                        + Create new project
                    </a>
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

    return (
        <>
            {isMobileDrawerOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden transition-opacity duration-300"
                    onClick={(e) => {
                        e.stopPropagation();
                        setMobileDrawerOpen(false);
                    }}
                    onKeyDown={(e) => {
                        if (
                            e.key === 'Enter' ||
                            e.key === ' ' ||
                            e.key === 'Escape'
                        ) {
                            e.stopPropagation();
                            setMobileDrawerOpen(false);
                        }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label="Close menu"
                />
            )}

            <div
                ref={sidebarRef}
                className={`fixed top-0 left-0 h-full z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out 
                           shadow-lg md:shadow-none 
                           md:w-64 ${isMobileDrawerOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full md:translate-x-0'}`}
                style={{
                    transform: isMobileDrawerOpen
                        ? 'translateX(0) !important'
                        : '',
                }}
            >
                <div className="relative flex items-center justify-center px-4 mt-6 pb-6 border-b border-gray-200">
                    <a
                        href="/user/home"
                        className="flex items-center justify-center"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate({ to: '/user/home' });

                            if (isMobileDrawerOpen) {
                                setTimeout(
                                    () => setMobileDrawerOpen(false),
                                    150
                                );
                            }
                        }}
                    >
                        <img src={LogoSVG} alt="Logo" className="w-12 h-12" />
                    </a>
                    <button
                        type="button"
                        className="absolute right-4 md:hidden text-gray-500 hover:text-gray-700"
                        onClick={() => setMobileDrawerOpen(false)}
                        aria-label="Close sidebar"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-col h-[calc(100%-64px)]">
                    <div className="flex-grow overflow-y-auto mb-6">
                        {renderSidebarContent()}
                    </div>

                    <div className="flex-shrink-0 border-t border-gray-200 bg-white mb-6">
                        <div className="mt-3">
                            {commonItems.map((item) => (
                                <a
                                    key={
                                        item.path ||
                                        item.id ||
                                        `common-${item.label}`
                                    }
                                    href={item.path}
                                    className={`flex items-center gap-3 text-sm font-medium rounded-lg py-2.5 px-3 mx-2 ${
                                        location.pathname.startsWith(item.path)
                                            ? 'bg-gray-100 text-gray-900 [&>svg]:text-orange-400'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    } ${!isRouteAvailable(item.path) ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    onClick={(e) =>
                                        handleNavigate(e, item.path)
                                    }
                                >
                                    {item.icon}
                                    <span className="truncate">
                                        {item.label}
                                    </span>
                                </a>
                            ))}
                        </div>

                        {user && (
                            <div className="mx-3 my-3 p-3 mb-6 bg-blue-50 rounded-lg flex items-center justify-between">
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
                                    icon={
                                        <IoLogOutOutline className="w-6 h-6" />
                                    }
                                />
                            </div>
                        )}
                    </div>
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
