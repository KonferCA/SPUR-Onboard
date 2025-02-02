import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { WalletProvider } from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';

import { AuthProvider, NotificationProvider, useAuth } from '@/contexts';

import { routeTree } from './routeTree.gen';

import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const router = createRouter({
    routeTree,
    context: {
        auth: undefined,
    },
});

function Router() {
    const auth = useAuth();
    return <RouterProvider router={router} context={{ auth }} />;
}

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
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
