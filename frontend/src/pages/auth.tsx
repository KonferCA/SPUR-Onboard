import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AuthForm } from '@/components/AuthForm';
import { UserDetailsForm } from '@/components/UserDetailsForm';
import { VerifyEmail } from '@/components/VerifyEmail';
import { register, signin, getCompany } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import type {
    AuthFormData,
    UserDetailsData,
    FormErrors,
    RegistrationStep,
} from '@/types/auth';
import { Permission } from '@/services/auth';
import { updateUserDetails } from '@/services/user';
import { CompanyForm } from '@/components/CompanyForm/CompanyForm';

function AuthPage() {
    const navigate = useNavigate({ from: '/auth' });
    const {
        user,
        accessToken,
        companyId,
        isLoading: authLoading,
        setAuth,
        clearAuth,
    } = useAuth();

    const [currentStep, setCurrentStep] =
        useState<RegistrationStep>('login-register');

    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [isResendingVerification, setIsResendingVerification] =
        useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (user) {
            if (!user.emailVerified) {
                setCurrentStep('verify-email');
            } else if (!user.firstName || !user.lastName) {
                setCurrentStep('form-details');
            } else if (!companyId) {
                setCurrentStep('company-creation');
            } else {
                handleRedirect();
            }
        }
    }, [user]);

    useEffect(() => {}, [authLoading]);

    const handleRedirect = () => {
        if (!user) return;

        const perms = user.permissions;
        if (perms & Permission.IsAdmin) {
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
                setAuth(regResp.user, regResp.access_token);
                setCurrentStep('verify-email');
            } else {
                const signinResp = await signin(
                    formData.email,
                    formData.password
                );
                const company = await getCompany(signinResp.access_token);
                setAuth(
                    signinResp.user,
                    signinResp.access_token,
                    company ? company.ID : null
                );

                if (!signinResp.user.emailVerified) {
                    setCurrentStep('verify-email');
                } else {
                    handleRedirect();
                }
            }
        } catch (error: any) {
            console.error('Auth error:', error);
            setErrors({
                email: error.body?.message || 'Authentication failed',
            });
            clearAuth();
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserDetailsSubmit = async (formData: UserDetailsData) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error('No user found');
            if (!accessToken) throw new Error('No access token');

            await updateUserDetails(user.id, accessToken, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                title: formData.position,
                bio: formData.bio,
                linkedin: formData.linkedIn,
            });

            user.firstName = formData.firstName;
            user.lastName = formData.lastName;
            setAuth(user, accessToken, companyId);
            setCurrentStep('company-creation');
        } catch (error) {
            console.error('Profile update error:', error);
            setErrors({
                firstName: 'Failed to update profile',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!user?.email) return;

        setIsResendingVerification(true);
        try {
            // TODO: Add resend verification email API call here
            // Need to implement in backend (route does not exist)
            // await resendVerificationEmail(user.email);
        } catch (error) {
            console.error('Failed to resend verification:', error);
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
                    <AuthForm
                        onSubmit={handleAuthSubmit}
                        isLoading={isLoading}
                        errors={errors}
                        mode={mode}
                        onToggleMode={() =>
                            setMode(mode === 'login' ? 'register' : 'login')
                        }
                    />
                );

            case 'verify-email':
                return user ? (
                    <VerifyEmail
                        email={user.email}
                        onVerified={handleOnVerified}
                        onResendVerification={handleResendVerification}
                        isResending={isResendingVerification}
                    />
                ) : null;

            case 'form-details':
                return (
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
                );

            case 'company-creation':
                return (
                    <CompanyForm
                        onSubmit={(data) => {}}
                        isLoading={isLoading}
                    />
                );

            case 'registration-complete':
                return (
                    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
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
                );

            case 'signing-in':
                return (
                    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
                        <h2 className="text-xl mb-4">Signing you in...</h2>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
                    </div>
                );
        }
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                {renderCurrentStep()}
            </div>
        </div>
    );
}

export const Route = createFileRoute('/auth')({
    component: AuthPage,
});
