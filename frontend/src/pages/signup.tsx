import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/signup')({
    component: RouteComponent,
    beforeLoad: () => {
        throw redirect({
            to: '/auth',
        });
    },
});

function RouteComponent() {
    return <div>Hello "/signup"!</div>;
}
