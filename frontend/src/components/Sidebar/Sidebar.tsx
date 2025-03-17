import type { ReactNode } from 'react';
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
} from 'react-icons/fi';
import { IoLogOutOutline } from 'react-icons/io5';
import { isAdmin, isInvestor } from '@/utils/permissions';
import { Button } from '@/components';
import type { User } from '@/types';
import { LogoSVG } from '@/assets';

export interface SidebarProps {
    userPermissions: number;
    isMobile?: boolean;
    user?: User;
    onLogout?: () => Promise<void>;
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
}: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();

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

    const getNavItemClass = (item: MenuItem) => {
        let baseClass =
            'flex items-center gap-3 text-sm font-medium rounded-lg';

        if (item.isSubmenu) {
            baseClass += ' pl-8';
        }

        const isActive =
            (item.path === '/user/dashboard' &&
                location.pathname.startsWith('/user/dashboard')) ||
            (item.path === '/user/settings/profile' &&
                location.pathname.startsWith('/user/settings')) ||
            location.pathname === item.path;

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

    return (
        <div
            className={`${isMobile ? 'w-64' : 'w-60'} bg-white border-r border-gray-200 fixed h-screen flex flex-col`}
        >
            <div className="flex justify-center items-center py-4">
                <Link
                    to="/user/dashboard"
                    className="flex items-center justify-center"
                >
                    <img 
                        src={LogoSVG}
                        alt="Logo" 
                        className="h-8 w-auto" 
                    />
                </Link>
            </div>

            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto">
                    {isMobile ? (
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
                    ) : (
                        <>
                            {sections.map((section) => (
                                <div
                                    key={
                                        section.id || `section-${section.title}`
                                    }
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
                    )}
                </div>

                <div className="pt-2 mb-4">
                    {commonItems.map((item) => (
                        <Link
                            key={item.path || item.id || `common-${item.label}`}
                            to={item.path}
                            className={getNavItemClass(item)}
                        >
                            {item.icon}

                            <span className="truncate">
                                {item.label}
                            </span>
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
                                onClick={async () => {
                                    // todo: implement nice modal here
                                    if (
                                        window.confirm(
                                            'Are you sure you want to logout?'
                                        )
                                    ) {
                                        if (onLogout) {
                                            await onLogout();
                                        } else {
                                            navigate({ to: '/auth' });
                                        }
                                    }
                                }}
                                className="!border-0 !p-2 hover:bg-gray-200"
                                icon={<IoLogOutOutline className="w-6 h-6" />}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
