import { getApiUrl, HttpStatusCode } from '@utils';
import { ApiError } from './errors';

interface CreateCompanyResponse {
  id: string;
  owner_user_id: string;
  name: string;
  description: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
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
    description
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