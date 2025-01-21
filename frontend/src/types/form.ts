export type FormFieldType =
    | 'textinput'
    | 'date'
    | 'select'
    | 'textarea'
    | 'file'
    | 'team';
export interface FormField {
    id: string;
    type: FormFieldType;
    label: string;
    required?: boolean;
    placeholder?: string;
    rows?: number;
    options?: Array<{
        id: number;
        label: string;
        value: string;
    }>;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar?: string;
}

export interface SocialLink {
    id: string;
    url: string;
    type?: string;
}

export type FormData = {
    [key: string]: any;
};
