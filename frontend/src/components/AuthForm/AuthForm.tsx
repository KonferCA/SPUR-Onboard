// src/components/AuthForm/AuthForm.tsx
import { useState } from 'react';
import { Button, TextInput } from '@/components';
import type { AuthFormProps, AuthFormData } from '@/types/auth';

const PASSWORD_REQUIREMENTS = [
    { regex: /.{8,}/, text: "At least 8 characters long" },
    { regex: /[0-9]/, text: "Contains a number" },
    { regex: /[a-z]/, text: "Contains a lowercase letter" },
    { regex: /[A-Z]/, text: "Contains an uppercase letter" },
    { regex: /[^A-Za-z0-9]/, text: "Contains a special character" }
];

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
    const [passwordStrength, setPasswordStrength] = useState<string[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        if (name === 'password' && mode === 'register') {
            const meetingRequirements = PASSWORD_REQUIREMENTS.filter(
                req => req.regex.test(value)
            ).map(req => req.text);
            setPasswordStrength(meetingRequirements);
        }
    };

    const isValidPassword = mode === 'login' || 
        passwordStrength.length === PASSWORD_REQUIREMENTS.length;

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
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

                <div className="space-y-2">
                    <TextInput
                        label="Password"
                        required
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        placeholder={mode === 'login' ? 'Enter your password' : 'Create a strong password'}
                    />
                    
                    {mode === 'register' && (
                        <div className="text-sm space-y-1">
                            {PASSWORD_REQUIREMENTS.map(req => (
                                <div 
                                    key={req.text}
                                    className={`flex items-center space-x-2 ${
                                        passwordStrength.includes(req.text) 
                                            ? 'text-green-600' 
                                            : 'text-gray-500'
                                    }`}
                                >
                                    <span className="text-xs">
                                        {passwordStrength.includes(req.text) ? '✓' : '○'}
                                    </span>
                                    <span>{req.text}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pt-2">
                    <Button
                        type="submit"
                        liquid
                        size="lg"
                        variant="primary"
                        disabled={isLoading || !isValidPassword}
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
    );
}

export default AuthForm;