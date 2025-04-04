import {
    Outlet,
    createFileRoute,
    useNavigate,
    useLocation,
} from '@tanstack/react-router';
import { useEffect } from 'react';
import { usePageTitle } from '@/utils';

export const Route = createFileRoute('/user/_auth/_appshell/settings')({
    component: SettingsLayout,
});

function SettingsLayout() {
    // set settings page title
    usePageTitle('Settings');

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.pathname === '/user/settings') {
            navigate({ to: '/user/settings/profile' });
        }
    }, [location.pathname, navigate]);

    return (
        <div className="flex flex-col justify-between min-h-screen">
            <div className="p-6 pt-20 max-w-6xl mx-auto w-full">
                <Outlet />
            </div>
        </div>
    );
}
