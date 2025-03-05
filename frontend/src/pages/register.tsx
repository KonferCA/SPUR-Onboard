import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/register')({
    component: RouteComponent,
    beforeLoad: () => {
        throw redirect({
            to: '/auth',
            search: {
                form: 'register',
            },
        });
    },
});

function RouteComponent() {
    return <div>Hello "/register"!</div>;
}
