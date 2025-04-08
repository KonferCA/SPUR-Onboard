import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button, TextInput } from '@/components';
import { resetPassword } from '@/services/auth';
import { FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';

export function ResetPassword() {
    const search = useSearch({ from: '/reset-password' });
    const rawToken = search.token as string | undefined;
    const token = rawToken ? decodeURIComponent(rawToken) : undefined;
    const navigate = useNavigate({ from: '/reset-password' });

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState(false);

    // password validation
    const [passwordValidation, setPasswordValidation] = useState({
        hasUpperCase: false,
        hasNumber: false,
        hasSpecialChar: false,
        minLength: false,
        isValid: false,
    });

    useEffect(() => {
        if (!token) {
            setError(
                'Invalid or missing reset token. Please request a new password reset link.'
            );
        }
    }, [token]);

    useEffect(() => {
        if (password) {
            const validation = {
                hasUpperCase: /[A-Z]/.test(password),
                hasNumber: /[0-9]/.test(password),
                hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                    password
                ),
                minLength: password.length >= 8,
                isValid: false,
            };

            validation.isValid =
                validation.hasUpperCase &&
                validation.hasNumber &&
                validation.hasSpecialChar &&
                validation.minLength;

            setPasswordValidation(validation);
        }
    }, [password]);

    useEffect(() => {
        if (confirmPassword && password !== confirmPassword) {
            setPasswordError('Passwords do not match');
        } else {
            setPasswordError('');
        }
    }, [password, confirmPassword]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setError(
                'Invalid or missing reset token. Please request a new password reset link.'
            );
            return;
        }

        if (!passwordValidation.isValid) {
            return;
        }

        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await resetPassword(token, password);
            setSuccess(true);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(
                    'An unexpected error occurred. Please try again later.'
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    if (success) {
        return (
            <div className="w-full max-w-md bg-white bg-opacity-95 rounded-lg shadow-md p-8 md:p-10">
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
                        onClick={() => navigate({ to: '/auth' })}
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

    return (
        <div className="w-full max-w-md bg-white bg-opacity-95 rounded-lg shadow-md p-8 md:p-10">
            <h2 className="text-2xl font-semibold text-center mb-6 md:mb-8">
                Reset Your Password
            </h2>

            {error && (
                <div className="my-4 p-4 bg-red-100 rounded-lg">
                    <p className="text-red-500">{error}</p>
                </div>
            )}

            {!token ? (
                <div className="text-center">
                    <p className="mb-4">
                        The password reset link is invalid or has expired.
                        Please request a new password reset link.
                    </p>
                    <Button
                        type="button"
                        onClick={() => navigate({ to: '/forgot-password' })}
                        liquid
                        variant="primary"
                        className="bg-orange-500 hover:bg-orange-600"
                    >
                        Request New Link
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            New Password
                        </label>
                        <div className="relative">
                            <TextInput
                                required
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                endIcon={
                                    <button
                                        type="button"
                                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                        onClick={togglePasswordVisibility}
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

                    <div className="text-sm space-y-1">
                        <p className="font-medium">Password must contain:</p>
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

                    <div className="flex flex-col">
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Confirm Password
                        </label>
                        <div className="relative">
                            <TextInput
                                required
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder="Confirm your password"
                                error={passwordError}
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

                    <div className="pt-2">
                        <Button
                            type="submit"
                            liquid
                            size="md"
                            variant="primary"
                            disabled={
                                isLoading ||
                                !passwordValidation.isValid ||
                                !confirmPassword ||
                                password !== confirmPassword
                            }
                            className="bg-orange-500 hover:bg-orange-600 py-2"
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
