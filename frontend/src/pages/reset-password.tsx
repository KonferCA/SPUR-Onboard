import { createFileRoute, Navigate, useSearch } from '@tanstack/react-router';

export const Route = createFileRoute('/reset-password')({
    component: ResetPasswordRedirect,
});

function ResetPasswordRedirect() {
    const search = useSearch({ from: '/reset-password' });
    const token = search.token as string | undefined;

    // redirect to auth page with reset-password mode and token
    return <Navigate to={`/auth?reset_token=${token || ''}`} />;
}
