import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextInput } from '@components';

describe('TextInput', () => {
    it('renders with basic props', () => {
        render(<TextInput placeholder="Enter text" />);
        expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders label when provided', () => {
        render(<TextInput label="Name" />);
        expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('shows required text when required prop is true', () => {
        render(<TextInput label="Name" required />);
        expect(screen.getByText('Required')).toBeInTheDocument();
    });

    it('displays error message', () => {
        render(<TextInput error="This field is required" />);
        expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('displays description text', () => {
        render(<TextInput description="Enter your full name" />);
        expect(screen.getByText('Enter your full name')).toBeInTheDocument();
    });

    it('handles onChange events', async () => {
        const handleChange = vi.fn();
        render(<TextInput onChange={handleChange} />);

        const input = screen.getByRole('textbox');
        await userEvent.type(input, 'test');

        expect(handleChange).toHaveBeenCalled();
        expect(input).toHaveValue('test');
    });

    it('forwards ref correctly', () => {
        const ref = vi.fn();
        render(<TextInput ref={ref} />);
        expect(ref).toHaveBeenCalled();
    });

    it('applies custom className', () => {
        render(<TextInput className="custom-class" />);
        expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });
});
