import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useLocation } from '@tanstack/react-router';
import { useSidebar } from '@/contexts/SidebarContext/SidebarContext';
import { useEffect } from 'react';
import { AppLayout } from '@/layouts/AppLayout';

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
    loader: async () => {
        return {
            stable: true,
        };
    },
});

function RouteComponent() {
    const location = useLocation();

    const { setCurrentProjectId } = useSidebar();

    useEffect(() => {
        const match = location.pathname.match(/\/project\/([^/]+)/);
        setCurrentProjectId(match ? match[1] : undefined);
    }, [location.pathname, setCurrentProjectId]);

    return (
        <AppLayout showSidebar={true}>
            <Outlet />
        </AppLayout>
    );
}