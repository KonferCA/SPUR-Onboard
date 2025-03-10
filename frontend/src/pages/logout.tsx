import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/logout')({
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
    return <div>Hello "/logout"!</div>;
}
