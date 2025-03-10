import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SocialLinks } from './SocialLinks';
import { SocialPlatform } from '@/types/auth';
import type { UserSocial } from '@/types/auth';
import type {
    SocialCardProps,
    SocialIconButtonProps,
    TextInputProps,
} from '@/components';
import type { ConfirmationModalProps } from '@/components/ConfirmationModal';

// Mock child components
vi.mock('../SocialIconButton', () => ({
    SocialIconButton: ({
        platform,
        disabled,
        onClick,
    }: SocialIconButtonProps) => (
        <button
            type="button"
            onClick={() => onClick(platform)}
            disabled={disabled}
            data-testid={`social-icon-${platform}`}
        >
            {platform}
        </button>
    ),
}));

vi.mock('../SocialCard', () => ({
    SocialCard: ({ data, onRemove }: SocialCardProps) => (
        <div data-testid={`social-card-${data.platform}`}>
            {data.urlOrHandle}
            {/* biome-ignore lint/complexity/useOptionalChain: it is more intuative to use the && instead */}
            <button type="button" onClick={() => onRemove && onRemove(data)}>
                Remove
            </button>
        </div>
    ),
}));

vi.mock('../ConfirmationModal', () => ({
    ConfirmationModal: ({
        children,
        isOpen,
        onClose,
        primaryAction,
        title,
        description,
    }: ConfirmationModalProps) =>
        isOpen ? (
            <div data-testid="confirmation-modal">
                <h2>{title}</h2>
                <p>{description}</p>
                {children}
                <button
                    type="button"
                    onClick={primaryAction}
                    data-testid="confirm-button"
                >
                    Confirm
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    data-testid="cancel-button"
                >
                    Cancel
                </button>
            </div>
        ) : null,
}));

vi.mock('../TextInput', () => ({
    TextInput: ({
        value,
        onChange,
        error,
        prefix,
        label,
        placeholder,
    }: TextInputProps) => (
        <div>
            <label htmlFor="testinput">{label}</label>
            <div>
                {prefix && <span>{prefix}</span>}
                <input
                    id="testinput"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    data-testid="social-input"
                />
            </div>
            {error && <span>{error}</span>}
        </div>
    ),
}));

// Mock random id generation
vi.mock('@/utils/random', () => ({
    randomId: () => 'test-id',
}));

// Mock form validation
vi.mock('@/utils/form-validation', () => ({
    validateSocialLink: ({
        urlOrHandle,
    }: Pick<UserSocial, 'platform' | 'urlOrHandle'>) => {
        // Simple validation logic for testing
        return urlOrHandle.length > 0;
    },
}));

