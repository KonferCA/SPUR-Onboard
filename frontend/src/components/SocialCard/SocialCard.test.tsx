import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SocialCard } from './SocialCard';
import { SocialPlatform } from '@/types/auth';
import type { SocialLink } from '@/types';

describe('SocialCard', () => {
    const mockOnRemove = vi.fn();

    // Helper function to create test data
    const createTestData = (
        platform: SocialPlatform,
        urlOrHandle: string,
        id: string = '1'
    ): SocialLink => ({
        platform,
        urlOrHandle,
        id,
    });

    beforeEach(() => {
        mockOnRemove.mockClear();
    });

    it('renders Discord social card correctly', () => {
        const data = createTestData(SocialPlatform.Discord, 'username#1234');
        render(<SocialCard data={data} />);

        expect(screen.getByAltText('Discord')).toBeInTheDocument();
        expect(screen.getByText('username#1234')).toBeInTheDocument();
    });

    it('renders Bluesky social card with correct handle format', () => {
        const data = createTestData(
            SocialPlatform.BlueSky,
            'handle.bsky.social'
        );
        render(<SocialCard data={data} />);

        expect(screen.getByAltText('Bluesky')).toBeInTheDocument();
        expect(screen.getByText('handle')).toBeInTheDocument();
    });

    it('renders Facebook social card with correct handle format', () => {
        const data = createTestData(
            SocialPlatform.Facebook,
            'https://facebook.com/username'
        );
        render(<SocialCard data={data} />);

        expect(screen.getByAltText('Facebook')).toBeInTheDocument();
        expect(screen.getByText('username')).toBeInTheDocument();
    });

    it('renders LinkedIn social card with correct handle format', () => {
        const data = createTestData(
            SocialPlatform.LinkedIn,
            'https://linkedin.com/in/username'
        );
        render(<SocialCard data={data} />);

        expect(screen.getByAltText('LinkedIn')).toBeInTheDocument();
        expect(screen.getByText('username')).toBeInTheDocument();
    });

    it('renders X (Twitter) social card correctly', () => {
        const data = createTestData(SocialPlatform.X, '@username');
        render(<SocialCard data={data} />);

        expect(screen.getByAltText('X')).toBeInTheDocument();
        expect(screen.getByText('@username')).toBeInTheDocument();
    });

    it('renders Instagram social card correctly', () => {
        const data = createTestData(SocialPlatform.Instagram, '@username');
        render(<SocialCard data={data} />);

        expect(screen.getByAltText('Instagram')).toBeInTheDocument();
        expect(screen.getByText('@username')).toBeInTheDocument();
    });

    it('renders custom URL card correctly', () => {
        const data = createTestData(
            SocialPlatform.CustomUrl,
            'https://www.example.com/path'
        );
        render(<SocialCard data={data} />);

        // Should show link icon instead of platform logo
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
        expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    it('handles custom URL without www correctly', () => {
        const data = createTestData(
            SocialPlatform.CustomUrl,
            'https://example.com/path'
        );
        render(<SocialCard data={data} />);

        expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    it('handles custom URL with http correctly', () => {
        const data = createTestData(
            SocialPlatform.CustomUrl,
            'http://example.com/path'
        );
        render(<SocialCard data={data} />);

        expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    it('calls onRemove when remove button is clicked', () => {
        const data = createTestData(SocialPlatform.Discord, 'username#1234');
        render(<SocialCard data={data} onRemove={mockOnRemove} />);

        const removeButton = screen.getByRole('button', {
            name: 'remove Discord social',
        });
        fireEvent.click(removeButton);

        expect(mockOnRemove).toHaveBeenCalledTimes(1);
        expect(mockOnRemove).toHaveBeenCalledWith(data);
    });

    it('does not throw error when onRemove is not provided', () => {
        const data = createTestData(SocialPlatform.Discord, 'username#1234');
        render(<SocialCard data={data} />);

        const removeButton = screen.getByRole('button', {
            name: 'remove Discord social',
        });

        // Should not throw error
        expect(() => fireEvent.click(removeButton)).not.toThrow();
    });
});
