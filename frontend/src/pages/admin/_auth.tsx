import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { isAdmin } from '@/utils/permissions';

export const Route = createFileRoute('/admin/_auth')({
    component: RouteComponent,
    beforeLoad: ({ context, location }) => {
        const { auth } = context;

        // If no auth context or auth is loading, don't redirect yet
        if (!auth || auth.isLoading) {
            return;
        }

        // If auth is loaded and user is not logged in/admin, redirect to auth
        if (!auth.user || !isAdmin(auth.user.permissions)) {
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
