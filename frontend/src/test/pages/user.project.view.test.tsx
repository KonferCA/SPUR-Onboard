import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route } from '@/pages/user/_auth/_appshell/project/$projectId/view';
import { getProjectDetails } from '@/services/project';
import { ProjectStatusEnum } from '@/services/projects';

// Mock the redirects from @tanstack/react-router
const mockRedirect = vi.fn();
vi.mock('@tanstack/react-router', async () => {
    const actual = await vi.importActual('@tanstack/react-router');
    return {
        ...actual,
        // biome-ignore lint:
        redirect: (options: any) => {
            mockRedirect(options);
            throw new Error('Redirect');
        },
        createMemoryHistory: vi.fn(() => ({
            location: {
                state: {},
                search: '',
                pathname: '/user/project/123/view',
            },
        })),
        createRootRouteWithContext: vi.fn(),
        createRouter: vi.fn(),
    };
});

// Mock the project service
vi.mock('@/services/project', () => ({
    getProjectDetails: vi.fn(),
    getLatestProjectSnapshot: vi.fn(() =>
        Promise.resolve({ data: { questions: [] } })
    ),
}));

// Mock the comment service
vi.mock('@/services/comment', () => ({
    getProjectComments: vi.fn(() => Promise.resolve([])),
}));

describe('Project View Route - beforeLoad', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects to form when project status is needs review and allow_edit is true', async () => {
        const mockParams = { projectId: '123' };
        const mockContext = { auth: { accessToken: 'test-token' } };

        // Mock project details with "needs review" status and allow_edit true
        // biome-ignore lint:
        (getProjectDetails as any).mockResolvedValue({
            id: '123',
            title: 'Test Project',
            description: 'Test Description',
            status: ProjectStatusEnum.NeedsReview,
            allow_edit: true,
        });

        expect(Route.options.beforeLoad).toBeDefined();

        if (Route.options.beforeLoad) {
            // The redirect should throw an error, which we catch here
            await expect(
                Route.options.beforeLoad({
                    context: mockContext,
                    params: mockParams,
                    // biome-ignore lint:
                } as any)
            ).rejects.toThrow();
        }

        // Verify getProjectDetails was called with the correct parameters
        expect(getProjectDetails).toHaveBeenCalledWith('test-token', '123');

        // Verify redirect was called with the correct parameters
        expect(mockRedirect).toHaveBeenCalledWith({
            to: '/user/project/123/form',
            replace: true,
        });
    });

    it('does not redirect when project status is needs review but allow_edit is false', async () => {
        const mockParams = { projectId: '123' };
        const mockContext = { auth: { accessToken: 'test-token' } };

        // Mock project details with "needs review" status but allow_edit false
        // biome-ignore lint:
        (getProjectDetails as any).mockResolvedValue({
            id: '123',
            title: 'Test Project',
            description: 'Test Description',
            status: ProjectStatusEnum.NeedsReview,
            allow_edit: false,
        });

        expect(Route.options.beforeLoad).toBeDefined();

        if (Route.options.beforeLoad) {
            // Execute the beforeLoad function
            await Route.options.beforeLoad({
                context: mockContext,
                params: mockParams,
                // biome-ignore lint:
            } as any);
        }

        // Verify getProjectDetails was called with the correct parameters
        expect(getProjectDetails).toHaveBeenCalledWith('test-token', '123');

        // Verify redirect was NOT called
        expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('does not redirect when project status is not needs review', async () => {
        const mockParams = { projectId: '123' };
        const mockContext = { auth: { accessToken: 'test-token' } };

        // Mock project details with a different status
        // biome-ignore lint:
        (getProjectDetails as any).mockResolvedValue({
            id: '123',
            title: 'Test Project',
            description: 'Test Description',
            status: ProjectStatusEnum.Pending,
            allow_edit: true,
        });

        expect(Route.options.beforeLoad).toBeDefined();

        if (Route.options.beforeLoad) {
            // Execute the beforeLoad function
            await Route.options.beforeLoad({
                context: mockContext,
                params: mockParams,
                // biome-ignore lint:
            } as any);
        }

        // Verify getProjectDetails was called with the correct parameters
        expect(getProjectDetails).toHaveBeenCalledWith('test-token', '123');

        // Verify redirect was NOT called
        expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('redirects to auth when no access token is available', async () => {
        const mockParams = { projectId: '123' };
        const mockContext = { auth: null };

        expect(Route.options.beforeLoad).toBeDefined();

        if (Route.options.beforeLoad) {
            // The redirect should throw an error, which we catch here
            await expect(
                Route.options.beforeLoad({
                    context: mockContext,
                    params: mockParams,
                    // biome-ignore lint:
                } as any)
            ).rejects.toThrow();
        }

        // Verify redirect was called with the correct parameters
        expect(mockRedirect).toHaveBeenCalledWith({
            to: '/auth',
            replace: true,
        });
    });
});
