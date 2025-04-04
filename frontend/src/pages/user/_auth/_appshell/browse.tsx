import { createFileRoute } from '@tanstack/react-router';
import { ProjectsTable } from '@/components/tables/ProjectsTable';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { listProjectsAll } from '@/services/project';
import type { ExtendedProjectResponse, Project } from '@/types/project';
import type { CompanyResponse } from '@/services/company';

export const Route = createFileRoute('/user/_auth/_appshell/browse')({
    component: BrowseProjects,
});

const transformToProject = (
    project: ExtendedProjectResponse,
    company: CompanyResponse | null
): Project => ({
    id: project.id,
    title: project.title,
    description: project.description || null,
    status: project.status,
    created_at: new Date(project.createdAt * 1000).toISOString(),
    updated_at: new Date(project.updatedAt * 1000).toISOString(),
    industry: null,
    company_stage: company?.stages?.join(', ') || null,
    founded_date: company?.date_founded
        ? company.date_founded.toString()
        : null,
    documents: [],
    sections: [],
});

function BrowseProjects() {
    const { accessToken } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCompanyAndProjects() {
            if (!accessToken) return;
            try {
                const projectList = await listProjectsAll(accessToken);
                const transformedProjects = projectList.map((project) =>
                    transformToProject(project, null)
                );
                setProjects(transformedProjects);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'Failed to fetch data'
                );
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
            <div className="flex flex-col justify-between min-h-screen">
                <div className="p-6 pt-20 max-w-7xl mx-auto w-full">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-lg text-gray-600">
                            Loading projects...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-between min-h-screen bg-gray-50">
            <div className="pt-20 max-w-7xl mx-auto w-full">
                <div className="px-6">
                    <h1 className="text-4xl font-bold mb-6">
                        Browse <span className="text-[#F4802F]">Projects</span>
                    </h1>
                </div>

                <div className="mt-6 bg-white rounded-lg overflow-hidden">
                    <ProjectsTable data={projects} />
                </div>

                {error && (
                    <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-md mx-6">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
