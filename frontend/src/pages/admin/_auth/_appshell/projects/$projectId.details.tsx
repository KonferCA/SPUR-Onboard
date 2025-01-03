import { createFileRoute } from '@tanstack/react-router';

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { getProjects } from '@/services/project';
import type { Project } from '@/services/project';
import { format } from 'date-fns';

const ProjectDetailsPage: React.FC = () => {
    const params = useParams({
        from: '/admin/_auth/_appshell/projects/$projectId/details',
    });
    const id = params.projectId;
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const projects = await getProjects();
                const foundProject = projects.find((p) => p.id === id);
                if (foundProject) {
                    setProject(foundProject);
                } else {
                    setError('Project not found');
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to fetch project'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    if (loading) {
        return (
            <>
                <div>Loading...</div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <div className="text-red-600">Error: {error}</div>
            </>
        );
    }

    if (!project) {
        return (
            <>
                <div className="text-red-600">Project not found</div>
            </>
        );
    }

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMMM d, yyyy');
        } catch {
            return dateString;
        }
    };

    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Project overview
                        </h1>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                            onClick={() => window.open('/documents', '_blank')}
                        >
                            View uploaded documents
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                            onClick={() =>
                                navigate({
                                    to: `/admin/projects/${id}/submission`,
                                })
                            }
                        >
                            View full submission
                        </button>
                    </div>
                </div>

                {/* Project Info Grid */}
                <div className="mt-8 grid grid-cols-4 gap-4 border-b border-gray-200 pb-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">
                            Project name
                        </h3>
                        <p className="mt-1 text-sm text-gray-900">
                            {project.title}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">
                            Status
                        </h3>
                        <span
                            className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
              ${
                  project.status === 'in_review'
                      ? 'bg-yellow-100 text-yellow-800'
                      : project.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : project.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
              }`}
                        >
                            {project.status.replace('_', ' ')}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">
                            Date submitted
                        </h3>
                        <p className="mt-1 text-sm text-gray-900">
                            {formatDate(project.created_at)}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">
                            Documents uploaded
                        </h3>
                        <p className="mt-1 text-sm text-gray-900">
                            12 documents
                        </p>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="mt-8">
                    <h2 className="text-lg font-medium text-gray-900">
                        Summary of project & company
                    </h2>
                    <div className="mt-4 space-y-6">
                        <p className="text-sm text-gray-500">
                            {project.description}
                        </p>
                        <div className="text-xs text-gray-400 flex items-center gap-2">
                            <span>This description was generated by AI</span>
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="mt-8">
                    <h2 className="text-lg font-medium text-gray-900">
                        Activity
                    </h2>
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-gray-200" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Project Submitted
                                </p>
                                <p className="text-sm text-gray-500">
                                    {formatDate(project.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export const Route = createFileRoute(
    '/admin/_auth/_appshell/projects/$projectId/details'
)({
    component: ProjectDetailsPage,
});
