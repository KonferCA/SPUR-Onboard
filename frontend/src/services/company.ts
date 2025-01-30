import { getApiUrl, HttpStatusCode } from '@utils';
import { ApiError } from './errors';
import { fetchWithAuth } from './auth';
import type { Company, UpdateCompanyRequest } from '@/types/company'

interface CreateCompanyResponse {
    ID: string;
    OwnerUserID: string;
    Name: string;
    Description: string | null;
    IsVerified: boolean;
    CreatedAt: string;
    UpdatedAt: string;
}

export async function createCompany(
    ownerUserId: string,
    name: string,
    description?: string
): Promise<CreateCompanyResponse> {
    const url = getApiUrl('/companies');
    const body = {
        owner_user_id: ownerUserId,
        name,
        description,
    };

    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });

    const json = await res.json();

    if (res.status !== HttpStatusCode.CREATED) {
        throw new ApiError('Failed to create company', res.status, json);
    }

    return json as CreateCompanyResponse;
}

export async function getCompany(): Promise<Company> {
    const response = await fetchWithAuth(getApiUrl('/company'))

    if (!response.ok) {
        throw new Error('Failed to fetch company')
    }

    return response.json()
}

export async function updateCompany(data: UpdateCompanyRequest): Promise<Company> {
    const response = await fetchWithAuth(getApiUrl('/company'), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        throw new Error('Failed to update company')
    }

    return response.json()
}
