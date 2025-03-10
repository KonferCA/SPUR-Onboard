import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { WalletProvider } from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';

import { AuthProvider, NotificationProvider, useAuth } from '@/contexts';

import { routeTree } from './routeTree.gen';

import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotFound } from '@components';

const queryClient = new QueryClient();

function Router() {
    const auth = useAuth();

    if (auth.isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    // Only create/update router after auth is loaded
    const router = createRouter({
        routeTree,
        context: {
            auth,
        },
        defaultNotFoundComponent: NotFound,
    });

    return <RouterProvider router={router} context={{ auth }} />;
}

// Render the app
const rootElement = document.getElementById('root');
if (rootElement && !rootElement.innerHTML) {
    const root = createRoot(rootElement);
    root.render(
        <StrictMode>
            <NotificationProvider>
                <QueryClientProvider client={queryClient}>
                    <WalletProvider>
                        <AuthProvider>
                            <Router />
                        </AuthProvider>
                    </WalletProvider>
                </QueryClientProvider>
            </NotificationProvider>
        </StrictMode>
    );
}
