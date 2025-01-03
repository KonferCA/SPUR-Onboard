import type { AuthState } from '@/contexts';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

interface RouterWithContext {
    auth?: AuthState;
}

export const Route = createRootRouteWithContext<RouterWithContext>()({
    component: () => (
        <>
            <Outlet />
            <TanStackRouterDevtools />
        </>
    ),
});
