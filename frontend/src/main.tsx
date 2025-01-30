import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';

import { AuthProvider, useAuth } from '@/contexts';

import { routeTree } from './routeTree.gen';

import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const router = createRouter({
    routeTree,
    context: {
        // starts as undefined but gets passed down afterwards
        auth: undefined,
    },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

function InnerApp() {
    const auth = useAuth();
    return <RouterProvider router={router} context={{ auth }} />;
}

const queryClient = new QueryClient();

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
    const root = createRoot(rootElement);
    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <InnerApp />
                </AuthProvider>
            </QueryClientProvider>
        </StrictMode>
    );
}
