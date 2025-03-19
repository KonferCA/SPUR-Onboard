import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthForm } from './AuthForm';

describe('AuthForm', () => {
    const defaultProps = {
        onSubmit: vi.fn(),
        isLoading: false,
        errors: {},
        mode: 'login' as const,
        onToggleMode: vi.fn(),
    };

    it('should render login form by default', () => {
        render(<AuthForm {...defaultProps} />);

        expect(screen.getByText('Sign In to Your Account')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Sign In' })
        ).toBeInTheDocument();
        expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Create an account' })
        ).toBeInTheDocument();
    });

    it('should render registration form when mode is register', () => {
        render(<AuthForm {...defaultProps} mode="register" />);

        expect(screen.getByText('Create Your Account')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Create Account' })
        ).toBeInTheDocument();
        expect(
            screen.getByText('Already have an account?')
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Sign in' })
        ).toBeInTheDocument();
    });

    it('should show loading state when isLoading is true', () => {
        const { rerender } = render(
            <AuthForm {...defaultProps} isLoading={true} />
        );
        expect(
            screen.getByRole('button', { name: 'Signing in...' })
        ).toBeInTheDocument();

        rerender(
            <AuthForm {...defaultProps} isLoading={true} mode="register" />
        );
        expect(
            screen.getByRole('button', { name: 'Creating account...' })
        ).toBeInTheDocument();
    });

    it('should display error messages', () => {
        const errors = {
            email: 'Invalid email address',
            password: 'Password is required',
        };

        render(<AuthForm {...defaultProps} errors={errors} />);

        expect(
            screen.getAllByText('Invalid email address').length
        ).toBeGreaterThan(0);
        expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('should call onToggleMode when toggle button is clicked', () => {
        render(<AuthForm {...defaultProps} />);

        fireEvent.click(
            screen.getByRole('button', { name: 'Create an account' })
        );
        expect(defaultProps.onToggleMode).toHaveBeenCalledTimes(1);
    });

    it('should handle form submission', () => {
        render(<AuthForm {...defaultProps} />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        fireEvent.change(emailInput, {
            target: { name: 'email', value: 'test@example.com' },
        });
        fireEvent.change(passwordInput, {
            target: { name: 'password', value: 'password123' },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

        expect(defaultProps.onSubmit).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        });
    });

    it('should validate password confirmation in register mode', () => {
        render(<AuthForm {...defaultProps} mode="register" />);

        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');

        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, {
            target: { value: 'password456' },
        });

        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();

        fireEvent.change(confirmPasswordInput, {
            target: { value: 'password123' },
        });
        expect(
            screen.queryByText('Passwords do not match')
        ).not.toBeInTheDocument();
    });

    it('should show password requirements in register mode', () => {
        render(<AuthForm {...defaultProps} mode="register" />);

        const passwordInput = screen.getByLabelText('Password');

        // type something to trigger validation
        fireEvent.change(passwordInput, {
            target: { name: 'password', value: 'a' },
        });

        // password requirements should be visible
        expect(screen.getByText('Password must contain:')).toBeInTheDocument();
        expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
        expect(
            screen.getByText('At least one uppercase letter')
        ).toBeInTheDocument();
        expect(screen.getByText('At least one number')).toBeInTheDocument();
        expect(
            screen.getByText('At least one special character')
        ).toBeInTheDocument();
    });

    it('should validate minimum length requirement', () => {
        render(<AuthForm {...defaultProps} mode="register" />);

        const passwordInput = screen.getByLabelText('Password');

        // type short password that will trigger requirements to display
        // since it's not fully valid
        fireEvent.change(passwordInput, {
            target: { name: 'password', value: 'A1!' },
        });

        // wait for requirements to appear and verify the length requirement is not met (not green)
        const lengthRequirement = screen
            .getByText('At least 8 characters')
            .closest('li');
        expect(lengthRequirement?.className || '').not.toContain(
            'text-green-600'
        );

        // type longer password that still has missing requirements (missing uppercase)
        // to keep the requirements list visible
        fireEvent.change(passwordInput, {
            target: { name: 'password', value: 'abcdefg1!' },
        });

        // length requirement should be met (green)
        const updatedLengthRequirement = screen
            .getByText('At least 8 characters')
            .closest('li');
        expect(updatedLengthRequirement?.className || '').toContain(
            'text-green-600'
        );
    });

    it('should validate uppercase letter requirement', () => {
        render(<AuthForm {...defaultProps} mode="register" />);

        const passwordInput = screen.getByLabelText('Password');

        // type password without uppercase but with some requirements not met
        // so requirements stay visible
        fireEvent.change(passwordInput, {
            target: { name: 'password', value: 'abcdefg1!' },
        });

        // uppercase requirement should not be met (not green)
        const uppercaseRequirement = screen
            .getByText('At least one uppercase letter')
            .closest('li');
        expect(uppercaseRequirement?.className || '').not.toContain(
            'text-green-600'
        );

        // type password with uppercase still missing some requirements
        fireEvent.change(passwordInput, {
            target: { name: 'password', value: 'Abcdef!' },
        });

        // uppercase requirement should be met (green)
        const updatedUppercaseRequirement = screen
            .getByText('At least one uppercase letter')
            .closest('li');
        expect(updatedUppercaseRequirement?.className || '').toContain(
            'text-green-600'
        );
    });

    it('should validate number requirement', () => {
        render(<AuthForm {...defaultProps} mode="register" />);

        const passwordInput = screen.getByLabelText('Password');

        // type password without number but with some requirements not met
        fireEvent.change(passwordInput, {
            target: { name: 'password', value: 'Abcdefg!' },
        });

        // number requirement should not be met (not green)
        const numberRequirement = screen
            .getByText('At least one number')
            .closest('li');
        expect(numberRequirement?.className || '').not.toContain(
            'text-green-600'
        );

        // type password with number still missing some requirements
        fireEvent.change(passwordInput, {
            target: { name: 'password', value: 'Abcde1' },
        });

        // number requirement should be met (green)
        const updatedNumberRequirement = screen
            .getByText('At least one number')
            .closest('li');
        expect(updatedNumberRequirement?.className || '').toContain(
            'text-green-600'
        );
    });

    it('should validate special character requirement', () => {
        render(<AuthForm {...defaultProps} mode="register" />);

        const passwordInput = screen.getByLabelText('Password');

        // type password without special character but with some requirements not met
        fireEvent.change(passwordInput, {
            target: { name: 'password', value: 'Abcdefg1' },
        });

        // special character requirement should not be met (not green)
        const specialCharRequirement = screen
            .getByText('At least one special character')
            .closest('li');
        expect(specialCharRequirement?.className || '').not.toContain(
            'text-green-600'
        );

        // type password with special character still missing some requirements
        fireEvent.change(passwordInput, {
            target: { name: 'password', value: 'Abc!' },
        });

        // special character requirement should be met (green)
        const updatedSpecialCharRequirement = screen
            .getByText('At least one special character')
            .closest('li');
        expect(updatedSpecialCharRequirement?.className || '').toContain(
            'text-green-600'
        );
    });

    it('should disable submit button if password requirements are not met', () => {
        render(<AuthForm {...defaultProps} mode="register" />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByRole('button', {
            name: 'Create Account',
        });

        // fill email
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        // fill password that doesn't meet all requirements (missing uppercase)
        fireEvent.change(passwordInput, { target: { value: 'password1!' } });
        fireEvent.change(confirmPasswordInput, {
            target: { value: 'password1!' },
        });

        // button should be disabled
        expect(submitButton).toBeDisabled();

        // update password to meet all requirements
        fireEvent.change(passwordInput, { target: { value: 'Password1!' } });
        fireEvent.change(confirmPasswordInput, {
            target: { value: 'Password1!' },
        });

        // button should be enabled
        expect(submitButton).not.toBeDisabled();
    });

    it('should show correct logo positioning based on screen size', () => {
        render(<AuthForm {...defaultProps} />);

        const desktopLogo = document.querySelector('.hidden.md\\:block');
        const mobileLogo = document.querySelector('.md\\:hidden');

        expect(desktopLogo).toBeInTheDocument();
        expect(mobileLogo).toBeInTheDocument();
    });
});
