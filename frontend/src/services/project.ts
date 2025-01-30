import { getApiUrl } from '@utils';
import { ApiError } from './errors';
import { fetchWithAuth } from './auth';
import { snakeToCamel } from '@/utils/object';
import { TeamMember } from '@/types';

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

export interface ProjectQuestion {
    id: string;
    question: string;
    inputType: string;
    inputTypeId: string;
    options: string[] | null;
    section: string;
    subSection: string;
    sectionOrder: number;
    subSectionOrder: number;
    questionOrder: number;
    required: boolean;
    validations?: string;
    answer: string;
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
    company_id: string;
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
    projectId?: string
): Promise<ProjectQuestionsData> {
    let url = getApiUrl('/project/questions');

    if (typeof projectId === 'string') {
        url += `?project_id=${projectId}`;
    }

    const response = await fetchWithAuth(url, { method: 'GET' });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
            'Failed to fetch project questions',
            response.status,
            errorData || {}
        );
    }
    const data = await response.json();
    return snakeToCamel(data);
}

// Transform backend response to frontend format
const transformProject = (data: any): Project => {
    return {
        id: data.ID,
        company_id: data.CompanyID,
        title: data.Title,
        description: data.Description,
        status: data.Status,
        created_at: data.CreatedAt,
        updated_at: data.UpdatedAt,
        industry: data.Company?.Industry || null,
        company_stage: data.Company?.CompanyStage || null,
        founded_date: data.Company?.FoundedDate || null,
        documents: [], // todo: implement when backend supports
        sections: data.Sections || [],
    };
};

export async function createProject(): Promise<ProjectResponse> {
    const url = getApiUrl('/project/new');

    const response = await fetchWithAuth(url, { method: 'POST' });

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

    return snakeToCamel(json);
}

export async function getProjects(): Promise<Project[]> {
    const url = getApiUrl('/projects').replace(/([^:]\/)\/+/g, '$1');
    const response = await fetchWithAuth(url);

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
            'Failed to fetch projects',
            response.status,
            errorData || {}
        );
    }

    const data = await response.json();
    return data.map(transformProject);
}

export async function getProjectDetails(id: string): Promise<Project> {
    const url = `${getApiUrl()}/projects/${id}`.replace(/([^:]\/)\/+/g, '$1');
    const response = await fetchWithAuth(url);

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
