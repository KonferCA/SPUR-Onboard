import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/signout')({
    component: RouteComponent,
    beforeLoad: async ({ context }) => {
        // Only logout if user is logged in
        if (context?.auth?.user) {
            await context.auth.clearAuth();
        }
        throw redirect({ to: '/auth' });
    },
});

function RouteComponent() {
    return <div>Hello "/signout"!</div>;
}
