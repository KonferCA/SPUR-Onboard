import { createFileRoute } from '@tanstack/react-router';
import { DashboardFrame } from '@/layouts/DashboardFrame';

export const Route = createFileRoute('/dashboard/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div>
            <DashboardFrame>
                <h1 className="text-2xl font-semibold">Dashboard</h1>
            </DashboardFrame>
        </div>
    );
};
