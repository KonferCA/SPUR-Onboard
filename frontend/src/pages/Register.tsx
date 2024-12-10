import { useState, useEffect, FormEvent } from 'react';
import { Button, TextInput, TextArea } from '@components';
import { register, signin, RegisterError, ApiError } from '@services';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { getApiUrl } from '@/utils';
import { getCompany } from '@/services/company';

type RegistrationStep =
    | 'login-register'
    | 'verify-email'
    | 'signing-in'
    | 'form-details'
    | 'registration-complete';

interface FormData {
    firstName: string;
    lastName: string;
    position: string;
    bio: string;
    linkedIn: string;
    email: string;
    password: string;
}

interface FormErrors {
    linkedIn?: string;
    email?: string;
    password?: string;
}

interface LoginRegisterProps {
    formData: FormData;
    errors: FormErrors;
    isLoading: boolean;
    onSubmit: (e: FormEvent) => Promise<void>;
    onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    onLogin: () => Promise<void>;
}

interface SigningInProps {
    onComplete: () => void;
}

interface FormDetailsProps {
    formData: FormData;
    errors: FormErrors;
    onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    onLinkedInChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: FormEvent) => void;
    isFormValid: boolean;
}

interface RegistrationCompleteProps {
    onComplete: () => void;
}

const LoginRegister = ({
    formData,
    errors,
    isLoading,
    onSubmit,
    onChange,
    onLogin,
}: LoginRegisterProps) => (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg">
        <h3 className="text-center mb-4 font-light">Register or Login</h3>
        <hr className="border-gray-400" />
        <h2 className="text-2xl mt-4 font-normal">Register for Spur+Konfer</h2>

        <form onSubmit={onSubmit} className="space-y-4 mt-4">
            <TextInput
                label="Email"
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                error={errors.email}
            />

            <TextInput
                label="Password"
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                error={errors.password}
            />

            <Button
                type="submit"
                size="lg"
                liquid
                variant="primary"
                disabled={isLoading}
            >
                {isLoading ? 'Please wait...' : 'Register'}
            </Button>

            <div className="text-center mt-4">
                <p className="text-md mb-3">Already have an account?</p>
                <Button
                    type="button"
                    liquid
                    size="lg"
                    onClick={onLogin}
                    disabled={isLoading}
                >
                    {isLoading ? 'Please wait...' : 'Login'}
                </Button>
            </div>
        </form>
    </div>
);

const VerifyEmail = ({
    email,
    onVerified,
}: {
    email: string;
    onVerified: () => void;
}) => {
    useEffect(() => {
        let isMounted = true;

        const checkVerification = async () => {
            try {
                const response = await fetch(
                    getApiUrl(
                        `/auth/ami-verified?email=${encodeURIComponent(email)}`
                    ),
                    { method: 'GET' }
                );

                const data = await response.json();

                if (data.verified && isMounted) {
                    onVerified();
                }
            } catch (error) {
                console.error('error checking verification status', error);
            }
        };

        let intervalId: ReturnType<typeof setInterval> | null = null;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            } else {
                if (!intervalId) {
                    checkVerification();
                    intervalId = setInterval(checkVerification, 1000);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        if (!document.hidden) {
            checkVerification();
            intervalId = setInterval(checkVerification, 1000);
        }

        return () => {
            isMounted = false;

            if (intervalId) {
                clearInterval(intervalId);
            }

            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
        };
    }, [email, onVerified]);

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg">
            <h2 className="text-2xl mb-4">Verify your account</h2>
            <p className="font-light mb-6">
                Your account and wallet has been linked. We just sent an email
                confirmation to <span className="font-semibold">{email}</span>.
                Please verify your account to continue registering.
            </p>

            <div className="font-light mt-4">
                <span>Didn't get the email? </span>
                <button className="text-blue-500 hover:underline">
                    Resend Link
                </button>
            </div>
        </div>
    );
};

const SigningIn = ({ onComplete }: SigningInProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg text-center">
            <h2 className="text-xl mb-4">Signing you in....</h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
        </div>
    );
};

const FormDetails = ({
    formData,
    errors,
    onChange,
    onLinkedInChange,
    onSubmit,
    isFormValid,
}: FormDetailsProps) => (
    <div className="w-full max-w-md mx-auto p-6">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Welcome to Spur+Konfer</h1>
            <p className="text-gray-600 mt-2">
                To begin your application, please enter your organization's
                details
            </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
            <TextInput
                label="Your first name"
                required
                name="firstName"
                value={formData.firstName}
                onChange={onChange}
            />

            <TextInput
                label="Your last name"
                required
                name="lastName"
                value={formData.lastName}
                onChange={onChange}
            />

            <TextInput
                label="Your position/title"
                required
                name="position"
                value={formData.position}
                onChange={onChange}
            />

            <TextArea
                label="Your bio"
                required
                name="bio"
                value={formData.bio}
                onChange={onChange}
            />

            <TextInput
                label="Link to your LinkedIn"
                required
                name="linkedIn"
                value={formData.linkedIn}
                onChange={onLinkedInChange}
                error={errors.linkedIn}
            />

            <div className="pt-4">
                <Button
                    type="submit"
                    disabled={!isFormValid}
                    liquid
                    size="lg"
                    variant="primary"
                >
                    Register
                </Button>
            </div>

            <p className="text-center text-sm mt-4">
                By registering, you agree to Spur+Konfers'
                <br />
                <a href="#" className="text-blue-500">
                    Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-500">
                    Privacy Policy
                </a>
            </p>
        </form>
    </div>
);

