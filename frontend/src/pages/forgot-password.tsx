import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/forgot-password')({
    component: ForgotPasswordRedirect,
});

function ForgotPasswordRedirect() {
    // redirect to auth page with forgot-password mode
    return <Navigate to="/auth?form=forgot-password" />;
}
