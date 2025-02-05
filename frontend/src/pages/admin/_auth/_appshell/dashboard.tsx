import { createFileRoute } from '@tanstack/react-router';
import { ProjectsTable } from '@/components/tables/ProjectsTable';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { listProjects } from '@/services/project';
import { getCompany } from '@/services/company';
import type { ExtendedProjectResponse, Project } from '@/services/project';
import type { CompanyResponse } from '@/services/company';

const transformToProject = (project: ExtendedProjectResponse, company: CompanyResponse | null): Project => ({
    id: project.id,
    company_id: '',
    title: project.title,
    description: project.description || null,
    status: project.status,
    created_at: new Date(project.createdAt * 1000).toISOString(),
    updated_at: new Date(project.updatedAt * 1000).toISOString(),
    industry: null,
    company_stage: company?.stages?.join(', ') || null,
    founded_date: company?.date_founded ? company.date_founded.toString() : null,
    documents: [],
    sections: []
});

export const Route = createFileRoute('/admin/_auth/_appshell/dashboard')({
    component: RouteComponent,
});

function RouteComponent() {
    const { accessToken } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [_, setCompany] = useState<CompanyResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCompanyAndProjects() {
            if (!accessToken) return;

            try {
                const companyData = await getCompany(accessToken);
                setCompany(companyData);

                const projectList = await listProjects(accessToken);
                const transformedProjects = projectList.map(project => 
                    transformToProject(project, companyData)
                );
                setProjects(transformedProjects);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        }

        fetchCompanyAndProjects();
    }, [accessToken]);

    if (!accessToken) {
        return null;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-gray-600">Loading projects...</div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <ProjectsTable 
                data={projects} 
            />

            {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}
        </div>
    );
}
