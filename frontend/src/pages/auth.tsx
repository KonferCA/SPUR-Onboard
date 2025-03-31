import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AuthForm } from '@/components/AuthForm';
import { AuthPage as AuthPageLayout } from '@/components/AuthPage';
import { UserDetailsForm } from '@/components/UserDetailsForm';
import { VerifyEmail } from '@/components/VerifyEmail';
import { register, signin, resendVerificationEmail } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearch } from '@tanstack/react-router';
import type {
    AuthFormData,
    UserDetailsData,
    CompanyFormErrors,
    RegistrationStep,
} from '@/types/auth';
import { isAdmin } from '@/utils/permissions';
import { initialUserProfile } from '@/services/user';
import { useNotification } from '@/contexts';

function AuthPage() {
    const navigate = useNavigate({ from: '/auth' });
    const searchParams = useSearch({ from: '/auth' });
    const {
        user,
        accessToken,
        companyId,
        isLoading: authLoading,
        setAuth,
        clearAuth,
    } = useAuth();

    const { push } = useNotification();

    const [currentStep, setCurrentStep] =
        useState<RegistrationStep>('login-register');

    const [mode, setMode] = useState<'login' | 'register'>(() => {
        if (
            !searchParams.form &&
            searchParams.form !== 'login' &&
            searchParams.form !== 'register'
        ) {
            return 'login';
        }
        return searchParams.form;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isResendingVerification, setIsResendingVerification] =
        useState(false);
    const [errors, setErrors] = useState<CompanyFormErrors>({});

    useEffect(() => {
        if (user) {
            if (!user.emailVerified) {
                setCurrentStep('verify-email');
            } else if (!user.firstName || !user.lastName) {
                setCurrentStep('form-details');
            } else {
                handleRedirect();
            }
        }
    }, [user]);

    const handleRedirect = () => {
        if (!user) return;

        const perms = user.permissions;
        if (isAdmin(perms)) {
            navigate({ to: '/admin/dashboard', replace: true });
        } else {
            navigate({ to: '/user/dashboard', replace: true });
        }
    };

    const handleAuthSubmit = async (formData: AuthFormData) => {
        setIsLoading(true);
        setErrors({});

        try {
            if (mode === 'register') {
                const regResp = await register(
                    formData.email,
                    formData.password
                );
                setAuth(regResp.user, regResp.accessToken, regResp.companyId);
                setCurrentStep('verify-email');
            } else {
                const signinResp = await signin(
                    formData.email,
                    formData.password
                );
                setAuth(
                    signinResp.user,
                    signinResp.accessToken,
                    signinResp.companyId
                );

                if (!signinResp.user.emailVerified) {
                    setCurrentStep('verify-email');
                } else {
                    handleRedirect();
                }
            }
            // biome-ignore lint/suspicious/noExplicitAny: allow type any for error
        } catch (error: any) {
            console.error('Auth error:', error);
            setErrors({
                email:
                    error.body?.details ||
                    error.body?.message ||
                    'Authentication failed',
            });
            clearAuth();
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserDetailsSubmit = async (formData: UserDetailsData) => {
        setIsLoading(true);
        setErrors({});

        try {
            if (!user) {
                setErrors({ firstName: 'User session not found' });
                return;
            }

            if (!accessToken) {
                setErrors({ firstName: 'Authentication token missing' });
                return;
            }

            await initialUserProfile(accessToken, user.id, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                title: formData.position,
                bio: formData.bio,
                socials: formData.socials,
            });

            user.firstName = formData.firstName;
            user.lastName = formData.lastName;

            setAuth(user, accessToken, companyId);
            setCurrentStep('registration-complete');
            setTimeout(() => {
                handleRedirect();
            }, 1000);
            // biome-ignore lint/suspicious/noExplicitAny: allow type any for error
        } catch (error: any) {
            if (error.body) {
                setErrors({
                    firstName: error.body.message || 'Failed to update profile',
                });
            } else if (error.message) {
                setErrors({
                    firstName: error.message,
                });
            } else {
                setErrors({
                    firstName:
                        'An unexpected error occurred while updating your profile',
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!user?.email || !accessToken) return;

        setIsResendingVerification(true);

        try {
            await resendVerificationEmail(accessToken);
            push({
                message: 'Verification email sent! Please check your inbox.',
                level: 'success',
            });
        } catch (error) {
            console.error('Failed to resend verification:', error);
            push({
                message:
                    'Failed to resend verification email. Please try again.',
                level: 'error',
            });
        } finally {
            setIsResendingVerification(false);
        }
    };

    const handleOnVerified = () => {
        if (!user) return;
        user.emailVerified = true;
        setAuth(user, accessToken, companyId);
        setCurrentStep('form-details');
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 'login-register':
                return (
                    <AuthPageLayout>
                        <AuthForm
                            onSubmit={handleAuthSubmit}
                            isLoading={isLoading}
                            errors={errors}
                            mode={mode}
                            onToggleMode={() =>
                                setMode(mode === 'login' ? 'register' : 'login')
                            }
                        />
                    </AuthPageLayout>
                );

            case 'verify-email':
                return user ? (
                    <AuthPageLayout>
                        <VerifyEmail
                            email={user.email}
                            onVerified={handleOnVerified}
                            onResendVerification={handleResendVerification}
                            isResending={isResendingVerification}
                        />
                    </AuthPageLayout>
                ) : null;

            case 'form-details':
                return (
                    <AuthPageLayout>
                        <UserDetailsForm
                            onSubmit={handleUserDetailsSubmit}
                            isLoading={isLoading}
                            errors={errors}
                            initialData={
                                user
                                    ? {
                                          firstName: user.firstName,
                                          lastName: user.lastName,
                                      }
                                    : undefined
                            }
                        />
                    </AuthPageLayout>
                );

            case 'registration-complete':
                return (
                    <AuthPageLayout>
                        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
                            <h2 className="text-2xl font-semibold mb-4">
                                Registration Complete!
                            </h2>
                            <p className="text-gray-600">
                                Redirecting you to the dashboard...
                            </p>
                            <div className="mt-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
                            </div>
                        </div>
                    </AuthPageLayout>
                );

            case 'signing-in':
                return (
                    <AuthPageLayout>
                        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
                            <h2 className="text-xl mb-4">Signing you in...</h2>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
                        </div>
                    </AuthPageLayout>
                );
        }
    };

    if (authLoading) return null;

    return <div className="min-h-screen w-full">{renderCurrentStep()}</div>;
}

export const Route = createFileRoute('/auth')({
    component: AuthPage,
});