describe('SocialLinks', () => {
    const mockOnChange = vi.fn();
    const mockOnRemove = vi.fn();
    const defaultProps = {
        value: [],
        onChange: mockOnChange,
        onRemove: mockOnRemove,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Initial Rendering', () => {
        it('renders all social platform buttons', () => {
            render(<SocialLinks {...defaultProps} />);

            expect(
                screen.getByTestId(`social-icon-${SocialPlatform.LinkedIn}`)
            ).toBeInTheDocument();
            expect(
                screen.getByTestId(`social-icon-${SocialPlatform.Facebook}`)
            ).toBeInTheDocument();
            expect(
                screen.getByTestId(`social-icon-${SocialPlatform.Instagram}`)
            ).toBeInTheDocument();
            expect(
                screen.getByTestId(`social-icon-${SocialPlatform.X}`)
            ).toBeInTheDocument();
            expect(
                screen.getByTestId(`social-icon-${SocialPlatform.BlueSky}`)
            ).toBeInTheDocument();
            expect(
                screen.getByTestId(`social-icon-${SocialPlatform.Discord}`)
            ).toBeInTheDocument();
            expect(
                screen.getByTestId(`social-icon-${SocialPlatform.CustomUrl}`)
            ).toBeInTheDocument();
        });

        it('shows Optional text when required is false', () => {
            render(<SocialLinks {...defaultProps} required={false} />);
            expect(screen.getByText('Optional')).toBeInTheDocument();
        });

        it('shows Required text when required is true', () => {
            render(<SocialLinks {...defaultProps} required={true} />);
            expect(screen.getByText('Required')).toBeInTheDocument();
        });
    });

    describe('Social Platform Selection', () => {
        it('opens modal when social platform is selected', () => {
            render(<SocialLinks {...defaultProps} />);

            fireEvent.click(
                screen.getByTestId(`social-icon-${SocialPlatform.Discord}`)
            );

            expect(
                screen.getByTestId('confirmation-modal')
            ).toBeInTheDocument();
            expect(
                screen.getByText('Add your Discord Username')
            ).toBeInTheDocument();
        });

        it('disables platform button when already added', () => {
            const existingLinks = [
                {
                    id: '1',
                    platform: SocialPlatform.Discord,
                    urlOrHandle: 'testuser',
                },
            ];

            render(<SocialLinks {...defaultProps} value={existingLinks} />);

            const discordButton = screen.getByTestId(
                `social-icon-${SocialPlatform.Discord}`
            );
            expect(discordButton).toBeDisabled();
        });

        it('allows multiple custom URLs', () => {
            const existingLinks = [
                {
                    id: '1',
                    platform: SocialPlatform.CustomUrl,
                    urlOrHandle: 'https://example.com',
                },
            ];

            render(<SocialLinks {...defaultProps} value={existingLinks} />);

            const customUrlButton = screen.getByTestId(
                `social-icon-${SocialPlatform.CustomUrl}`
            );
            expect(customUrlButton).not.toBeDisabled();
        });
    });

    describe('Adding Social Links', () => {
        it('adds valid social link when confirmed', async () => {
            render(<SocialLinks {...defaultProps} />);

            // Open Discord modal
            fireEvent.click(
                screen.getByTestId(`social-icon-${SocialPlatform.Discord}`)
            );

            // Enter valid username
            const input = screen.getByTestId('social-input');
            fireEvent.change(input, { target: { value: 'testuser' } });

            // Confirm
            fireEvent.click(screen.getByTestId('confirm-button'));

            expect(mockOnChange).toHaveBeenCalledWith([
                {
                    id: 'test-id',
                    platform: SocialPlatform.Discord,
                    urlOrHandle: '@testuser',
                },
            ]);
        });

        it('adds valid social link with https:// prefix for URL-based platforms', () => {
            render(<SocialLinks {...defaultProps} />);

            // Open LinkedIn modal
            fireEvent.click(
                screen.getByTestId(`social-icon-${SocialPlatform.LinkedIn}`)
            );

            // Enter valid URL
            const input = screen.getByTestId('social-input');
            fireEvent.change(input, {
                target: { value: 'www.linkedin.com/in/test' },
            });

            // Confirm
            fireEvent.click(screen.getByTestId('confirm-button'));

            expect(mockOnChange).toHaveBeenCalledWith([
                {
                    id: 'test-id',
                    platform: SocialPlatform.LinkedIn,
                    urlOrHandle: 'https://www.linkedin.com/in/test',
                },
            ]);
        });

        it('shows error message for invalid input', () => {
            render(<SocialLinks {...defaultProps} />);

            // Open Discord modal
            fireEvent.click(
                screen.getByTestId(`social-icon-${SocialPlatform.Discord}`)
            );

            // Enter invalid username (empty)
            const input = screen.getByTestId('social-input');
            fireEvent.change(input, { target: { value: '' } });

            // Confirm
            fireEvent.click(screen.getByTestId('confirm-button'));

            expect(
                screen.getByText(
                    'Please enter a valid Discord username. I.E: example.username or example#0001'
                )
            ).toBeInTheDocument();
        });

        it('clears input and errors when modal is closed', async () => {
            render(<SocialLinks {...defaultProps} />);

            // Open Discord modal
            fireEvent.click(
                screen.getByTestId(`social-icon-${SocialPlatform.Discord}`)
            );

            // Enter something and trigger error
            const input = screen.getByTestId('social-input');
            fireEvent.change(input, { target: { value: '' } });
            fireEvent.click(screen.getByTestId('confirm-button'));

            // Close modal
            fireEvent.click(screen.getByTestId('cancel-button'));

            // Wait for timeout
            await waitFor(
                () => {
                    expect(
                        screen.queryByTestId('confirmation-modal')
                    ).not.toBeInTheDocument();
                },
                { timeout: 400 }
            );
        });
    });

    describe('Removing Social Links', () => {
        it('calls onRemove when remove button is clicked', () => {
            const existingLinks = [
                {
                    id: '1',
                    platform: SocialPlatform.Discord,
                    urlOrHandle: 'testuser',
                },
            ];

            render(<SocialLinks {...defaultProps} value={existingLinks} />);

            fireEvent.click(screen.getByText('Remove'));

            expect(mockOnRemove).toHaveBeenCalledWith(existingLinks[0]);
        });
    });

    describe('Platform-specific Behavior', () => {
        it.each([
            [SocialPlatform.Discord, '@', 'Discord Username', 'mydiscord'],
            [SocialPlatform.X, '@', 'X Handle', 'example_handle'],
            [
                SocialPlatform.Instagram,
                '@',
                'Instagram Username',
                'example.username',
            ],
            [
                SocialPlatform.Facebook,
                'https://',
                'Profile URL',
                'www.facebook.com/',
            ],
            [
                SocialPlatform.LinkedIn,
                'https://',
                'Profile URL',
                'www.linkedin.com/in/',
            ],
            [
                SocialPlatform.BlueSky,
                '@',
                'Bluesky Handle',
                'example.bluesky.com',
            ],
            [
                SocialPlatform.CustomUrl,
                'https://',
                'Custom URL',
                'www.example.com',
            ],
        ])(
            'renders correct input fields for %s',
            (platform, prefix, label, placeholder) => {
                render(<SocialLinks {...defaultProps} />);

                fireEvent.click(screen.getByTestId(`social-icon-${platform}`));

                expect(screen.getByText(label)).toBeInTheDocument();
                expect(screen.getByTestId('social-input')).toHaveAttribute(
                    'placeholder',
                    placeholder
                );

                // Check for prefix if it exists
                if (prefix) {
                    expect(screen.getByText(prefix)).toBeInTheDocument();
                }
            }
        );
    });
});
