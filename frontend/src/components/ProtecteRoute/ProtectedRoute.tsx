import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { hasAllPermissions } from '@/utils/permissions';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'startup_owner' | 'admin' | 'investor';
    requiredPermissions?: number[];
    requireEmailVerified?: boolean;
}

export function ProtectedRoute({ 
    children, 
    requiredRole, 
    requiredPermissions = [],
    requireEmailVerified = true 
}: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !user) {
            navigate({ to: '/auth', replace: true });
            return;
        }

        if (!isLoading && user) {
            // Check permissions if specified
            if (requiredPermissions.length > 0 && !hasAllPermissions(user.permissions, ...requiredPermissions)) {
                navigate({ to: '/auth', replace: true });
                return;
            }

            // Legacy role check (deprecated)
            if (requiredRole && user.role !== requiredRole) {
                navigate({ to: '/auth', replace: true });
                return;
            }

            // Check email verification if required
            if (requireEmailVerified && !user.email_verified) {
                navigate({ 
                    to: '/auth',
                    replace: true,
                    state: { step: 'verify-email', email: user.email }
                });
                return;
            }
        }
    }, [isLoading, user, requiredRole, requiredPermissions, requireEmailVerified, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (!user) return null;

    if (requiredPermissions.length > 0 && !hasAllPermissions(user.permissions, ...requiredPermissions)) return null;

    if (requiredRole && user.role !== requiredRole) return null;

    if (requireEmailVerified && !user.email_verified) return null;

    return <>{children}</>;
}