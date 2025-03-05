import { createFileRoute, redirect } from '@tanstack/react-router';

// Placeholder route that redirects /admin to /admin/dashboard
export const Route = createFileRoute('/admin/')({
    component: RouteComponent,
    beforeLoad: () => {
        throw redirect({
            to: '/admin/dashboard',
        });
    },
});

function RouteComponent() {
    return <div>Hello "/user/"!</div>;
}
