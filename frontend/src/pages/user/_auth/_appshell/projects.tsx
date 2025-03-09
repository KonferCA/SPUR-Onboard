import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/user/_auth/_appshell/projects')({
    beforeLoad: () => {
        throw redirect({ to: '/user/dashboard', replace: true });
    },
});
