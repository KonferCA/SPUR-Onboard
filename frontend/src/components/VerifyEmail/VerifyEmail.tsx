// src/components/VerifyEmail/VerifyEmail.tsx
import { Button } from '@/components';
import { useAuth } from '@/contexts';
import { checkEmailVerifiedStatus } from '@/services/auth';
import { useEffect } from 'react';

interface VerifyEmailProps {
    email: string;
    onResendVerification: () => Promise<void>;
    onVerified: () => void;
    isResending: boolean;
}

export function VerifyEmail({
    email,
    onResendVerification,
    onVerified,
    isResending,
}: VerifyEmailProps) {
    const { user, accessToken } = useAuth();

    useEffect(() => {
        if (user && user.emailVerified) return;

        let id: number;
        if (accessToken) {
            id = window.setInterval(async () => {
                const verified = await checkEmailVerifiedStatus(accessToken);
                if (verified) {
                    onVerified();
                }
            }, 3000);
        }

        return () => {
            if (id !== undefined) {
                window.clearInterval(id);
            }
        };
    }, []);

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-semibold mb-4">Verify Your Email</h2>

            <div className="space-y-4">
                <p className="text-gray-600">
                    We've sent a verification email to:
                    <br />
                    <span className="font-medium text-gray-900">{email}</span>
                </p>

                <p className="text-gray-600">
                    Please check your inbox and click the verification link to
                    continue.
                </p>

                <div className="pt-4">
                    <p className="text-sm text-gray-500 mb-2">
                        Didn't receive the email?
                    </p>
                    <Button
                        variant="outline"
                        onClick={onResendVerification}
                        disabled={isResending}
                    >
                        {isResending
                            ? 'Sending...'
                            : 'Resend Verification Email'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;
