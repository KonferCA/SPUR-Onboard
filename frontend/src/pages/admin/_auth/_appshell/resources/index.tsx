import { createFileRoute } from '@tanstack/react-router';
import { usePageTitle } from '@/utils';

export const Route = createFileRoute('/admin/_auth/_appshell/resources/')({
    component: RouteComponent,
});

function RouteComponent() {
    // set admin resources page title
    usePageTitle('Admin Resources');

    return <div>Hello "/admin/_auth/_appshell/resources/"!</div>;
}
