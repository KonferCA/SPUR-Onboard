import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/login')({
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
    return <div>Hello "/login"!</div>;
}
