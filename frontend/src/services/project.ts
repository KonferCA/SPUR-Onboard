import { getApiUrl } from '@utils';
import { ApiError } from './errors';
import type { FormData } from '@/types';
import { uploadFile } from './storage';
import { fetchWithAuth } from './auth';

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

interface ProjectFile {
  file_type: string;
  file_url: string;
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
  industry: string | null;
  company_stage: string | null;
  founded_date: string | null;
  documents: ProjectDocument[];
  sections: ProjectSection[];
}

// Transform backend response to frontend format
const transformProject = (project: ProjectResponse): Project => {
  let sections: ProjectSection[] = [];
  
  if (project.Sections) {
    sections = project.Sections.map(s => ({
      title: s.Title,
      questions: s.Questions.map(q => ({
        question: q.QuestionText,
        answer: q.AnswerText
      }))
    }));
  }

  return {
    id: project.ID,
    company_id: project.CompanyID,
    title: project.Title,
    description: project.Description,
    status: project.Status,
    created_at: project.CreatedAt,
    updated_at: project.UpdatedAt,
    industry: project.Company?.Industry || null,
    company_stage: project.Company?.CompanyStage || null,
    founded_date: project.Company?.FoundedDate || null,
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
): Promise<ProjectResponse> {
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

  const url = getApiUrl('/projects');
  
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

  console.log('Request body:', body);

  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('Server error:', errorData);
    throw new ApiError('Failed to create project', response.status, errorData || {});
  }

  return response.json();
}

export async function getProjects(): Promise<Project[]> {
  const url = getApiUrl('/projects').replace(/([^:]\/)\/+/g, "$1");
  const response = await fetchWithAuth(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError('Failed to fetch projects', response.status, errorData || {});
  }

  const data = await response.json();
  return data.map(transformProject);
}

export async function getProjectDetails(id: string): Promise<Project> {
  const url = `${getApiUrl()}/projects/${id}`.replace(/([^:]\/)\/+/g, "$1");
  const response = await fetchWithAuth(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError('Failed to fetch project details', response.status, errorData || {});
  }

  const data = await response.json();
  return transformProject(data);
}
