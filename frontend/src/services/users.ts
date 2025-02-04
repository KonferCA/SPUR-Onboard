import { getApiUrl, HttpStatusCode } from '@/utils';
import { snakeToCamel } from '@/utils/object';
import { ApiError } from './errors';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'investor' | 'regular';
    permissions: number;
    dateJoined: string;
    emailVerified: boolean;
}

export interface UpdateUserRoleRequest {
    role: 'admin' | 'investor' | 'regular';
}

export async function getUsers(
    accessToken: string,
    params?: {
        role?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        page?: number;
        limit?: number;
    }
): Promise<{ users: User[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.role && params.role !== 'all') {
        queryParams.append('role', params.role);
    }
    if (params?.search) {
        queryParams.append('search', params.search);
    }
    if (params?.sortBy) {
        queryParams.append('sort_by', params.sortBy);
    }
    if (params?.sortOrder) {
        queryParams.append('sort_order', params.sortOrder);
    }
    if (params?.page) {
        queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
    }

    const url = `${getApiUrl('/users')}?${queryParams.toString()}`;
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (res.status !== HttpStatusCode.OK) {
        throw new ApiError('Failed to fetch users', res.status, await res.json());
    }

    const json = await res.json();
    return {
        users: json.users.map((user: any) => snakeToCamel(user)),
        total: json.total,
    };
}

export async function updateUserRole(
    accessToken: string,
    userId: string,
    data: UpdateUserRoleRequest
): Promise<User> {
    const url = getApiUrl(`/users/${userId}/role`);
    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            role: data.role,
        }),
    });

    if (res.status !== HttpStatusCode.OK) {
        throw new ApiError('Failed to update user role', res.status, await res.json());
    }

    const json = await res.json();
    return snakeToCamel(json);
}

export async function updateUsersRole(
    accessToken: string,
    userIds: string[],
    data: UpdateUserRoleRequest
): Promise<void> {
    const url = getApiUrl('/users/role/bulk');
    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_ids: userIds,
            role: data.role,
        }),
    });

    if (res.status !== HttpStatusCode.OK) {
        throw new ApiError('Failed to update user roles', res.status, await res.json());
    }
} 