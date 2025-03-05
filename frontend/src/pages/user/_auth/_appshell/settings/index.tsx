import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/user/_auth/_appshell/settings/')({
    beforeLoad: () => {
        // redirect to the profile settings page when accessing just /settings
        throw redirect({
            to: '/user/settings/profile',
            replace: true
        });
    },
});