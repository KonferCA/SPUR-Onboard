import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { isAdmin } from '@/utils/permissions';

export const Route = createFileRoute('/admin/_auth')({
    component: RouteComponent,
    beforeLoad: ({ context, location }) => {
        const { auth } = context;
        
        // If auth is not ready or user is not logged in/admin, redirect to auth
        if (!auth?.user || !isAdmin(auth.user.permissions)) {
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
