import { getApiUrl, HttpStatusCode } from '@utils';
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
  Company?: CompanyResponse;  // Added company data
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
const transformProject = (project: ProjectResponse): Project => ({
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
});

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

// Mock data
export const MOCK_PROJECTS: Project[] = [
  {
    id: "5c2dd910-89bb-4db5-9a02-9b460c9d7785",
    company_id: "602f47a5-247d-4d09-85b8-a6a4fcd4ec0b",
    title: "Adaptive Learning Algorithm",
    description: "Machine learning system for personalized education paths",
    status: "in_review",
    created_at: "2024-11-24T20:29:52.365121Z",
    updated_at: "2024-12-08T20:29:52.365121Z",
    industry: "education",
    company_stage: "seed",
    founded_date: "2022-01-01",
    documents: [
      { id: "1", name: "Projections.pdf", type: "application/pdf", url: "/docs/projections.pdf" },
      { id: "2", name: "Business_Plan.docx", type: "application/docx", url: "/docs/business_plan.docx" },
      { id: "3", name: "Elevator Pitch.docx", type: "application/docx", url: "/docs/elevator_pitch.docx" },
      { id: "4", name: "Certificate of Incorporation.pdf", type: "application/pdf", url: "/docs/certificate.pdf" },
    ],
    sections: [
      {
        title: "Bookkeeping",
        questions: [
          {
            question: "What is the name of your company?",
            answer: "Axel"
          },
          {
            question: "When was your company founded?",
            answer: "2024"
          },
          {
            question: "What stage is your company at?",
            answer: "Investment"
          },
          {
            question: "What investment stage is your company at?",
            answer: "Pre-Seed"
          }
        ]
      },
      {
        title: "Company Overview",
        questions: [
          {
            question: "Brief description of your company",
            answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut mollis tempor lorem, sit amet suscipit odio egestas id. Curabitur viverra massa eget."
          },
          {
            question: "What inspired you to start this company, and what is the core problem you're solving?",
            answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut mollis tempor lorem, sit amet suscipit odio egestas id. Curabitur viverra massa eget."
          },
          {
            question: "What is your long-term vision for the company, and how do you plan to disrupt or lead your market?",
            answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut mollis tempor lorem, sit amet suscipit odio egestas id. Curabitur viverra massa eget."
          }
        ]
      },
      {
        title: "Product Overview",
        questions: [
          {
            question: "How does your product or idea differentiate from competitors, and what makes it defensible or unique?",
            answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut mollis tempor lorem, sit amet suscipit odio egestas id. Curabitur viverra massa eget."
          },
          {
            question: "What does your current product roadmap look like?",
            answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut mollis tempor lorem, sit amet suscipit odio egestas id. Curabitur viverra massa eget."
          }
        ]
      },
      {
        title: "Customer & Demographic",
        questions: [
          {
            question: "Who are your target demographic and customers? What makes your product or service compelling to them?",
            answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut mollis tempor lorem, sit amet suscipit odio egestas id. Curabitur viverra massa eget."
          },
          {
            question: "What is the total addressable market for this company? How do you plan to capture your share of it?",
            answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut mollis tempor lorem, sit amet suscipit odio egestas id. Curabitur viverra massa eget."
          }
        ]
      }
    ]
  },
  {
    id: "b38119f7-39b3-4c19-8296-f1700b52401a",
    company_id: "7adb441c-49e9-4b3d-b6de-6e4759d5b2c2",
    title: "Solar Panel Efficiency Optimizer",
    description: "AI-driven system to maximize solar panel energy collection",
    status: "in_progress",
    created_at: "2024-11-09T20:29:52.365121Z",
    updated_at: "2024-12-04T20:29:52.365121Z",
    industry: "tech",
    company_stage: "series-a",
    founded_date: "2020-06-15",
    documents: [],
    sections: []
  },
  {
    id: "8bc1e0e5-0e86-4a6e-a44d-b70889124680",
    company_id: "baceb259-8a8c-4416-8c4a-e90c2fee20f5",
    title: "Autonomous Parking System",
    description: "AI-powered system for automated parallel and perpendicular parking",
    status: "in_progress",
    created_at: "2024-10-25T20:29:52.365121Z",
    updated_at: "2024-12-07T20:29:52.365121Z",
    industry: "tech",
    company_stage: "series-b",
    founded_date: "2019-03-20",
    documents: [],
    sections: []
  },
  {
    id: "1a2663ff-c752-410a-a92b-92456817b364",
    company_id: "baceb259-8a8c-4416-8c4a-e90c2fee20f5",
    title: "Traffic Pattern Analysis",
    description: "Real-time traffic analysis using computer vision",
    status: "completed",
    created_at: "2024-09-10T20:29:52.365121Z",
    updated_at: "2024-11-09T20:29:52.365121Z",
    industry: "tech",
    company_stage: "series-c-plus",
    founded_date: "2018-11-30",
    documents: [],
    sections: []
  },
  {
    id: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
    company_id: "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
    title: "HealthTech Analytics Platform",
    description: "AI-powered health data analytics and prediction platform",
    status: "in_review",
    created_at: "2024-12-01T10:00:00.000Z",
    updated_at: "2024-12-08T15:30:00.000Z",
    industry: "healthcare",
    company_stage: "pre-seed",
    founded_date: "2023-09-01",
    documents: [],
    sections: []
  },
  {
    id: "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
    company_id: "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
    title: "FinTech Payment Solution",
    description: "Next-generation payment processing and fraud detection",
    status: "in_progress",
    created_at: "2024-11-15T14:20:00.000Z",
    updated_at: "2024-12-07T09:45:00.000Z",
    industry: "finance",
    company_stage: "seed",
    founded_date: "2022-05-15",
    documents: [],
    sections: []
  }
];

export async function getProjects(): Promise<Project[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_PROJECTS;
} 
