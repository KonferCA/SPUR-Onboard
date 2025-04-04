import { useMemo, useState, useEffect } from 'react';
import { Button, TextInput } from '@/components';
import type {
    AuthFormData,
    AuthFormProps,
    ForgotPasswordData,
    ResetPasswordData,
} from '@/types/auth';
import { FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import {
    FaGoogle,
    FaMicrosoft,
    FaGithub,
    FaDiscord,
    FaApple,
} from 'react-icons/fa';

interface PasswordValidation {
    hasUpperCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    minLength: boolean;
    isValid: boolean;
}

export function AuthForm({
    onSubmit,
    isLoading,
    errors,
    mode,
    onToggleMode,
    onRegisterClick,
    resetToken,
}: AuthFormProps) {
    const [formData, setFormData] = useState<
        AuthFormData & { confirmPassword?: string }
    >({
        email: '',
        password: '',
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordValidation, setPasswordValidation] =
        useState<PasswordValidation>({
            hasUpperCase: false,
            hasNumber: false,
            hasSpecialChar: false,
            minLength: false,
            isValid: false,
        });
    const [showRequirements, setShowRequirements] = useState(
        mode === 'register' || mode === 'reset-password'
    );
    const [emailSent, setEmailSent] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // reset form state when mode changes
        setEmailSent(false);
        setFormData({ email: '', password: '' });
        setConfirmPassword('');
        setConfirmError('');
    }, []);

    useEffect(() => {
        if (
            (mode === 'register' || mode === 'reset-password') &&
            formData.password
        ) {
            const validation = {
                hasUpperCase: /[A-Z]/.test(formData.password),
                hasNumber: /[0-9]/.test(formData.password),
                hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                    formData.password
                ),
                minLength: formData.password.length >= 8,
                isValid: false,
            };

            validation.isValid =
                validation.hasUpperCase &&
                validation.hasNumber &&
                validation.hasSpecialChar &&
                validation.minLength;

            setPasswordValidation(validation);

            setShowRequirements(
                mode === 'register' || mode === 'reset-password'
            );
        } else {
            setShowRequirements(false);
        }
    }, [formData.password, mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'register') {
            if (formData.password !== confirmPassword) {
                setConfirmError('Passwords do not match');
                return;
            }

            if (!passwordValidation.isValid) {
                setShowRequirements(true);
                return;
            }

            await onSubmit(formData);
        } else if (mode === 'login') {
            await onSubmit(formData);
        } else if (mode === 'forgot-password') {
            const data: ForgotPasswordData = { email: formData.email };
            try {
                await onSubmit(data);
                setEmailSent(true);
            } catch (error) {}
        } else if (mode === 'reset-password') {
            if (formData.password !== confirmPassword) {
                setConfirmError('Passwords do not match');
                return;
            }

            if (!passwordValidation.isValid) {
                setShowRequirements(true);
                return;
            }

            if (!resetToken) {
                return;
            }

            const data: ResetPasswordData = {
                password: formData.password,
                token: resetToken,
            };

            try {
                await onSubmit(data);
                setSuccess(true);
            } catch (error) {}
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'confirmPassword') {
            setConfirmPassword(value);
            setConfirmError(
                value !== formData.password ? 'Passwords do not match' : ''
            );
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
            if (
                name === 'password' &&
                (mode === 'register' || mode === 'reset-password')
            ) {
                setConfirmError(
                    value !== confirmPassword ? 'Passwords do not match' : ''
                );
            }
        }
    };

    const isValidForm = () => {
        if (mode === 'login') {
            return formData.email && formData.password;
        }
        if (mode === 'register') {
            return (
                formData.email &&
                formData.password &&
                passwordValidation.isValid &&
                confirmPassword === formData.password
            );
        }
        if (mode === 'forgot-password') {
            return formData.email;
        }
        if (mode === 'reset-password') {
            return (
                formData.password &&
                confirmPassword &&
                passwordValidation.isValid &&
                formData.password === confirmPassword
            );
        }
        return false;
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const internalErrors = useMemo(() => {
        if (errors.email) return errors.email.split(';');
        return [];
    }, [errors]);

    // success for password reset
    if (mode === 'reset-password' && success) {
        return (
            <div className="w-full bg-white bg-opacity-95 rounded-lg shadow-md p-8 md:p-10">
                <div className="text-center">
                    <div className="mb-4 text-green-600">
                        <FiCheck className="w-16 h-16 mx-auto" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-4">
                        Password Reset Successful
                    </h2>
                    <p className="mb-6">
                        Your password has been successfully reset. You can now
                        log in with your new password.
                    </p>
                    <Button
                        type="button"
                        onClick={() => onToggleMode()}
                        liquid
                        variant="primary"
                        className="bg-orange-500 hover:bg-orange-600"
                    >
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    if (mode === 'forgot-password' && emailSent) {
        return (
            <div className="w-full bg-white bg-opacity-95 rounded-lg shadow-md p-8 md:p-10">
                <div className="text-center">
                    <div className="mb-4 text-green-600">
                        <FiCheck className="w-16 h-16 mx-auto" />
                    </div>
                    <p className="mb-4">
                        If an account exists for {formData.email}, you will
                        receive an email with instructions to reset your
                        password.
                    </p>
                    <Button
                        type="button"
                        onClick={() => onToggleMode()}
                        liquid
                        variant="primary"
                        className="bg-orange-500 hover:bg-orange-600"
                    >
                        Return to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="w-full bg-white bg-opacity-95 rounded-lg shadow-md p-8 md:p-10">
                <h2 className="text-2xl font-semibold text-center mb-6 md:mb-8">
                    {mode === 'login'
                        ? 'Login to your account'
                        : mode === 'register'
                          ? 'Register for Onboard'
                          : mode === 'forgot-password'
                            ? 'Reset Your Password'
                            : 'Set New Password'}
                </h2>

                {internalErrors.length > 0 && (
                    <div className="my-4 p-4 bg-red-100 rounded-lg">
                        <h3 className="text-red-500">
                            Oops, something went wrong
                        </h3>
                        <div className="space-y-1">
                            {internalErrors.length === 1 ? (
                                <p className="underline">{internalErrors[0]}</p>
                            ) : (
                                internalErrors.map((e, idx) => (
                                    <p
                                        key={e}
                                        className="underline"
                                    >{`${idx + 1}. ${e}`}</p>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {mode === 'forgot-password' && (
                    <p className="mb-4">
                        Enter your email address and we'll send you a link to
                        reset your password.
                    </p>
                )}

                {mode === 'reset-password' && !resetToken && (
                    <div className="text-center">
                        <p className="mb-4">
                            The password reset link is invalid or has expired.
                            Please request a new password reset link.
                        </p>
                        <Button
                            type="button"
                            onClick={() => onToggleMode()}
                            liquid
                            variant="primary"
                            className="bg-orange-500 hover:bg-orange-600"
                        >
                            Request New Link
                        </Button>
                    </div>
                )}

                {(mode !== 'reset-password' || resetToken) && (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4 md:space-y-6"
                    >
                        {(mode === 'login' ||
                            mode === 'register' ||
                            mode === 'forgot-password') && (
                            <div className="flex flex-col">
                                <div className="flex justify-between items-center">
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Email
                                    </label>
                                    <span className="text-xs text-gray-500">
                                        Required
                                    </span>
                                </div>
                                <TextInput
                                    label=""
                                    required
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                    placeholder="Enter your email"
                                />
                            </div>
                        )}

                        {(mode === 'login' ||
                            mode === 'register' ||
                            mode === 'reset-password') && (
                            <div className="flex flex-col">
                                <div className="flex justify-between items-center">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        {mode === 'reset-password'
                                            ? 'New Password'
                                            : 'Password'}
                                    </label>
                                    <span className="text-xs text-gray-500">
                                        Required
                                    </span>
                                </div>
                                <div className="relative">
                                    <TextInput
                                        label=""
                                        required
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        name="password"
                                        id="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        error={errors.password}
                                        placeholder={
                                            mode === 'login'
                                                ? 'Enter your password'
                                                : mode === 'register'
                                                  ? 'Create a password'
                                                  : 'Enter new password'
                                        }
                                        endIcon={
                                            <button
                                                type="button"
                                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                                onClick={
                                                    togglePasswordVisibility
                                                }
                                                aria-label={
                                                    showPassword
                                                        ? 'Hide password'
                                                        : 'Show password'
                                                }
                                            >
                                                {showPassword ? (
                                                    <FiEyeOff size={16} />
                                                ) : (
                                                    <FiEye size={16} />
                                                )}
                                            </button>
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {(mode === 'register' || mode === 'reset-password') &&
                            showRequirements && (
                                <div className="text-sm space-y-1">
                                    <p className="font-medium">
                                        Password must contain:
                                    </p>
                                    <ul className="space-y-1 pl-5 list-disc">
                                        <li
                                            className={
                                                passwordValidation.hasUpperCase
                                                    ? 'text-green-600'
                                                    : ''
                                            }
                                        >
                                            At least one uppercase letter
                                        </li>
                                        <li
                                            className={
                                                passwordValidation.hasNumber
                                                    ? 'text-green-600'
                                                    : ''
                                            }
                                        >
                                            At least one number
                                        </li>
                                        <li
                                            className={
                                                passwordValidation.hasSpecialChar
                                                    ? 'text-green-600'
                                                    : ''
                                            }
                                        >
                                            At least one special character
                                        </li>
                                        <li
                                            className={
                                                passwordValidation.minLength
                                                    ? 'text-green-600'
                                                    : ''
                                            }
                                        >
                                            At least 8 characters
                                        </li>
                                    </ul>
                                </div>
                            )}

                        {(mode === 'register' || mode === 'reset-password') && (
                            <div className="flex flex-col">
                                <div className="flex justify-between items-center">
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Confirm password
                                    </label>
                                    <span className="text-xs text-gray-500">
                                        Required
                                    </span>
                                </div>
                                <div className="relative">
                                    <TextInput
                                        label=""
                                        required
                                        type={
                                            showConfirmPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        name="confirmPassword"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={handleChange}
                                        error={confirmError}
                                        placeholder="Confirm your password"
                                        endIcon={
                                            <button
                                                type="button"
                                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                                onClick={
                                                    toggleConfirmPasswordVisibility
                                                }
                                                aria-label={
                                                    showConfirmPassword
                                                        ? 'Hide password'
                                                        : 'Show password'
                                                }
                                            >
                                                {showConfirmPassword ? (
                                                    <FiEyeOff size={16} />
                                                ) : (
                                                    <FiEye size={16} />
                                                )}
                                            </button>
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {mode === 'login' && (
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <label
                                        htmlFor="remember-me"
                                        className="ml-2 block text-sm text-gray-900"
                                    >
                                        Remember me
                                    </label>
                                </div>
                                <div className="text-sm">
                                    <button
                                        type="button"
                                        className="font-medium text-orange-600 hover:text-orange-500"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            // switch to forgot password mode
                                            onToggleMode();
                                        }}
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <Button
                                type="submit"
                                liquid
                                size="md"
                                variant="primary"
                                disabled={isLoading || !isValidForm()}
                                className="bg-orange-500 hover:bg-orange-600 py-2"
                            >
                                {isLoading
                                    ? mode === 'login'
                                        ? 'Signing in...'
                                        : mode === 'register'
                                          ? 'Creating account...'
                                          : mode === 'forgot-password'
                                            ? 'Sending...'
                                            : 'Resetting...'
                                    : mode === 'login'
                                      ? 'Login'
                                      : mode === 'register'
                                        ? 'Continue'
                                        : mode === 'forgot-password'
                                          ? 'Send Reset Link'
                                          : 'Reset Password'}
                            </Button>
                        </div>

                        {(mode === 'login' || mode === 'register') && (
                            <>
                                <div className="flex items-center justify-center mt-4 md:mt-6">
                                    <div className="mr-4 flex-grow border-t border-gray-300" />
                                    <div className="text-sm text-gray-500">
                                        {mode === 'login'
                                            ? 'or login with'
                                            : 'or register with'}
                                    </div>
                                    <div className="ml-4 flex-grow border-t border-gray-300" />
                                </div>

                                {/* Desktop social login buttons with text */}
                                <div className="hidden md:block">
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            className="flex-1 min-w-[120px] inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                        >
                                            <FaGoogle className="w-5 h-5 min-w-[1.25rem] min-h-[1.25rem] mr-2" />
                                            Google
                                        </button>
                                        <button
                                            type="button"
                                            className="flex-1 min-w-[120px] inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                        >
                                            <FaMicrosoft className="w-5 h-5 min-w-[1.25rem] min-h-[1.25rem] mr-2" />
                                            Microsoft
                                        </button>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            className="flex-1 min-w-[120px] inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                        >
                                            <FaGithub className="w-5 h-5 min-w-[1.25rem] min-h-[1.25rem] mr-2" />
                                            GitHub
                                        </button>
                                        <button
                                            type="button"
                                            className="flex-1 min-w-[120px] inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                        >
                                            <FaDiscord className="w-5 h-5 min-w-[1.25rem] min-h-[1.25rem] mr-2" />
                                            Discord
                                        </button>
                                        <button
                                            type="button"
                                            className="flex-1 min-w-[120px] inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                        >
                                            <FaApple className="w-5 h-5 min-w-[1.25rem] min-h-[1.25rem] mr-2" />
                                            Apple
                                        </button>
                                    </div>
                                </div>

                                {/* Mobile social login buttons with icons only */}
                                <div className="md:hidden mt-4 flex justify-center gap-3">
                                    <button
                                        type="button"
                                        className="w-12 h-12 inline-flex justify-center items-center border border-gray-300 rounded-md shadow-sm bg-white"
                                    >
                                        <FaGoogle className="w-5 h-5 min-w-[1.25rem] min-h-[1.25rem] text-gray-500" />
                                    </button>
                                    <button
                                        type="button"
                                        className="w-12 h-12 inline-flex justify-center items-center border border-gray-300 rounded-md shadow-sm bg-white"
                                    >
                                        <FaMicrosoft className="w-5 h-5 min-w-[1.25rem] min-h-[1.25rem] text-gray-500" />
                                    </button>
                                    <button
                                        type="button"
                                        className="w-12 h-12 inline-flex justify-center items-center border border-gray-300 rounded-md shadow-sm bg-white"
                                    >
                                        <FaGithub className="w-5 h-5 min-w-[1.25rem] min-h-[1.25rem] text-gray-500" />
                                    </button>
                                    <button
                                        type="button"
                                        className="w-12 h-12 inline-flex justify-center items-center border border-gray-300 rounded-md shadow-sm bg-white"
                                    >
                                        <FaDiscord className="w-5 h-5 min-w-[1.25rem] min-h-[1.25rem] text-gray-500" />
                                    </button>
                                    <button
                                        type="button"
                                        className="w-12 h-12 inline-flex justify-center items-center border border-gray-300 rounded-md shadow-sm bg-white"
                                    >
                                        <FaApple className="w-5 h-5 min-w-[1.25rem] min-h-[1.25rem] text-gray-500" />
                                    </button>
                                </div>
                            </>
                        )}

                        <div className="text-center mt-4 md:mt-6">
                            <p className="text-sm text-gray-600">
                                {mode === 'login' ? (
                                    <>
                                        Need an account?{' '}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (onRegisterClick) {
                                                    onRegisterClick();
                                                } else {
                                                    onToggleMode();
                                                }
                                            }}
                                            className="font-medium text-orange-600 hover:text-orange-500"
                                        >
                                            Register here
                                        </button>
                                    </>
                                ) : mode === 'register' ? (
                                    <>
                                        Already have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onToggleMode();
                                            }}
                                            className="font-medium text-orange-600 hover:text-orange-500"
                                        >
                                            Login here
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Remember your password?{' '}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onToggleMode();
                                            }}
                                            className="font-medium text-orange-600 hover:text-orange-500"
                                        >
                                            Back to login
                                        </button>
                                    </>
                                )}
                            </p>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}

export default AuthForm;
