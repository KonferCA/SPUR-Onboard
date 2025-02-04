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
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (res.status === HttpStatusCode.NOT_FOUND) {
            // Return a mock response for testing
            return {
                id: projectId,
                title: 'Test Project',
                description: 'This is a test project description',
                status: 'draft',
                createdAt: Date.now() / 1000,
                updatedAt: Date.now() / 1000
            };
        }

        if (res.status !== HttpStatusCode.OK) {
            throw new Error('Failed to fetch project');
        }

        const json = await res.json();
        return snakeToCamel(json) as ProjectResponse;
    } catch (error) {
        console.error('Error fetching project:', error);
        // Return mock data for testing
        return {
            id: projectId,
            title: 'Test Project',
            description: 'This is a test project description',
            status: 'draft',
            createdAt: Date.now() / 1000,
            updatedAt: Date.now() / 1000
        };
    }
}

export async function getProjectDocuments(
    accessToken: string,
    projectId: string
): Promise<ProjectDocumentsResponse> {
    const url = getApiUrl(`/project/${projectId}/documents`);
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (res.status === HttpStatusCode.NOT_FOUND) {
            // Return mock data for testing
            return {
                documents: [
                    {
                        id: '1',
                        name: 'Business Plan.pdf',
                        url: '#',
                        section: 'Business',
                        createdAt: Date.now() / 1000,
                        updatedAt: Date.now() / 1000
                    },
                    {
                        id: '2',
                        name: 'Financial Projections.xlsx',
                        url: '#',
                        section: 'Finance',
                        createdAt: Date.now() / 1000,
                        updatedAt: Date.now() / 1000
                    }
                ]
            };
        }

        if (res.status !== HttpStatusCode.OK) {
            throw new Error('Failed to fetch project documents');
        }

        const json = await res.json();
        return {
            documents: (json.documents || []).map((doc: any) => snakeToCamel(doc) as DocumentResponse)
        };
    } catch (error) {
        console.error('Error fetching project documents:', error);
        // Return mock data for testing
        return {
            documents: [
                {
                    id: '1',
                    name: 'Business Plan.pdf',
                    url: '#',
                    section: 'Business',
                    createdAt: Date.now() / 1000,
                    updatedAt: Date.now() / 1000
                },
                {
                    id: '2',
                    name: 'Financial Projections.xlsx',
                    url: '#',
                    section: 'Finance',
                    createdAt: Date.now() / 1000,
                    updatedAt: Date.now() / 1000
                }
            ]
        };
    }
}

export async function getProjectComments(
    accessToken: string,
    projectId: string
): Promise<ProjectCommentsResponse> {
    const url = getApiUrl(`/project/${projectId}/comments`);
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (res.status === HttpStatusCode.NOT_FOUND) {
            // Return mock data for testing
            return {
                comments: [
                    {
                        id: '1',
                        projectId: projectId,
                        targetId: '123',
                        comment: 'Please provide more details about your revenue model',
                        commenterId: 'admin1',
                        resolved: false,
                        createdAt: Date.now() / 1000,
                        updatedAt: Date.now() / 1000
                    },
                    {
                        id: '2',
                        projectId: projectId,
                        targetId: '124',
                        comment: 'The market analysis section needs expansion',
                        commenterId: 'admin2',
                        resolved: true,
                        createdAt: Date.now() / 1000 - 86400,
                        updatedAt: Date.now() / 1000
                    }
                ]
            };
        }

        if (res.status !== HttpStatusCode.OK) {
            throw new Error('Failed to fetch project comments');
        }

        const json = await res.json();
        return {
            comments: (json.comments || []).map((comment: any) => snakeToCamel(comment) as CommentResponse)
        };
    } catch (error) {
        console.error('Error fetching project comments:', error);
        // Return mock data for testing
        return {
            comments: [
                {
                    id: '1',
                    projectId: projectId,
                    targetId: '123',
                    comment: 'Please provide more details about your revenue model',
                    commenterId: 'admin1',
                    resolved: false,
                    createdAt: Date.now() / 1000,
                    updatedAt: Date.now() / 1000
                },
                {
                    id: '2',
                    projectId: projectId,
                    targetId: '124',
                    comment: 'The market analysis section needs expansion',
                    commenterId: 'admin2',
                    resolved: true,
                    createdAt: Date.now() / 1000 - 86400,
                    updatedAt: Date.now() / 1000
                }
            ]
        };
    }
} 