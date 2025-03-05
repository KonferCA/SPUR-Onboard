import { AppEnv } from '@/constants/env';
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
            {import.meta.env.VITE_APP_ENV === AppEnv.Development && (
                <TanStackRouterDevtools />
            )}
        </>
    ),
});
