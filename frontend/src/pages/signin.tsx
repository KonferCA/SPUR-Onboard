import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/signin')({
    component: RouteComponent,
    beforeLoad: () => {
        throw redirect({
            to: '/auth',
            search: {
                form: 'login',
            },
        });
    },
});

function RouteComponent() {
    return <div>Hello "/signin"!</div>;
}
