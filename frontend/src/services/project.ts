import { getApiUrl, HttpStatusCode } from '@utils';
import { ApiError } from './errors';
import { snakeToCamel } from '@/utils/object';
import type { TeamMember } from '@/types';
import type { ProjectSnapshotResponse } from '@/types/projects';

// interface CompanyResponse {
//     ID: string;
//     Name: string;
//     Industry: string | null;
//     FoundedDate: string | null;
//     CompanyStage: string | null;
// }

// Backend response interface
export interface ProjectResponse {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: number;
    updatedAt: number;
}

export interface ExtendedProjectResponse extends ProjectResponse {
    companyName: string;
    documentCount: number;
    teamMemberCount: number;
}

export interface ConditionType {
    conditionTypeEnum: string;
    valid: boolean;
}

export interface ProjectQuestion {
    id: string;
    question: string;
    section: string;
    subSection: string;
    sectionOrder: number;
    subSectionOrder: number;
    questionOrder: number;
    inputType: string;
    options: string[] | null;
    required: boolean;
    validations: string[] | null;
    conditionType: ConditionType;
    conditionValue: string | null;
    dependentQuestionId: string | null;
    questionGroupId: string | null;
    placeholder: string | null;
    description: string | null;
    disabled: boolean;
    answer: string;
    choices: string[];
    // inputProps is a base64 encoded json
    inputProps?: string | null;
}

// Frontend interfaces
export interface ProjectQuestionsData {
    questions: ProjectQuestion[];
    documents?: ProjectDocument[];
    teamMembers?: TeamMember[];
}

export interface ProjectDocument {
    id: string;
    projectId: string;
    questionId: string;
    section: string;
    subSection: string;
    name: string;
    url: string;
    mimeType: string;
    size: number;
    createdAt: number;
    updatedAt: number;
}

export interface ProjectSection {
    id: string;
    title: string;
    questions: {
        question: string;
        answer: string;
    }[];
}

export interface Project {
    id: string;
    title: string;
    description: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    industry: string | null;
    company_stage: string | null;
    founded_date: string | null;
    documents: ProjectDocument[];
    sections: ProjectSection[];
}

/*
 * Get project questions for the project submission form
 */
export async function getProjectFormQuestions(
    accessToken: string,
    projectId?: string
): Promise<ProjectQuestionsData> {
    let url = getApiUrl('/project/questions');

    if (typeof projectId === 'string') {
        url += `?project_id=${projectId}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
            'Failed to fetch project questions',
            response.status,
            errorData || {}
        );
    }
    const data = await response.json();
    return snakeToCamel(data) as ProjectQuestionsData;
}

// Transform backend response to frontend format
// biome-ignore lint/suspicious/noExplicitAny:
const transformProject = (data: any): Project => {
    return {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
        industry: null,
        company_stage: null,
        founded_date: null,
        documents: [], // todo: implement when backend supports
        sections: data.Sections || [],
    };
};

export async function createProject(
    accessToken: string
): Promise<ProjectResponse> {
    const url = getApiUrl('/project/new');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server error:', errorData);
        throw new ApiError(
            'Failed to create project',
            response.status,
            errorData || {}
        );
    }

    const json = await response.json();

    return snakeToCamel(json) as ProjectResponse;
}

/*
 * List company's projects' metadata
 */
export async function listProjects(accessToken: string) {
    const url = getApiUrl('/project/list');
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const body = await res.json();
    if (res.status !== HttpStatusCode.OK) {
        throw new ApiError('Failed to list projects', res.status, body);
    }

    return snakeToCamel(body.projects) as ExtendedProjectResponse[];
}

export async function listProjectsAll(accessToken: string) {
    const url = getApiUrl('/project/list/all');
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const body = await res.json();
    if (res.status !== HttpStatusCode.OK) {
        throw new ApiError('Failed to list projects', res.status, body);
    }

    return snakeToCamel(body.projects) as ExtendedProjectResponse[];
}

export async function getProjectDetails(
    accessToken: string,
    id: string
): Promise<Project> {
    const url = `${getApiUrl()}/projects/${id}`.replace(/([^:]\/)\/+/g, '$1');

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
            'Failed to fetch project details',
            response.status,
            errorData || {}
        );
    }

    const data = await response.json();
    return transformProject(data);
}

export interface ProjectDraft {
    question_id: string;
    answer: string | string[];
}

export async function saveProjectDraft(
    accessToken: string,
    projectId: string,
    draft: ProjectDraft[]
) {
    const url = getApiUrl(`project/${projectId}/draft`);
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ draft }),
    });
    if (response.status !== 200) {
        return false;
    }
    return true;
}

export interface uploadDocumentData {
    projectId: string;
    file: File;
    questionId: string;
    name: string;
    section: string;
    subSection: string;
}

export async function uploadDocument(
    accessToken: string,
    data: uploadDocumentData
) {
    const formData = new FormData();

    formData.append('file', data.file);
    formData.append('question_id', data.questionId);
    formData.append('name', data.name);
    formData.append('section', data.section);
    formData.append('sub_section', data.subSection);

    const url = getApiUrl(`/project/${data.projectId}/documents`);
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
    });

    if (res.status !== HttpStatusCode.CREATED) {
        throw new Error('Failed to upload document');
    }

    return await res.json();
}

export interface RemoveDocumentData {
    projectId: string;
    documentId: string;
}

export async function removeDocument(
    accessToken: string,
    data: RemoveDocumentData
) {
    const url = getApiUrl(
        `/project/${data.projectId}/documents/${data.documentId}`
    );
    const res = await fetch(url, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (res.status !== HttpStatusCode.OK) {
        throw new Error('Failed to remove document');
    }

    return res.json();
}

export async function submitProject(accessToken: string, projectId: string) {
    const url = getApiUrl(`/project/${projectId}/submit`);
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const json = await res.json();
    if (res.status !== HttpStatusCode.OK) {
        throw new Error(`Failed to submit project: ${json.message}`);
    }
}

/*
 * getLatestProjectSnapshot tries to get the latest project snapshot.
 * This function throws an ApiError for any status code that is not 200.
 */
export async function getLatestProjectSnapshot(
    accessToken: string,
    projectId: string
): Promise<ProjectSnapshotResponse> {
    const url = getApiUrl(`/project/${projectId}/snapshots/latest`);
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const json = await res.json();
    if (res.status !== HttpStatusCode.OK) {
        throw new ApiError('Failed to get project snapshot', res.status, json);
    }
    return json as ProjectSnapshotResponse;
}
