import { TeamMember } from '@/types';
import { getApiUrl, HttpStatusCode } from '@/utils';
import { snakeToCamel } from '@/utils/object';

export interface TeamMemberData {
    companyId: string;
    teamMember: TeamMember;
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
            first_name: data.teamMember.firstName,
            last_name: data.teamMember.lastName,
            title: data.teamMember.title,
            detailed_biography: data.teamMember.detailedBiography,
            linkedin_url: data.teamMember.linkedin,
            is_account_owner: data.teamMember.isAccountOwner,
            personal_website: data.teamMember.personalWebsite,
            commitment_type: data.teamMember.commitmentType,
            introduction: data.teamMember.introduction,
            industry_experience: data.teamMember.industryExperience,
            previous_work: data.teamMember.previousWork,
            resume_external_url: data.teamMember.resumeExternalUrl,
            resume_internal_url: data.teamMember.resumeInternalUrl,
            founders_agreement_external_url:
                data.teamMember.founderAgreementExternalUrl,
            founders_agreement_internal_url:
                data.teamMember.founderAgreementInternalUrl,
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
        `/companies/${data.companyId}/team/${data.teamMember.id}`
    );
    const res = await fetch(url, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });
    if (res.status === HttpStatusCode.OK) {
        throw new Error('Failed to remove team member');
    }
    return;
}
