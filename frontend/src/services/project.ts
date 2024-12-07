import { getApiUrl, HttpStatusCode } from '@utils';
import { ApiError } from './errors';
import type { FormData } from '@/types';
import { uploadFile } from './storage';

interface CreateProjectResponse {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ProjectFile {
  file_type: string;
  file_url: string;
}

// interface ProjectLink {
//   link_type: string;
//   url: string;
// }

export async function createProject(
  companyId: string,
  formData: FormData,
  files: File[] = [],
  links: { type: string; url: string }[] = []
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
  const body = {
    company_id: companyId,
    title: formData.companyName,
    description: formData.description,
    status: 'pending',
    founded_date: formData.foundedDate,
    company_stage: formData.companyStage,
    investment_stage: formData.investmentStage,
    inspiration: formData.inspiration,
    vision: formData.vision,
    team_members: formData['team-members'],
    files: uploadedFiles,
    links: links.map(link => ({
      link_type: link.type,
      url: link.url
    }))
  };

  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const json = await res.json();

  if (res.status !== HttpStatusCode.CREATED) {
    throw new ApiError('Failed to create project', res.status, json);
  }

  return json as CreateProjectResponse;
} 
