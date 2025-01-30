import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/user/_auth')({
    component: RouteComponent,
    beforeLoad: ({ context, location }) => {
        // If auth context is not ready yet, don't redirect
        if (!context.auth) {
            return;
        }

        // If auth is ready but user is not logged in, redirect
        if (!context.auth.user && !context.auth.isLoading) {
            throw redirect({
                to: '/auth',
                search: {
                    redirect: location.href,
                },
            });
        }
    },
});

function RouteComponent() {
    return <Outlet />;
}
