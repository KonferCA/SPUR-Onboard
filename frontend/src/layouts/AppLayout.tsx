import React, { useEffect } from 'react';
import { Outlet } from '@tanstack/react-router';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/contexts/SidebarContext/SidebarContext';
import { useAuth } from '@/contexts';
import { FiMenu } from 'react-icons/fi';

interface AppLayoutProps {
    showSidebar?: boolean;
    children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
    showSidebar = true,
    children,
}) => {
    const { user, clearAuth } = useAuth();
    const { 
        isSidebarVisible, 
        isMobileDrawerOpen,
        setMobileDrawerOpen
    } = useSidebar();

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
        const handleResize = () => {
            if (window.innerWidth >= 768 && isMobileDrawerOpen) {
                setMobileDrawerOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [isMobileDrawerOpen, setMobileDrawerOpen]);

    const handleLogout = async () => {
        await clearAuth();
    };

    const shouldRenderSidebar = showSidebar && isSidebarVisible && user;

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {shouldRenderSidebar && (
                <>
                    <div className="md:hidden fixed top-4 left-4 z-40">
                        <button
                            type="button"
                            className="p-2 rounded-md bg-white shadow-md text-gray-700 hover:text-gray-900 focus:outline-none"
                            onClick={() => setMobileDrawerOpen(true)}
                            aria-label="Open sidebar"
                        >
                            <FiMenu size={24} />
                        </button>
                    </div>

                    <Sidebar
                        userPermissions={user?.permissions || 0}
                        user={user}
                        onLogout={handleLogout}
                    />
                </>
            )}

            <main className={`flex-1 overflow-auto ${shouldRenderSidebar ? 'md:ml-64' : ''}`}>
                <div className="w-full h-full">
                    {children || <Outlet />}
                </div>
            </main>
        </div>
    );
};