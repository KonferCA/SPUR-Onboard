import React, { ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfirmationModal } from './ConfirmationModal';

// Create a simpler mock for headless UI components
vi.mock('@headlessui/react', () => {
    const Fragment = React.Fragment;
    
    // Simple mock components that implement the minimal functionality needed for tests
    const DialogMock = ({ children, className }: { 
        children: ReactNode; 
        className?: string; 
    }) => {
        return <div className={className}>{children}</div>;
    };
    
    DialogMock.Panel = ({ children }: { children: ReactNode }) => 
        <div data-testid="dialog-panel">{children}</div>;
        
    DialogMock.Title = ({ children }: { children: ReactNode }) => 
        <div data-testid="dialog-title">{children}</div>;
        
    DialogMock.Description = ({ children }: { children: ReactNode }) => 
        <div data-testid="dialog-description">{children}</div>;
    
    const TransitionMock = ({ children, show = true }: { 
        children: ReactNode; 
        show?: boolean;
        appear?: boolean;
    }) => {
        if (!show) return null;
        return <>{children}</>;
    };
    
    TransitionMock.Child = ({ children }: { 
        children: ReactNode;
    }) => {
        return <>{children}</>;
    };
    
    return {
        Dialog: DialogMock,
        Transition: TransitionMock,
        Fragment,
    };
});

describe('ConfirmationModal', () => {
    // basic setup for all tests
    const mockOnClose = vi.fn();
    const mockPrimaryAction = vi.fn();
    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        primaryAction: mockPrimaryAction,
        children: <div>test content</div>,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders modal content when isOpen is true', () => {
        render(<ConfirmationModal {...defaultProps} />);
        
        // check content is rendered
        expect(screen.getByText('test content')).toBeInTheDocument();
    });

    it('does not render anything when isOpen is false', () => {
        const { container } = render(<ConfirmationModal {...defaultProps} isOpen={false} />);
        
        // the container should be empty
        expect(container.firstChild).toBeNull();
    });

    it('calls onClose when secondary button is clicked', () => {
        render(<ConfirmationModal {...defaultProps} secondaryActionText="Cancel" />);
        
        fireEvent.click(screen.getByText('Cancel'));
        
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls primaryAction when primary button is clicked', () => {
        render(<ConfirmationModal {...defaultProps} primaryActionText="Confirm" />);
        
        fireEvent.click(screen.getByText('Confirm'));
        
        expect(mockPrimaryAction).toHaveBeenCalledTimes(1);
    });

    it('renders title and description when provided', () => {
        render(
            <ConfirmationModal
                {...defaultProps}
                title="Test Title"
                description="Test Description"
            />
        );
        
        expect(screen.getByTestId('dialog-title')).toHaveTextContent('Test Title');
        expect(screen.getByTestId('dialog-description')).toHaveTextContent('Test Description');
    });

    it('renders additionalButtons when provided', () => {
        const additionalButton = <button data-testid="additional-button">Extra Action</button>;
        
        render(
            <ConfirmationModal
                {...defaultProps}
                additionalButtons={additionalButton}
            />
        );
        
        expect(screen.getByTestId('additional-button')).toBeInTheDocument();
    });
}); 