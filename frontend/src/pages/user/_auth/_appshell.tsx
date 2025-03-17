import { useState, useEffect, useRef } from 'react';
import {
    createFileRoute,
    Outlet,
    useLocation,
    useNavigate,
} from '@tanstack/react-router';
import { DashboardTemplate } from '@/templates';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts';
import { Sidebar } from '@/components/Sidebar';

const AVAILABLE_ROUTES = {
    // main routes
    '/user/dashboard': true,
    '/user/browse': false,
    '/user/resources': false,

    // investor routes
    '/user/investor/investments': false,
    '/user/investor/statistics': false,

    // admin routes
    '/user/admin/permissions': false,

    // settings and support
    '/user/settings/profile': true,
    '/user/settings/wallet': true,
    '/user/support': false,
};

// route guard
export const isRouteAvailable = (path: keyof typeof AVAILABLE_ROUTES) => {
    return AVAILABLE_ROUTES[path] !== false;
};

export const Route = createFileRoute('/user/_auth/_appshell')({
    component: RouteComponent,
    beforeLoad: ({ location }) => {
        return {
            path: location.pathname,
        };
    },
});

function RouteComponent() {
    const location = useLocation();
    const navigate = useNavigate();
    const notification = useNotification();
    const { user, clearAuth } = useAuth();
    const [isMobile, setIsMobile] = useState(false);
    const lastValidPathRef = useRef<string>('/user/dashboard');

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const currentPath = location.pathname;
        const routeExists = isRouteAvailable(
            currentPath as keyof typeof AVAILABLE_ROUTES
        );

        if (routeExists && currentPath !== '/user/_auth/_appshell') {
            lastValidPathRef.current = currentPath;
        }

        if (!routeExists) {
            notification.push({
                message: 'This page is coming soon!',
                level: 'info',
                autoClose: true,
                duration: 5000,
            });

            navigate({
                to: lastValidPathRef.current,
                replace: true,
            });
        }
    }, [location.pathname, notification, navigate]);

    const handleLogout = async () => {
        await clearAuth();

        navigate({ to: '/auth' });
    };

    const customSidebar = user ? (
        <div className="relative">
            <Sidebar
                userPermissions={user.permissions}
                isMobile={false}
                user={user}
                onLogout={handleLogout}
            />
        </div>
    ) : null;

    const getMobileMenuItems = () => {
        if (!user) {
            return [];
        }

        return [];
    };

    const customMobileSidebar = user ? (
        <Sidebar
            userPermissions={user.permissions}
            isMobile={true}
            user={user}
            onLogout={handleLogout}
        />
    ) : null;

    return (
        <DashboardTemplate
            menuItems={getMobileMenuItems()}
            customSidebar={customSidebar}
            customMobileSidebar={customMobileSidebar}
        >
            <div className={`${!isMobile ? 'ml-60' : ''}`}>
                <Outlet />
            </div>
        </DashboardTemplate>
    );
}
