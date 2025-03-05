import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthForm } from './AuthForm';

describe('AuthForm', () => {
    const defaultProps = {
        onSubmit: vi.fn(),
        isLoading: false,
        errors: {},
        mode: 'login' as const,
        onToggleMode: vi.fn()
    };

    it('should render login form by default', () => {
        render(<AuthForm {...defaultProps} />);

        expect(screen.getByText('Sign In to Your Account')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
        expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Create an account' })).toBeInTheDocument();
    });

    it('should render registration form when mode is register', () => {
        render(<AuthForm {...defaultProps} mode="register" />);

        expect(screen.getByText('Create Your Account')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
        expect(screen.getByText("Already have an account?")).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    });

    it('should show loading state when isLoading is true', () => {
        const { rerender } = render(<AuthForm {...defaultProps} isLoading={true} />);
        expect(screen.getByRole('button', { name: 'Signing in...' })).toBeInTheDocument();

        rerender(<AuthForm {...defaultProps} isLoading={true} mode="register" />);
        expect(screen.getByRole('button', { name: 'Creating account...' })).toBeInTheDocument();
    });

    it('should display error messages', () => {
        const errors = {
            email: 'Invalid email address',
            password: 'Password is required'
        };

        render(<AuthForm {...defaultProps} errors={errors} />);

        expect(screen.getAllByText('Invalid email address').length).toBeGreaterThan(0);
        expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('should call onToggleMode when toggle button is clicked', () => {
        render(<AuthForm {...defaultProps} />);

        fireEvent.click(screen.getByRole('button', { name: 'Create an account' }));
        expect(defaultProps.onToggleMode).toHaveBeenCalledTimes(1);
    });

    it('should handle form submission', () => {
        render(<AuthForm {...defaultProps} />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

        expect(defaultProps.onSubmit).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123'
        });
    });

    it('should validate password confirmation in register mode', () => {
        render(<AuthForm {...defaultProps} mode="register" />);

        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');

        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });

        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();

        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
    });

    it('should show correct logo positioning based on screen size', () => {
        render(<AuthForm {...defaultProps} />);

        const desktopLogo = document.querySelector('.hidden.md\\:block');
        const mobileLogo = document.querySelector('.md\\:hidden');

        expect(desktopLogo).toBeInTheDocument();
        expect(mobileLogo).toBeInTheDocument();
    });
});
