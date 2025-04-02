import type React from 'react';
import { type ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { PageLayout } from '@layouts';
import { FaBars, FaTimes } from 'react-icons/fa';

interface MenuItem {
    label: string;
    path: string;
    icon: ReactNode;
    isSeparator?: boolean;
    isSubmenu?: boolean;
    id?: string;
}

interface DashboardTemplateProps {
    children: ReactNode;
    menuItems: MenuItem[];
    customSidebar?: ReactNode;
    customMobileSidebar?: ReactNode;
}

export const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
    children,
    menuItems,
    customSidebar,
    customMobileSidebar,
}) => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);

            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };

        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // biome-ignore lint/correctness/useExhaustiveDependencies: no need to declare all dependencies
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <PageLayout className="bg-gray-50 min-h-screen flex flex-col">
            {isMobile && (
                <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                    <FaBars size={20} />
                </button>
            )}

            {isMobile && isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                    onKeyUp={() => setIsMobileMenuOpen(false)}
                />
            )}

            {isMobile && (
                <div
                    className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-lg ${
                        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="flex items-center justify-end h-16 px-4 border-b border-gray-200">
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    <div className="h-[calc(100%-4rem)] overflow-y-auto">
                        {customMobileSidebar ? (
                            customMobileSidebar
                        ) : (
                            <nav className="py-4">
                                {menuItems.map((item) => {
                                    if (item.isSeparator) {
                                        return (
                                            <div
                                                key={
                                                    item.id ||
                                                    `separator-${item.label || item.path}`
                                                }
                                                className="border-t border-gray-200 my-4"
                                            />
                                        );
                                    }

                                    return (
                                        <Link
                                            key={
                                                item.id ||
                                                item.path ||
                                                `item-${item.label}`
                                            }
                                            to={item.path}
                                            className={`
                                            flex items-center gap-3 px-6 py-2 text-sm whitespace-nowrap
                                            ${item.isSubmenu ? 'pl-10' : ''}
                                            ${
                                                location.pathname === item.path
                                                    ? 'text-gray-900 bg-gray-100 font-medium [&>svg]:text-button-primary-100'
                                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                            }
                                        `}
                                        >
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        )}
                    </div>
                </div>
            )}

            <div className="w-full flex-grow max-w-screen mx-auto flex flex-1">
                {!isMobile && (
                    <div className="flex-shrink-0">{customSidebar}</div>
                )}

                <main
                    className={`flex-1 w-full min-h-screen ${!isMobile ? '' : ''}`}
                >
                    {children}
                </main>
            </div>
        </PageLayout>
    );
};
