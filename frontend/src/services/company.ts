import { getApiUrl, HttpStatusCode } from '@utils';
import { ApiError } from './errors';

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
    });

    const json = await res.json();

    if (res.status !== HttpStatusCode.CREATED) {
        throw new ApiError('Failed to create company', res.status, json);
    }

    return json as CreateCompanyResponse;
}

