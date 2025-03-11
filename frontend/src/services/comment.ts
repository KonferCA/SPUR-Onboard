import { getApiUrl, HttpStatusCode } from '@/utils';
import { ApiError } from './errors';
import { snakeToCamel } from '@/utils/object';

export interface Comment {
    id: string;
    projectId: string;
    targetId: string;
    comment: string;
    commenterId: string;
    resolved: boolean;
    createdAt: number;
    updatedAt: number;
    commenterFirstName: string | null;
    commenterLastName: string | null;
}

export interface CreateCommentData {
    comment: string;
    targetId: string;
}

export async function createProjectComment(
    accessToken: string,
    projectId: string,
    data: CreateCommentData
): Promise<Comment> {
    const url = getApiUrl(`/project/${projectId}/comments`);

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            comment: data.comment,
            target_id: data.targetId,
        }),
    });

    const body = await res.json();
    if (res.status !== HttpStatusCode.CREATED) {
        throw new ApiError(
            'Failed to create project question',
            res.status,
            body
        );
    }

    return snakeToCamel(body) as Comment;
}

export async function getProjectComments(
    accessToken: string,
    projectId: string
): Promise<Comment[]> {
    const url = getApiUrl(`/project/${projectId}/comments`);

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const body = await res.json();
    if (res.status !== HttpStatusCode.OK) {
        throw new ApiError('Failed to get project questions', res.status, body);
    }

    return snakeToCamel(body.comments) as Comment[];
}
