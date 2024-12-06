import { useState, useEffect, FormEvent } from 'react';
import { Button, TextInput, TextArea } from '@components';
import { register, RegisterError, saveRefreshToken } from '@services';
import { useAuth } from '@/contexts/AuthContext';

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

const Register = () => {
    const [currentStep, setCurrentStep] =
        useState<RegistrationStep>('login-register');
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        position: '',
        bio: '',
        linkedIn: '',
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const { setUser, setCompanyId } = useAuth();

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
        try {
            const regResp = await register(formData.email, formData.password);
            console.log(regResp);

            setUser(regResp.user);
            saveRefreshToken(regResp.refreshToken);

            setCompanyId('mock-company-id');

            setCurrentStep('verify-email');
        } catch (error) {
            if (error instanceof RegisterError) {
                console.log('do something here', error.statusCode, error.body);
            } else {
                // TODO: handle error with some kind of notification
            }
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

    const renderLoginRegister = () => (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg">
            <h3 className="text-center mb-4 font-light">Register or Login</h3>
            <hr className="border-gray-400" />
            <h2 className="text-2xl mt-4 font-normal">
                Register for Spur+Konfer
            </h2>

            <form onSubmit={handleInitialSubmit} className="space-y-4 mt-4">
                <TextInput
                    label="Email"
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                />

                <TextInput
                    label="Password"
                    required
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <Button type="submit" size="lg" liquid variant="primary">
                    Register
                </Button>

                <div className="text-center mt-4">
                    <p className="text-md mb-3">Already have an account?</p>
                    <Button
                        type="button"
                        liquid
                        size="lg"
                        // TODO: onClick to handle login
                    >
                        Login
                    </Button>
                </div>
            </form>
        </div>
    );

    const renderVerifyEmail = () => (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg">
            <h2 className="text-2xl mb-4">Verify your account</h2>
            <p className="font-light mb-6">
                Your account and wallet has been linked. We just sent an email
                confirmation to{' '}
                <span className="font-semibold">{formData.email}</span>. Please
                verify your account to continue registering.
            </p>

            <div className="font-light mt-4">
                <span>Didn't get the email? </span>
                <button className="text-blue-500 hover:underline">
                    Resend Link
                </button>
            </div>
        </div>
    );

    const renderSigningIn = () => {
        useEffect(() => {
            const timer = setTimeout(() => {
                setCurrentStep('form-details');
            }, 2000);

            return () => clearTimeout(timer);
        }, []);

        return (
            <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg text-center">
                <h2 className="text-xl mb-4">Signing you in....</h2>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
            </div>
        );
    };

    const renderFormDetails = () => (
        <div className="w-full max-w-md mx-auto p-6">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Welcome to Spur+Konfer</h1>
                <p className="text-gray-600 mt-2">
                    To begin your application, please enter your organization's
                    details
                </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
                <TextInput
                    label="Your first name"
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                />

                <TextInput
                    label="Your last name"
                    required
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                />

                <TextInput
                    label="Your position/title"
                    required
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                />

                <TextArea
                    label="Your bio"
                    required
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                />

                <TextInput
                    label="Link to your LinkedIn"
                    required
                    name="linkedIn"
                    value={formData.linkedIn}
                    onChange={handleLinkedInChange}
                    error={errors.linkedIn}
                />

                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={!isFormDetailsValid()}
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

    const renderRegistrationComplete = () => {
        useEffect(() => {
            const timer = setTimeout(() => {
                // TODO: Push to '/dashboard'
            }, 2000);

            return () => clearTimeout(timer);
        }, []);

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

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 'login-register':
                return renderLoginRegister();
            case 'verify-email':
                return renderVerifyEmail();
            case 'signing-in':
                return renderSigningIn();
            case 'form-details':
                return renderFormDetails();
            case 'registration-complete':
                return renderRegistrationComplete();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-4">{renderCurrentStep()}</div>
        </div>
    );
};

export { Register };
