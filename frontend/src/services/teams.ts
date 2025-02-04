import { TeamMember } from '@/types';
import { getApiUrl, HttpStatusCode } from '@/utils';
import { snakeToCamel } from '@/utils/object';
import { ApiError } from './errors';

export interface TeamMemberData {
    companyId: string;
    member: TeamMember;
}

export interface TeamMembersResponse {
    teamMembers: TeamMember[];
}

interface TeamMemberResponse {
    id: string;
    first_name: string;
    last_name: string;
    title: string;
    bio: string;
    linkedin_url: string;
    is_account_owner: boolean;
    created_at: string;
}

export async function addTeamMember(accessToken: string, data: TeamMemberData) {
    const url = getApiUrl(`/companies/${data.companyId}/team`);
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
            linkedin_url: data.member.linkedin,
            is_account_owner: data.member.isAccountOwner,
            personal_website: data.member.personalWebsite,
            commitment_type: data.member.commitmentType,
            introduction: data.member.introduction,
            industry_experience: data.member.industryExperience,
            previous_work: data.member.previousWork,
            resume_external_url: data.member.resumeExternalUrl,
            resume_internal_url: data.member.resumeInternalUrl,
            founders_agreement_external_url:
                data.member.founderAgreementExternalUrl,
            founders_agreement_internal_url:
                data.member.founderAgreementInternalUrl,
        }),
    });

    if (res.status !== HttpStatusCode.CREATED) {
        throw new Error('Failed to add team member');
    }

    const json = await res.json();
    return snakeToCamel(json) as TeamMember;
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
): Promise<TeamMember[]> {
    const url = getApiUrl(`/companies/${companyId}/team`);
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (res.status !== HttpStatusCode.OK) {
        throw new Error('Failed to fetch team members');
    }

    const json = await res.json();
    const teamMembers = json.team_members || [] as TeamMemberResponse[];
    return teamMembers.map((member: TeamMemberResponse) => snakeToCamel(member) as TeamMember);
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
