import { getApiUrl, HttpStatusCode } from '@utils';
import { ApiError } from './errors';
import { CompanyInformation } from '@/types/company';

export interface CompanyResponse {
    id: string;
    owner_id: string;
    name: string;
    description: string | null;
    date_founded: number;
    stages: string[];
    website: string | null;
    wallet_address: string | null;
    linkedin_url: string;
    created_at: number;
    updated_at: number;
}

export async function createCompany(
    token: string,
    data: CompanyInformation
): Promise<CompanyResponse> {
    const url = getApiUrl('/company/new');
    const body = {
        name: data.name,
        description: data.description,
        date_founded: Math.floor(data.dateFounded.getTime() / 1000),
        stages: data.stage.map((s) => s.value),
        website: data.website,
        linkedin_url: data.linkedin || '',
    };

    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
    });

    const json = await res.json();
    if (res.status !== HttpStatusCode.CREATED) {
        throw new ApiError('Failed to create company', res.status, json);
    }
    return json as CompanyResponse;
}

export async function getCompany(
    token: string
): Promise<CompanyResponse | null> {
    const url = getApiUrl('/company');
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (res.status === HttpStatusCode.NOT_FOUND) {
        return null;
    }

    const json = await res.json();
    if (res.status !== HttpStatusCode.OK) {
        throw new ApiError('Failed to get company', res.status, json);
    }
    return json as CompanyResponse;
}

export async function getCompanyByProjectId(
    token: string,
    projectId: string
): Promise<CompanyResponse | null> {
    const url = getApiUrl(`/project/${projectId}/company`);
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (res.status === HttpStatusCode.NOT_FOUND) {
        return null;
    }

    const json = await res.json();
    if (res.status !== HttpStatusCode.OK) {
        throw new ApiError('Failed to get company', res.status, json);
    }
    return json as CompanyResponse;
}

export async function updateCompany(
    token: string,
    data: Partial<CompanyInformation>
): Promise<CompanyResponse> {
    const url = getApiUrl('/company');
    const body = {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.dateFounded && {
            date_founded: Math.floor(data.dateFounded.getTime() / 1000),
        }),
        ...(data.stage && { stages: data.stage.map((s) => s.value) }),
        ...(data.website && { website: data.website }),
        ...(data.linkedin && { linkedin_url: data.linkedin }),
        ...(data.wallet_address !== undefined && {
            wallet_address: data.wallet_address,
        }),
    };

    const res = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
    });

    const json = await res.json();
    if (res.status !== HttpStatusCode.OK) {
        throw new ApiError('Failed to update company', res.status, json);
    }
    return json as CompanyResponse;
}
