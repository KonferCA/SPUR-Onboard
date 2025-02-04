import { getApiUrl, HttpStatusCode } from '@/utils';
import { snakeToCamel } from '@/utils/object';

export interface ProjectResponse {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: number;
    updatedAt: number;
}

export interface DocumentResponse {
    id: string;
    name: string;
    url: string;
    section: string;
    createdAt: number;
    updatedAt: number;
}

export interface ProjectDocumentsResponse {
    documents: DocumentResponse[];
}

export interface CommentResponse {
    id: string;
    projectId: string;
    targetId: string;
    comment: string;
    commenterId: string;
    resolved: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface ProjectCommentsResponse {
    comments: CommentResponse[];
}

export async function getProject(
    accessToken: string,
    projectId: string
): Promise<ProjectResponse> {
    const url = getApiUrl(`/project/${projectId}`);
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (res.status !== HttpStatusCode.OK) {
        throw new Error('Failed to fetch project');
    }

    const json = await res.json();
    return snakeToCamel(json) as ProjectResponse;
}

export async function getProjectDocuments(
    accessToken: string,
    projectId: string
): Promise<ProjectDocumentsResponse> {
    const url = getApiUrl(`/project/${projectId}/documents`);
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (res.status !== HttpStatusCode.OK) {
        throw new Error('Failed to fetch project documents');
    }

    const json = await res.json();
    return {
        documents: (json.documents || []).map((doc: any) => snakeToCamel(doc) as DocumentResponse)
    };
}

export async function getProjectComments(
    accessToken: string,
    projectId: string
): Promise<ProjectCommentsResponse> {
    const url = getApiUrl(`/project/${projectId}/comments`);
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (res.status !== HttpStatusCode.OK) {
        throw new Error('Failed to fetch project comments');
    }

    const json = await res.json();
    return {
        comments: (json.comments || []).map((comment: any) => snakeToCamel(comment) as CommentResponse)
    };
} 