import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextArea } from '@components';

describe('TextArea', () => {
    it('renders with basic props', () => {
        render(<TextArea placeholder="Enter text" />);
        expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders label when provided', () => {
        render(<TextArea label="Description" />);
        expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('shows required text when required prop is true', () => {
        render(<TextArea label="Description" required />);
        expect(screen.getByText('Required')).toBeInTheDocument();
    });

    it('displays error message', () => {
        render(<TextArea error="This field is required" />);
        expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('displays description text', () => {
        render(<TextArea description="Enter detailed description" />);
        expect(screen.getByText('Enter detailed description')).toBeInTheDocument();
    });

    it('handles onChange events', async () => {
        const handleChange = vi.fn();
        render(<TextArea onChange={handleChange} />);

        const textarea = screen.getByRole('textbox');
        await userEvent.type(textarea, 'test');

        expect(handleChange).toHaveBeenCalled();
        expect(textarea).toHaveValue('test');
    });

    it('forwards ref correctly', () => {
        const ref = vi.fn();
        render(<TextArea ref={ref} />);
        expect(ref).toHaveBeenCalled();
    });

    it('applies custom className', () => {
        render(<TextArea className="custom-class" />);
        expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });

    it('allows resizing', () => {
        render(<TextArea />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveClass('resize-y');
    });

    it('has minimum height', () => {
        render(<TextArea />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveClass('min-h-[100px]');
    });
});