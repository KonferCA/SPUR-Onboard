import { getApiUrl } from '@utils';
import { ApiError } from './errors';
import type { FormData } from '@/types';
import { uploadFile } from './storage';

interface CompanyResponse {
  ID: string;
  Name: string;
  Industry: string;
  FoundedDate: string;
  CompanyStage: string;
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
  Sections?: {
    ID: string;
    Title: string;
    Questions: {
      QuestionText: string;
      AnswerText: string;
    }[];
  }[];
}

// Frontend interfaces
export interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  url: string;
}

export interface ProjectSection {
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
  industry: string;
  company_stage: string;
  founded_date: string;
  documents: ProjectDocument[];
  sections: ProjectSection[];
}

// Transform backend response to frontend format
const transformProject = (project: ProjectResponse): Project => {
  // decode sections from base64
  let sections: ProjectSection[] = [];
  try {
    if (project.Sections) {
      const decodedSections = atob(project.Sections);
      const parsedSections = JSON.parse(decodedSections);
      sections = parsedSections.map(s => ({
        title: s.title || '',
        questions: s.questions || []
      }));
    }
  } catch (err) {
    console.error('failed to parse sections:', err);
  }

  return {
    id: project.ID,
    company_id: project.CompanyID,
    title: project.Title,
    description: project.Description,
    status: project.Status,
    created_at: project.CreatedAt,
    updated_at: project.UpdatedAt,
    industry: project.Company?.Industry,
    company_stage: project.Company?.CompanyStage,
    founded_date: project.Company?.FoundedDate,
    documents: [], // todo: implement when backend supports
    sections: sections
  };
};

interface ProjectLink {
  LinkType: string;
  URL: string;
}

export async function createProject(
  companyId: string,
  formData: FormData,
  files: File[] = [],
  links: ProjectLink[] = []
): Promise<CreateProjectResponse> {
  // First upload all files
  const uploadedFiles: ProjectFile[] = await Promise.all(
    files.map(async (file) => {
      const fileUrl = await uploadFile(file);
      return {
        file_type: file.type,
        file_url: fileUrl
      };
    })
  );

  // Create project with files and links
  const url = getApiUrl('/projects');
  
  // Ensure links are properly structured
  const sanitizedLinks = links.map(link => ({
    LinkType: link.LinkType,
    URL: link.URL
  }));

  const body = {
    company_id: companyId,
    title: formData.companyName,
    description: formData.description,
    status: 'in_review',
    files: uploadedFiles,
    links: sanitizedLinks.map(link => ({
      link_type: link.LinkType.toLowerCase(),
      url: link.URL
    }))
  };

  console.log('Request body:', body); // Debug log

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('Server error:', errorData); // Debug log
    throw new ApiError('Failed to create project', response.status, errorData);
  }

  return response.json();
}

export async function getProjects(): Promise<Project[]> {
  const url = `${getApiUrl()}/projects`.replace(/([^:]\/)\/+/g, "$1");
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new ApiError('Failed to fetch projects', response.status);
  }

  const data = await response.json();
  return data.map(transformProject);
} 

// Add new function to get project details
export async function getProjectDetails(id: string): Promise<Project> {
  const url = `${getApiUrl()}/projects/${id}`.replace(/([^:]\/)\/+/g, "$1");
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new ApiError('Failed to fetch project details', response.status);
  }

  const data = await response.json();
  return transformProject(data);
}
