import type { TeamMember } from '@/types';

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

// interface CompanyResponse {
//     ID: string;
//     Name: string;
//     Industry: string | null;
//     FoundedDate: string | null;
//     CompanyStage: string | null;
// }

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
