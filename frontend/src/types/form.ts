export interface FormField {
  id: string;
  type: 'text' | 'date' | 'dropdown' | 'textarea' | 'file' | 'team-members' | 'social-links';
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

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormStep {
  id: 'A' | 'B';
  title: string;
  subtitle: string;
  sections: FormSection[];
}

export type FormData = {
  [key: string]: any;
}; 