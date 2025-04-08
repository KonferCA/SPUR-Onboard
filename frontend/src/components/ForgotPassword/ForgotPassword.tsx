import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button, TextInput } from '@/components';
import { requestPasswordReset } from '@/services/auth';
import { FiCheck } from 'react-icons/fi';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const navigate = useNavigate({ from: '/forgot-password' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await requestPasswordReset(email);
            setEmailSent(true);
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

    return (
        <div className="w-full max-w-md bg-white bg-opacity-95 rounded-lg shadow-md p-8 md:p-10">
            <h2 className="text-2xl font-semibold text-center mb-6 md:mb-8">
                Reset Your Password
            </h2>

            {emailSent ? (
                <div className="text-center">
                    <div className="mb-4 text-green-600">
                        <FiCheck className="w-16 h-16 mx-auto" />
                    </div>
                    <p className="mb-4">
                        If an account exists for {email}, you will receive an
                        email with instructions to reset your password.
                    </p>
                    <Button
                        type="button"
                        onClick={() => navigate({ to: '/auth' })}
                        liquid
                        variant="primary"
                        className="bg-orange-500 hover:bg-orange-600"
                    >
                        Return to Login
                    </Button>
                </div>
            ) : (
                <>
                    {error && (
                        <div className="my-4 p-4 bg-red-100 rounded-lg">
                            <p className="text-red-500">{error}</p>
                        </div>
                    )}
                    <p className="mb-4">
                        Enter your email address and we'll send you a link to
                        reset your password.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex flex-col">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email Address
                            </label>
                            <TextInput
                                required
                                type="email"
                                name="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="pt-2">
                            <Button
                                type="submit"
                                liquid
                                size="md"
                                variant="primary"
                                disabled={isLoading || !email}
                                className="bg-orange-500 hover:bg-orange-600 py-2"
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </div>
                    </form>
                    <div className="mt-4 text-center">
                        <Link
                            to="/auth"
                            className="text-sm font-medium text-orange-600 hover:text-orange-500"
                        >
                            Return to login
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
