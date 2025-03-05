import { createFileRoute, redirect } from '@tanstack/react-router';

// Placeholder route that redirects /user to /user/dashboard
export const Route = createFileRoute('/user/')({
    component: RouteComponent,
    beforeLoad: () => {
        throw redirect({
            to: '/user/dashboard',
        });
    },
});

function RouteComponent() {
    return <div>Hello "/user/"!</div>;
}
