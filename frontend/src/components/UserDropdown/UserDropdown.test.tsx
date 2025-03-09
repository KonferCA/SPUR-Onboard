import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserDropdown } from './UserDropdown';
import type { User } from '@/types';

vi.mock('@tanstack/react-router', async () => {
    const actual = await vi.importActual('@tanstack/react-router');
    return {
        ...actual,
        Link: ({
            children,
            onClick,
            className,
        }: {
            children: React.ReactNode;
            onClick: () => void;
            className: string;
        }) => (
            <button
                type="button"
                onClick={onClick}
                className={className}
                data-testid="mock-link"
            >
                {children}
            </button>
        ),

        createMemoryRouter: () => ({
            navigate: vi.fn(),
        }),
    };
});

vi.mock('@/components/ProfilePicture/ProfilePicture', () => ({
    ProfilePicture: ({
        url,
        initials,
        size,
    }: { url: string; initials: string; size: string }) => (
        <div
            data-testid="profile-picture-mock"
            data-url={url}
            data-initials={initials}
            data-size={size}
        >
            ProfilePicture
        </div>
    ),
}));

vi.mock('framer-motion', () => ({
    motion: {
        div: ({
            children,
            animate,
            initial,
            transition,
            ...props
        }: {
            children: React.ReactNode;
            // biome-ignore lint/suspicious/noExplicitAny: skip getting prop types from motion
            animate?: any;
            // biome-ignore lint/suspicious/noExplicitAny: skip getting prop types from motion
            initial?: any;
            // biome-ignore lint/suspicious/noExplicitAny: skip getting prop types from motion
            transition?: any;
        }) => (
            <div data-animate={animate} data-transition={transition} {...props}>
                {children}
            </div>
        ),
    },
}));

describe('UserDropdown', () => {
    const mockUser = {
        firstName: 'Nausher',
        lastName: 'Rao',
        profilePictureUrl: 'https://example.com/sherrao.jpg',
    } as User;

    const mockOnLogout = vi.fn(() => Promise.resolve());
    const mockOnSettingsClick = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render with user information', () => {
        render(
            <UserDropdown
                user={mockUser}
                onLogout={mockOnLogout}
                onSettingsClick={mockOnSettingsClick}
            />
        );

        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.queryByText('Settings')).not.toBeInTheDocument();
        expect(screen.queryByText('Log Out')).not.toBeInTheDocument();
    });

    it('should open dropdown when button is clicked', () => {
        render(
            <UserDropdown
                user={mockUser}
                onLogout={mockOnLogout}
                onSettingsClick={mockOnSettingsClick}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Log Out')).toBeInTheDocument();
    });

    it('should close dropdown when clicking outside', async () => {
        render(
            <div>
                <div data-testid="outside-element">Outside Element</div>

                <UserDropdown
                    user={mockUser}
                    onLogout={mockOnLogout}
                    onSettingsClick={mockOnSettingsClick}
                />
            </div>
        );

        // open the dropdown
        const button = screen.getByRole('button');
        fireEvent.click(button);

        // check dropdown is open
        expect(screen.getByText('Settings')).toBeInTheDocument();

        // click outside
        const outsideElement = screen.getByTestId('outside-element');
        fireEvent.mouseDown(outsideElement);

        // dropdown should close
        await waitFor(() => {
            expect(screen.queryByText('Settings')).not.toBeInTheDocument();
        });
    });

    it('should call onSettingsClick when settings is clicked', () => {
        render(
            <UserDropdown
                user={mockUser}
                onLogout={mockOnLogout}
                onSettingsClick={mockOnSettingsClick}
            />
        );

        // open the dropdown
        const button = screen.getByRole('button');
        fireEvent.click(button);

        // click settings
        const settingsLink = screen.getByTestId('mock-link');
        fireEvent.click(settingsLink);

        // check if onSettingsClick was called
        expect(mockOnSettingsClick).toHaveBeenCalledTimes(1);
    });

    it('should call onLogout when logout is clicked', async () => {
        render(
            <UserDropdown
                user={mockUser}
                onLogout={mockOnLogout}
                onSettingsClick={mockOnSettingsClick}
            />
        );

        // open the dropdown
        const button = screen.getByRole('button');
        fireEvent.click(button);

        // click logout
        const logoutButton = screen.getByText('Log Out');
        fireEvent.click(logoutButton);

        // check if onLogout was called
        expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    it('should work without onSettingsClick prop', () => {
        render(<UserDropdown user={mockUser} onLogout={mockOnLogout} />);

        // open the dropdown
        const button = screen.getByRole('button');
        fireEvent.click(button);

        // click settings - should not throw error even without the prop
        const settingsLink = screen.getByText('Settings');
        expect(() => fireEvent.click(settingsLink)).not.toThrow();
    });

    it('should handle users with missing name properties', () => {
        const incompleteUser = {
            // no firstName or lastName
            profilePictureUrl: 'https://example.com/sherrao.jpg',
        } as User;

        render(<UserDropdown user={incompleteUser} onLogout={mockOnLogout} />);

        // should still render without errors
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should toggle dropdown when button is clicked multiple times', () => {
        render(<UserDropdown user={mockUser} onLogout={mockOnLogout} />);

        const button = screen.getByRole('button');

        // first click - open
        fireEvent.click(button);
        expect(screen.getByText('Settings')).toBeInTheDocument();

        // second click - close
        fireEvent.click(button);
        expect(screen.queryByText('Settings')).not.toBeInTheDocument();

        // third click - open again
        fireEvent.click(button);
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });
});
