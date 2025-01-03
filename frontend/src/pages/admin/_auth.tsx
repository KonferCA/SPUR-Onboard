import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_auth')({
    component: RouteComponent,
    beforeLoad: ({ context, location }) => {
        if (
            !context.auth ||
            !context.auth.user ||
            context.auth.user.role !== 'admin'
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
