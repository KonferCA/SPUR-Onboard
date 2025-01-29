import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/user/_auth/_appshell/dashboard')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div>
            Hello "/user/dashbaord"!
            <Link to="/user/project/new">project new</Link>
        </div>
    );
}
