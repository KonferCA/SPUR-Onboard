import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { WalletProvider } from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';

import { AuthProvider, useAuth } from '@/contexts';

import { routeTree } from './routeTree.gen';

import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Create router after auth is ready
function Router() {
    const auth = useAuth();

    const router = createRouter({
        routeTree,
        context: {
            auth,
        },
    });

    return <RouterProvider router={router} />;
}

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
    const root = createRoot(rootElement);
    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <WalletProvider>
                    <AuthProvider>
                        <Router />
                    </AuthProvider>
                </WalletProvider>
            </QueryClientProvider>
        </StrictMode>
    );
}
