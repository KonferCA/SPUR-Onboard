import type React from 'react';
import { type ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { PageLayout } from '@layouts';
import { LogoSVG } from '@assets';
import { FaBars, FaTimes } from 'react-icons/fa';

interface MenuItem {
    label: string;
    path: string;
    icon: ReactNode;
}

interface DashboardTemplateProps {
    children: ReactNode;
    menuItems: MenuItem[];
    logo?: ReactNode;
    navTabs?: Array<{
        label: string;
        path: string;
    }>;
    actions?: ReactNode;
    customSidebar?: ReactNode;
}

export const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
    children,
    menuItems,
    logo = (
        <Link to="/user/dashboard" className="h-8">
            <img src={LogoSVG} alt="Logo" className="h-full w-auto" />
        </Link>
    ),
    navTabs = [],
    actions,
    customSidebar,
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
        <PageLayout className="bg-gray-50">
            {/* top navbar - fixed */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
                <div className="max-w-[1440px] mx-auto px-4 md:px-6">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            {isMobile ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsMobileMenuOpen(!isMobileMenuOpen)
                                    }
                                    className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                                >
                                    <FaBars size={20} />
                                </button>
                            ) : (
                                <div>{logo}</div>
                            )}
                        </div>

                        {isMobile && (
                            <div className="absolute left-1/2 transform -translate-x-1/2">
                                {logo}
                            </div>
                        )}

                        <div className="flex items-center">
                            {!isMobile && navTabs.length > 0 && (
                                <div className="flex items-center mr-6">
                                    {navTabs.map((tab) => (
                                        <Link
                                            key={tab.path}
                                            to={tab.path}
                                            className={`px-4 py-2 text-sm font-medium ${
                                                location.pathname === tab.path
                                                    ? 'text-gray-900 border-b-2 border-gray-900'
                                                    : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                        >
                                            {tab.label}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <div
                                onKeyUp={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {actions}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* spacer for fixed header */}
            <div className="h-16" />

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
                    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                        {logo}
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {navTabs.length > 0 && (
                        <div className="border-b border-gray-200 py-2">
                            {navTabs.map((tab) => (
                                <Link
                                    key={tab.path}
                                    to={tab.path}
                                    className={`block px-6 py-2 text-sm font-medium ${
                                        location.pathname === tab.path
                                            ? 'text-gray-900 bg-gray-100'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    {tab.label}
                                </Link>
                            ))}
                        </div>
                    )}

                    <nav className="py-4">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                flex items-center gap-3 px-6 py-2 text-sm whitespace-nowrap
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
                        ))}
                    </nav>
                </div>
            )}

            {/* main content area */}
            <div className="w-full min-h-[calc(100vh_-_4rem)] max-w-[1440px] mx-auto flex flex-1">
                {!isMobile &&
                    (customSidebar || (
                        <div className="w-40 bg-white border-r border-gray-200 flex-shrink-0">
                            <nav className="sticky top-16 py-4">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`
                                    flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap rounded-lg mx-1
                                    ${
                                        location.pathname === item.path
                                            ? 'bg-gray-100 text-gray-900 font-medium [&>svg]:text-button-primary-100'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                  `}
                                    >
                                        {item.icon}

                                        <span className="truncate">
                                            {item.label}
                                        </span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    ))}

                {/* main content */}
                <main className="flex-1 p-4 md:p-6 w-full h-full">
                    {children}
                </main>
            </div>
        </PageLayout>
    );
};
