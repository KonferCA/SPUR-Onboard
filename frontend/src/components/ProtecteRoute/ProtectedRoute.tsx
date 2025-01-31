import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'startup_owner' | 'admin' | 'investor';
    requireEmailVerified?: boolean;
}

export function ProtectedRoute({
    children,
    requiredRole,
    requireEmailVerified = true,
}: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !user) {
            navigate({ to: '/auth', replace: true });
            return;
        }

        if (!isLoading && user) {
            // Check role requirements if specified
            if (requiredRole && user.role !== requiredRole) {
                navigate({ to: '/auth', replace: true });
                return;
            }

            // Check email verification if required
            if (requireEmailVerified && !user.emailVerified) {
                navigate({
                    to: '/auth',
                    replace: true,
                    state: { step: 'verify-email', email: user.email },
                });
                return;
            }
        }
    }, [isLoading, user, requiredRole, requireEmailVerified, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (!user) return null;

    if (requiredRole && user.role !== requiredRole) return null;

    if (requireEmailVerified && !user.emailVerified) return null;

    return <>{children}</>;
}

