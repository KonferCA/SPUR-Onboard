import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { isAdmin } from '@/utils/permissions';

export const Route = createFileRoute('/admin/_auth')({
    component: RouteComponent,
    beforeLoad: ({ context, location }) => {
        if (
            !context.auth ||
            !context.auth.user ||
            !isAdmin(context.auth.user.permissions)
        ) {
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
