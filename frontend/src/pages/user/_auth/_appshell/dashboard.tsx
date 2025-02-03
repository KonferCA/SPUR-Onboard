import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/user/_auth/_appshell/dashboard')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div>
            <div>
                <nav></nav>
            </div>
            <div>
                <main></main>
            </div>
        </div>
    );
}
