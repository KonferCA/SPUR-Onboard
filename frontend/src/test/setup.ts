import { vi, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock auth services globally
vi.mock('@/services/auth', () => ({
    signin: vi.fn().mockResolvedValue({
        accessToken: 'mock-access-token',
        companyId: 'mock-company-id',
        user: {
            id: 'mock-user-id',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'user',
        },
    }),
    signout: vi.fn().mockResolvedValue(undefined),
    refreshAccessToken: vi.fn().mockResolvedValue({
        accessToken: 'mock-refresh-token',
        companyId: 'mock-company-id',
        user: {
            id: 'mock-user-id',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'user',
        },
    }),
    register: vi.fn().mockResolvedValue({
        accessToken: 'mock-access-token',
        user: {
            id: 'mock-user-id',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'user',
        },
    }),
}));

// Clean up mocks after each test
afterEach(() => {
    vi.clearAllMocks();
});
