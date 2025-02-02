import { TeamMember } from '@/types';
import { getApiUrl, HttpStatusCode } from '@/utils';
import { snakeToCamel } from '@/utils/object';

export interface TeamMemberData {
    companyId: string;
    member: TeamMember;
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
