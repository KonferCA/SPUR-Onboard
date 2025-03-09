import type { TeamMember } from '@/types';
import { getApiUrl, HttpStatusCode } from '@/utils';
import { snakeToCamel } from '@/utils/object';
import { ApiError } from './errors';
import { processSocialLinksFromApi, processSocialLinksForApi } from '@/utils/social-links';

export interface TeamMemberData {
    companyId: string;
    member: TeamMember;
}

export interface TeamMembersResponse {
    teamMembers: TeamMember[];
}

interface TeamMemberResponse {
    id: string;
    company_id: string;
    first_name: string;
    last_name: string;
    title: string;
    social_links: Array<{
        platform: string;
        url_or_handle: string;
    }>;
    personal_website?: string | null;
    is_account_owner: boolean;
    commitment_type: string;
    introduction: string;
    industry_experience: string;
    detailed_biography: string;
    previous_work: string;
    resume_external_url: string;
    resume_internal_url: string;
    founders_agreement_external_url: string;
    founders_agreement_internal_url: string;
    created_at: string;
    updated_at: string;
}

export async function addTeamMember(accessToken: string, data: TeamMemberData) {
    const url = getApiUrl(`/companies/${data.companyId}/team`);

    // Format social links for the API using our shared utility
    const socialLinks = processSocialLinksForApi(data.member.socialLinks);

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            first_name: data.member.firstName,
            last_name: data.member.lastName,
            title: data.member.title,
            detailed_biography: data.member.detailedBiography,
            social_links: socialLinks,
            is_account_owner: data.member.isAccountOwner,
            commitment_type: data.member.commitmentType,
            introduction: data.member.introduction,
            industry_experience: data.member.industryExperience,
            previous_work: data.member.previousWork,
            resume_external_url: data.member.resumeExternalUrl,
            resume_internal_url: data.member.resumeInternalUrl,
            founders_agreement_external_url: data.member.founderAgreementExternalUrl,
            founders_agreement_internal_url: data.member.founderAgreementInternalUrl,
        }),
    });

    const json = await res.json();
    if (res.status !== HttpStatusCode.CREATED) {
        throw new ApiError(
            'Failed to add team member',
            res.status,
            json
        );
    }

    // Convert snake_case response to camelCase
    const camelCaseResponse = snakeToCamel(json);
    return camelCaseResponse;
}

export async function deleteTeamMember(
    accessToken: string,
    data: TeamMemberData
) {
    const url = getApiUrl(
        `/companies/${data.companyId}/team/${data.member.id}`
    );
    const res = await fetch(url, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });
    if (res.status !== HttpStatusCode.OK) {
        throw new Error('Failed to remove team member');
    }
    return;
}

export async function getTeamMembers(
    accessToken: string,
    companyId: string
): Promise<TeamMembersResponse> {
    const url = getApiUrl(`/companies/${companyId}/team`);
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const json = await res.json();
    if (res.status !== HttpStatusCode.OK) {
        throw new ApiError(
            'Failed to get team members',
            res.status,
            json.message
        );
    }

    // Transform the response
    const teamMembers = (json.team_members || []).map((member: TeamMemberResponse) => {
        return {
            id: member.id,
            companyId: member.company_id,
            firstName: member.first_name,
            lastName: member.last_name,
            title: member.title,
            detailedBiography: member.detailed_biography,
            isAccountOwner: member.is_account_owner,
            commitmentType: member.commitment_type || '',
            introduction: member.introduction || '',
            industryExperience: member.industry_experience || '',
            previousWork: member.previous_work || '',
            resumeExternalUrl: member.resume_external_url || '',
            resumeInternalUrl: member.resume_internal_url || '',
            founderAgreementExternalUrl: member.founders_agreement_external_url || '',
            founderAgreementInternalUrl: member.founders_agreement_internal_url || '',
            // Process social links using our shared utility
            socialLinks: processSocialLinksFromApi(member.social_links),
            createdAt: member.created_at,
            updatedAt: member.updated_at,
        };
    });

    return { teamMembers };
}

export interface UploadTeamMemberDocumentData {
    memberId: string;
    companyId: string;
    docType: 'resume' | 'founders_agreement';
    file: File;
}

export interface UploadTeamMemberDocumentResponse {
    url: string;
}

export async function uploadTeamMemberDocument(
    accessToken: string,
    data: UploadTeamMemberDocumentData
) {
    const url = getApiUrl(
        `/companies/${data.companyId}/team/${data.memberId}/${data.docType}/document`
    );

    const formData = new FormData();
    formData.append('file', data.file);

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
    });

    const json = await res.json();
    if (res.status !== HttpStatusCode.CREATED) {
        throw new ApiError(
            'Failed to upload team member document',
            res.status,
            json
        );
    }

    return snakeToCamel(json) as UploadTeamMemberDocumentResponse;
}

export async function updateTeamMember(
    accessToken: string,
    params: {
        companyId: string;
        member: Partial<TeamMember>;
    }
) {
    const { companyId, member } = params;
    const memberId = member.id;
    
    if (!memberId) {
        throw new Error('Member ID is required for update');
    }

    const url = getApiUrl(`/companies/${companyId}/team/${memberId}`);

    // Format social links using our shared utility
    const socialLinks = member.socialLinks 
        ? processSocialLinksForApi(member.socialLinks)
        : undefined;

    const body: Record<string, any> = {};
    if (member.firstName !== undefined) body.first_name = member.firstName;
    if (member.lastName !== undefined) body.last_name = member.lastName;
    if (member.title !== undefined) body.title = member.title;
    if (member.detailedBiography !== undefined) body.detailed_biography = member.detailedBiography;
    if (member.isAccountOwner !== undefined) body.is_account_owner = member.isAccountOwner;
    if (member.commitmentType !== undefined) body.commitment_type = member.commitmentType;
    if (member.introduction !== undefined) body.introduction = member.introduction;
    if (member.industryExperience !== undefined) body.industry_experience = member.industryExperience;
    if (member.previousWork !== undefined) body.previous_work = member.previousWork;
    if (member.resumeExternalUrl !== undefined) body.resume_external_url = member.resumeExternalUrl;
    if (member.resumeInternalUrl !== undefined) body.resume_internal_url = member.resumeInternalUrl;
    if (member.founderAgreementExternalUrl !== undefined) body.founders_agreement_external_url = member.founderAgreementExternalUrl;
    if (member.founderAgreementInternalUrl !== undefined) body.founders_agreement_internal_url = member.founderAgreementInternalUrl;
    if (socialLinks !== undefined) body.social_links = socialLinks;

    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const json = await res.json();
    if (res.status !== HttpStatusCode.OK) {
        throw new ApiError(
            'Failed to update team member',
            res.status,
            json.message
        );
    }

    return json;
}