const RegistrationComplete = ({ onComplete }: RegistrationCompleteProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="w-full max-w-md mx-auto p-6 text-center">
            <h2 className="text-xl mb-4">
                Thank you for registering, you will now be redirected to the
                dashboard
            </h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
        </div>
    );
};

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, setAuth, clearAuth } = useAuth();
    const [currentStep, setCurrentStep] = useState<RegistrationStep>(() => {
        const locationState = location.state as {
            step?: RegistrationStep;
        } | null;

        if (locationState?.step) {
            return locationState.step;
        }

        if (user) {
            if (!user.isEmailVerified) {
                return 'verify-email';
            }

            if (!user.firstName || !user.lastName) {
                return 'form-details';
            }
        }

        return 'login-register';
    });

    const [formData, setFormData] = useState<FormData>({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        position: '',
        bio: '',
        linkedIn: '',
        email: user?.email || (location.state as any)?.email || '',
        password: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const LINKEDIN_REGEX =
        /^(https?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)\/([-a-zA-Z0-9]+)\/?$/;

    const validateLinkedIn = (url: string): boolean => {
        if (!url) return false;
        return LINKEDIN_REGEX.test(url);
    };

    const handleLinkedInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (value && !validateLinkedIn(value)) {
            setErrors((prev) => ({
                ...prev,
                linkedIn: 'Please enter a valid LinkedIn profile URL',
            }));
        } else {
            setErrors((prev) => ({
                ...prev,
                linkedIn: undefined,
            }));
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const handleInitialSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const regResp = await register(formData.email, formData.password);
            setAuth(regResp.user, regResp.access_token);
            setCurrentStep('verify-email');
        } catch (error) {
            clearAuth();

            if (error instanceof RegisterError) {
                setErrors((prev) => ({
                    ...prev,
                    email: error.body.message || 'Registration failed',
                }));
            } else {
                setErrors((prev) => ({
                    ...prev,
                    email: 'An unexpected error occurred',
                }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const signinResp = await signin(formData.email, formData.password);
            const company = await getCompany(signinResp.access_token);
            setAuth(
                signinResp.user,
                signinResp.access_token,
                company ? company.ID : null
            );

            if (!signinResp.user.isEmailVerified) {
                setCurrentStep('verify-email');
                return;
            }

            if (!signinResp.user.firstName || !signinResp.user.lastName) {
                setCurrentStep('form-details');
                return;
            }

            // Redirect based on user role
            if (signinResp.user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else if (signinResp.user.role === 'startup_owner') {
                navigate('/dashboard', { replace: true });
            } else if (signinResp.user.role === 'investor') {
                navigate('/dashboard', { replace: true }); // or a specific investor dashboard
            }
        } catch (error) {
            clearAuth();

            if (error instanceof ApiError) {
                setErrors((prev) => ({
                    ...prev,
                    email: 'Invalid email or password',
                }));
            } else {
                setErrors((prev) => ({
                    ...prev,
                    email: 'An unexpected error occurred',
                }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        setCurrentStep('registration-complete');
    };

    const isFormDetailsValid = (): boolean => {
        return (
            formData.firstName.trim() !== '' &&
            formData.lastName.trim() !== '' &&
            formData.position.trim() !== '' &&
            formData.bio.trim() !== '' &&
            formData.linkedIn.trim() !== '' &&
            !errors.linkedIn
        );
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 'login-register':
                return (
                    <LoginRegister
                        formData={formData}
                        errors={errors}
                        isLoading={isLoading}
                        onSubmit={handleInitialSubmit}
                        onChange={handleChange}
                        onLogin={handleLogin}
                    />
                );
            case 'verify-email':
                return (
                    <VerifyEmail
                        email={formData.email}
                        onVerified={() => setCurrentStep('signing-in')}
                    />
                );
            case 'signing-in':
                return (
                    <SigningIn
                        onComplete={() => setCurrentStep('form-details')}
                    />
                );
            case 'form-details':
                return (
                    <FormDetails
                        formData={formData}
                        errors={errors}
                        onChange={handleChange}
                        onLinkedInChange={handleLinkedInChange}
                        onSubmit={handleFormSubmit}
                        isFormValid={isFormDetailsValid()}
                    />
                );
            case 'registration-complete':
                return (
                    <RegistrationComplete
                        onComplete={() => navigate('/dashboard')}
                    />
                );
        }
    };

    useEffect(() => {
        if (user && currentStep === 'login-register') {
            if (!user.isEmailVerified) {
                setCurrentStep('verify-email');
            } else if (!user.firstName || !user.lastName) {
                setCurrentStep('form-details');
            } else {
                if (user.role === 'admin') {
                    navigate('/admin/dashboard', { replace: true });
                } else if (user.role === 'startup_owner') {
                    navigate('/dashboard', { replace: true });
                } else if (user.role === 'investor') {
                    navigate('/dashboard', { replace: true }); // or a specific investor dashboard
                }
            }
        }
    }, [user, currentStep, navigate]);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-4">{renderCurrentStep()}</div>
        </div>
    );
};

export { Register };
