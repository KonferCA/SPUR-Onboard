import { getApiUrl } from '@utils';
import { ApiError } from './errors';
import { snakeToCamel } from '@/utils/object';

interface CompanyResponse {
    ID: string;
    Name: string;
    Industry: string | null;
    FoundedDate: string | null;
    CompanyStage: string | null;
}

// Backend response interface
interface ProjectResponse {
    ID: string;
    CompanyID: string;
    Title: string;
    Description: string | null;
    Status: string;
    CreatedAt: string;
    UpdatedAt: string;
    Company?: CompanyResponse;
    Sections?: ProjectSection[];
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
export interface ProjectDocument {
    id: string;
    name: string;
    type: string;
    url: string;
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

/**
 * Base fetch function for project-related API calls
 */
async function fetchProject(url: string, options: RequestInit = {}): Promise<Response> {
    const defaultOptions: RequestInit = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
            'Project operation failed',
            response.status,
            errorData
        );
    }

    return response;
}

/*
 * Get project questions for the project submission form
 */
export async function getProjectFormQuestions(): Promise<ProjectQuestion[]> {
    const url = getApiUrl('/project/questions');

    const response = await fetchProject(url);
    const data = await response.json();
    return snakeToCamel(data.questions);
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

export async function createProject(
    companyId: string,
    payload: {
        company_id: string;
        title: string;
        description: string;
        status: string;
        files: any[];
        links: { link_type: string; url: string }[];
        sections: {
            title: string;
            questions: { question: string; answer: string }[];
        }[];
    }
): Promise<ProjectResponse> {
    const url = getApiUrl('/projects');

    const response = await fetchProject(url, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    return response.json();
}

export async function getProjects(): Promise<Project[]> {
    const url = getApiUrl('/projects').replace(/([^:]\/)\/+/g, '$1');
    const response = await fetchProject(url);
    const data = await response.json();
    return data.map(transformProject);
}

export async function getProjectDetails(id: string): Promise<Project> {
    const url = `${getApiUrl()}/projects/${id}`.replace(/([^:]\/)\/+/g, '$1');
    const response = await fetchProject(url);
    const data = await response.json();
    return transformProject(data);
}
