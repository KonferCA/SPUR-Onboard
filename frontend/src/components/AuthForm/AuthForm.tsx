import { useState } from 'react';
import { Button, TextInput } from '@/components';
import type { AuthFormProps, AuthFormData } from '@/types/auth';
import { LogoSVG } from '@/assets';

export function AuthForm({ 
    onSubmit, 
    isLoading, 
    errors, 
    mode, 
    onToggleMode 
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
            setConfirmError(value !== formData.password ? 'Passwords do not match' : '');
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
            if (name === 'password' && mode === 'register') {
                setConfirmError(value !== confirmPassword ? 'Passwords do not match' : '');
            }
        }
    };

    const isValidForm = mode === 'login' || 
        (formData.password && formData.password === confirmPassword);

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
                    {mode === 'login' ? 'Sign In to Your Account' : 'Create Your Account'}
                </h2>
                
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

                    <TextInput
                        label="Password"
                        required
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'}
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
                                ? (mode === 'login' ? 'Signing in...' : 'Creating account...') 
                                : (mode === 'login' ? 'Sign In' : 'Create Account')}
                        </Button>
                    </div>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            {mode === 'login' 
                                ? "Don't have an account?" 
                                : "Already have an account?"}
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