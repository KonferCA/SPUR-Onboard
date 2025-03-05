import { useMemo, useState } from 'react';
import { Button, TextInput } from '@/components';
import type { AuthFormProps, AuthFormData } from '@/types/auth';

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'register' && formData.password !== confirmPassword) {
            setConfirmError('Passwords do not match');
            return;
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
        (formData.password && formData.password === confirmPassword);

    const internalErrors = useMemo(() => {
        if (errors.email) return errors.email.split(';');
        return [];
    }, [errors]);

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-center mb-6">
                {mode === 'login'
                    ? 'Sign In to Your Account'
                    : 'Create Your Account'}
            </h2>

            {internalErrors.length > 0 && (
                <div className="my-4 p-4 bg-red-100 rounded-lg">
                    <h3 className="text-red-500">Oops, something went wrong</h3>
                    <div className="space-y-1">
                        {internalErrors.map((e, idx) => (
                            <p
                                key={idx}
                                className="underline"
                            >{`${idx + 1}. ${e}`}</p>
                        ))}
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
                    placeholder="Enter your email"
                />

                <TextInput
                    label="Password"
                    required
                    type="password"
                    name="password"
                    description="Password must be at least 8 characters long"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={
                        mode === 'login'
                            ? 'Enter your password'
                            : 'Create a password'
                    }
                />

                {mode === 'register' && (
                    <TextInput
                        label="Confirm Password"
                        required
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handleChange}
                        error={confirmError}
                        placeholder="Confirm your password"
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
    );
}

export default AuthForm;

