import React, { useState } from 'react';
import { NavItem, SidebarItem, DashboardLayoutProps } from "./types";

const adminNavItems: NavItem[] = [
    { label: 'Submitted', href: '/admin/submitted' },
    { label: 'Approved', href: '/admin/approved' },
    { label: 'Rejected', href: '/admin/rejected' },
];
  
const userNavItems: NavItem[] = [
    { label: 'All Projects', href: '/projects' },
    { label: 'Drafts', href: '/drafts' },
];
  
const adminSidebarItems: SidebarItem[] = [
    { label: 'Projects', href: '/admin/projects' },
    { label: 'Statistics', href: '/admin/statistics' },
    { label: 'Resources', href: '/admin/resources' },
];
  
const userSidebarItems: SidebarItem[] = [
    { label: 'Projects', href: '/projects' },
    { label: 'Resources', href: '/resources' },
];

const Tooltip: React.FC<{ message: string }> = ({ message }) => (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-800 text-white text-sm rounded shadow-lg whitespace-nowrap z-50">
        {message}
        <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
    </div>
);
  
export const DashboardFrame: React.FC<DashboardLayoutProps> = ({ 
    isAdmin = false,
    isVerified = false,
    isAccepted = false,
    children 
}) => {
    const navItems = isAdmin ? adminNavItems : userNavItems;
    const sidebarItems = isAdmin ? adminSidebarItems : userSidebarItems;
    
    const [activeNav, setActiveNav] = useState(navItems[0].href);
    const [activeSidebar, setActiveSidebar] = useState(sidebarItems[0].href);
    const [showTooltip, setShowTooltip] = useState(false);

    const handleNavClick = (href: string, e: React.MouseEvent) => {
        e.preventDefault();
        setActiveNav(href);
    };

    const handleSidebarClick = (href: string, e: React.MouseEvent) => {
        e.preventDefault();
        setActiveSidebar(href);
    };

    const getSubmitButtonState = () => {
        if (!isVerified) {
            return {
                disabled: true,
                className: "px-4 py-2 bg-gray-400 text-gray-600 rounded cursor-not-allowed",
                text: "Submit a project",
                tooltipMessage: "Account not verified"
            };
        } else if (isAccepted === false) {
            return {
                disabled: true,
                className: "px-4 py-2 bg-gray-400 text-gray-600 rounded cursor-not-allowed",
                text: "Submit a project",
                tooltipMessage: "Account has been rejected"
            };
        } else {
            return {
                disabled: false,
                className: "px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700",
                text: "Submit a project",
                tooltipMessage: ""
            };
        }
    };

    const submitButtonState = getSubmitButtonState();
  
    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-gray-400 p-4">
                <div className="flex items-center justify-between">
                    <div className="text-xl font-normal ml-5">
                        Logo    
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-gray-500"></div>
                        <button className="p-1">
                            <svg
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>
  
            <div className="flex">
                <aside className="w-64 bg-gray-200 min-h-screen p-4">
                    {sidebarItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            onClick={(e) => handleSidebarClick(item.href, e)}
                            className={`block py-2 px-4 rounded mb-1 transition-colors duration-150
                                ${activeSidebar === item.href 
                                    ? 'bg-gray-400' 
                                    : 'hover:bg-gray-400'}`}
                        >
                            {item.label}
                        </a>
                    ))}
                </aside>
  
                <main className="flex-1 p-8">
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex space-x-4">
                            {navItems.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    onClick={(e) => handleNavClick(item.href, e)}
                                    className={`px-4 py-2 transition-colors duration-150
                                        ${activeNav === item.href 
                                            ? 'rounded bg-gray-300' 
                                            : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                
                        <div className="flex items-center space-x-4">
                            {isAdmin && (
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search Projects"
                                        className="pl-10 pr-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-gray-500"
                                    />
                                </div>
                            )}
                    
                            {!isAdmin && (
                                <div 
                                    className="relative"
                                    onMouseEnter={() => setShowTooltip(true)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                >
                                    <button
                                        disabled={submitButtonState.disabled}
                                        className={submitButtonState.className}
                                    >
                                        {submitButtonState.text}
                                    </button>
                                    {showTooltip && submitButtonState.disabled && (
                                        <Tooltip message={submitButtonState.tooltipMessage} />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <hr className="border border-gray-300 mb-4" />
                    
                    {children}
                </main>
            </div>
        </div>
    );
};