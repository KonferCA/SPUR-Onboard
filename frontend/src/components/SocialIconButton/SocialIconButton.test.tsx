import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SocialIconButton } from './SocialIconButton';
import { SocialPlatform } from '@/types/auth';

describe('SocialIconButton', () => {
    const mockOnClick = vi.fn();

    beforeEach(() => {
        mockOnClick.mockClear();
    });

    describe('Platform-specific rendering', () => {
        it.each([
            [SocialPlatform.Discord, 'Discord'],
            [SocialPlatform.BlueSky, 'Bluesky'],
            [SocialPlatform.X, 'X'],
            [SocialPlatform.Instagram, 'Instagram'],
            [SocialPlatform.Facebook, 'Facebook'],
            [SocialPlatform.LinkedIn, 'LinkedIn'],
        ])('renders %s button correctly', (platform, altText) => {
            render(
                <SocialIconButton platform={platform} onClick={mockOnClick} />
            );

            expect(screen.getByAltText(altText)).toBeInTheDocument();
            expect(
                screen.getByRole('button', {
                    name: `Add ${altText} account`,
                })
            ).toBeInTheDocument();
        });

        it('renders custom URL button correctly', () => {
            render(
                <SocialIconButton
                    platform={SocialPlatform.CustomUrl}
                    onClick={mockOnClick}
                />
            );

            // Should not have an img element
            expect(screen.queryByRole('img')).not.toBeInTheDocument();
            // Should have the link icon (note: testing for presence of SVG)
            expect(document.querySelector('svg')).toBeInTheDocument();
        });
    });

    describe('Button interaction', () => {
        it('calls onClick with correct platform when clicked', () => {
            render(
                <SocialIconButton
                    platform={SocialPlatform.Discord}
                    onClick={mockOnClick}
                />
            );

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(mockOnClick).toHaveBeenCalledTimes(1);
            expect(mockOnClick).toHaveBeenCalledWith(SocialPlatform.Discord);
        });

        it('does not call onClick when disabled', () => {
            render(
                <SocialIconButton
                    platform={SocialPlatform.Discord}
                    onClick={mockOnClick}
                    disabled
                />
            );

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(mockOnClick).not.toHaveBeenCalled();
        });
    });

    describe('Button styling', () => {
        it('applies base styles', () => {
            render(
                <SocialIconButton
                    platform={SocialPlatform.Discord}
                    onClick={mockOnClick}
                />
            );

            const button = screen.getByRole('button');
            expect(button).toHaveClass('p-2', 'bg-blue-50', 'rounded-md');
        });

        it('applies disabled styles when disabled', () => {
            render(
                <SocialIconButton
                    platform={SocialPlatform.Discord}
                    onClick={mockOnClick}
                    disabled
                />
            );

            const button = screen.getByRole('button');
            expect(button).toHaveClass('grayscale');
            expect(button).toBeDisabled();
        });

        it('does not apply disabled styles when enabled', () => {
            render(
                <SocialIconButton
                    platform={SocialPlatform.Discord}
                    onClick={mockOnClick}
                />
            );

            const button = screen.getByRole('button');
            expect(button).not.toHaveClass('grayscale');
            expect(button).not.toBeDisabled();
        });
    });

    describe('Image attributes', () => {
        it('renders image with correct dimensions', () => {
            render(
                <SocialIconButton
                    platform={SocialPlatform.Discord}
                    onClick={mockOnClick}
                />
            );

            const image = screen.getByRole('img');
            expect(image).toHaveClass('w-6', 'h-6');
        });
    });

    describe('Error cases', () => {
        it('handles unknown platform gracefully', () => {
            render(
                // @ts-ignore Testing invalid platform
                <SocialIconButton platform="UNKNOWN" onClick={mockOnClick} />
            );

            // Should not crash and should render a button
            expect(screen.getByRole('button')).toBeInTheDocument();
            // Should not render an image
            expect(screen.queryByRole('img')).not.toBeInTheDocument();
        });
    });
});
