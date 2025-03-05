import { useMemo, useState, useEffect } from 'react';
import { Button, TextInput } from '@/components';
import type { AuthFormProps, AuthFormData } from '@/types/auth';
import { LogoSVG } from '@/assets';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface PasswordValidation {
    hasUpperCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    isValid: boolean;
}

export function AuthForm({
    onSubmit,
    isLoading,
    errors,
    mode,
    onToggleMode,
}: AuthFormProps) {
    const [formData, setFormData] = useState<AuthFormData>({
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
            isValid: false,
        });
    const [showRequirements, setShowRequirements] = useState(false);

    useEffect(() => {
        if (mode === 'register' && formData.password) {
            const validation = {
                hasUpperCase: /[A-Z]/.test(formData.password),
                hasNumber: /[0-9]/.test(formData.password),
                hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                    formData.password
                ),
                isValid: false,
            };

            validation.isValid =
                validation.hasUpperCase &&
                validation.hasNumber &&
                validation.hasSpecialChar;

            setPasswordValidation(validation);

            setShowRequirements(
                formData.password.length > 0 && !validation.isValid
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
        }

        await onSubmit(formData);
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
            if (name === 'password' && mode === 'register') {
                setConfirmError(
                    value !== confirmPassword ? 'Passwords do not match' : ''
                );
            }
        }
    };

    const isValidForm =
        mode === 'login' ||
        (formData.password &&
            formData.password === confirmPassword &&
            passwordValidation.isValid);

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

    return (
        <>
            <div className="hidden md:block absolute top-0 left-0 p-6">
                <img src={LogoSVG} alt="Logo" className="h-8" />
            </div>

            <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
                <div className="md:hidden flex justify-center mb-6">
                    <img src={LogoSVG} alt="Logo" className="h-8" />
                </div>

                <h2 className="text-2xl font-semibold text-center mb-6">
                    {mode === 'login'
                        ? 'Sign In to Your Account'
                        : 'Create Your Account'}
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
                                        key={idx}
                                        className="underline"
                                    >{`${idx + 1}. ${e}`}</p>
                                ))
                            )}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <TextInput
                        label="Email"
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        placeholder="Enter your email"
                    />

                    <div className="relative">
                        <TextInput
                            label="Password"
                            required
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder={
                                mode === 'login'
                                    ? 'Enter your password'
                                    : 'Create a password'
                            }
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

                    {mode === 'register' && showRequirements && (
                        <div className="text-sm space-y-1 mt-1 text-gray-600">
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
                            </ul>
                        </div>
                    )}

                    {mode === 'register' && (
                        <TextInput
                            label="Confirm Password"
                            required
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={handleChange}
                            error={confirmError}
                            placeholder="Confirm your password"
                            endIcon={
                                <button
                                    type="button"
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                    onClick={toggleConfirmPasswordVisibility}
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
                    )}

                    <div className="pt-2">
                        <Button
                            type="submit"
                            liquid
                            size="lg"
                            variant="primary"
                            disabled={isLoading || !isValidForm}
                        >
                            {isLoading
                                ? mode === 'login'
                                    ? 'Signing in...'
                                    : 'Creating account...'
                                : mode === 'login'
                                  ? 'Sign In'
                                  : 'Create Account'}
                        </Button>
                    </div>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            {mode === 'login'
                                ? "Don't have an account?"
                                : 'Already have an account?'}
                        </p>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={onToggleMode}
                            className="mt-1"
                        >
                            {mode === 'login' ? 'Create an account' : 'Sign in'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default AuthForm;
