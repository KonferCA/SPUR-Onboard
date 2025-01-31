import type { UploadableFile } from '@/components';
import { ZodString } from 'zod';

export type FormFieldType =
    | 'textinput'
    | 'date'
    | 'select'
    | 'multiselect'
    | 'textarea'
    | 'file'
    | 'team';

export interface FormFieldValue {
    files?: UploadableFile[];
    teamMembers?: TeamMember[];
    value?: any;
}

export interface FormField {
    key: string;
    type: FormFieldType;
    label: string;
    required?: boolean;
    placeholder?: string;
    description?: string;
    rows?: number;
    options?: Array<{
        id: number;
        label: string;
        value: string;
    }>;
    validations?: ZodString[];
    value: FormFieldValue;
}

export interface FormSection {
    id: string;
    title: string;
    description?: string;
    fields: FormField[];
}

export interface TeamMember {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    bio: string;
    linkedin: string;
    isAccountOwner: boolean;
}

export interface SocialLink {
    id: string;
    url: string;
    type?: string;
}

export type FormData = {
    [key: string]: any;
};
