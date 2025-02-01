import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/user/settings')({
    component: SettingsRoot,
});

function SettingsRoot() {
    return <Outlet />;
} 