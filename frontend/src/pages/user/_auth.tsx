import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/user/_auth')({
    component: RouteComponent,
    beforeLoad: ({ context, location }) => {
        if (
            !context.auth ||
            !context.auth.user ||
            !context.auth.user.firstName ||
            !context.auth.user.lastName ||
            !context.auth.companyId
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
