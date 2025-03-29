import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useLocation } from '@tanstack/react-router';
import { useSidebar } from '@/contexts/SidebarContext/SidebarContext';
import { useEffect } from 'react';
import { AppLayout } from '@/layouts/AppLayout';

export const Route = createFileRoute('/admin/_auth/_appshell')({
    component: AdminAppShellComponent,
    beforeLoad: ({ location }) => {
        return {
            path: location.pathname,
        };
    },
});

function AdminAppShellComponent() {
    const location = useLocation();
    const { setCurrentProjectId } = useSidebar();

    useEffect(() => {
        const match = location.pathname.match(/\/projects\/([^/]+)/);
        setCurrentProjectId(match ? match[1] : undefined);
    }, [location.pathname, setCurrentProjectId]);

    return (
        <AppLayout showSidebar={true}>
            <Outlet />
        </AppLayout>
    );
}
