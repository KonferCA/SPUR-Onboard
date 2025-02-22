import { describe, it, expect } from 'vitest';
import { TextInput } from './TextInput';
import { render, screen } from '@testing-library/react';

describe('TextInput test', () => {
    it('should render just a text input', () => {
        render(<TextInput />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render a text input with a label', () => {
        render(<TextInput label="label" />);
        expect(screen.getByLabelText('label')).toBeInTheDocument();
    });

    it('should render a text input with prefix', () => {
        render(<TextInput label="label" prefix="prefix" />);
        expect(screen.getByLabelText('label')).toBeInTheDocument();
        expect(screen.getByText('prefix')).toBeInTheDocument();
    });

    it('should render a description for text input', () => {
        render(<TextInput description="desc" />);
        expect(
            screen.getByRole('textbox', { description: 'desc' })
        ).toBeInTheDocument();
    });

    it('should render an error message instead of description for text input', () => {
        render(<TextInput description="desc" error="error" />);
        expect(
            screen.queryByRole('textbox', { description: 'desc' })
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('textbox', { description: 'error' })
        ).toBeInTheDocument();
    });
});
