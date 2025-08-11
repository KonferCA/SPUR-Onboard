import { useState } from 'react';
import { createFileRoute, useParams, Link } from '@tanstack/react-router';
import { usePageTitle } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { getLatestProjects } from '@/services/project';
import { transformProjectData } from '@/components/browse/BrowseComponents';
import { ProjectDetailContent } from '@/components/project/ProjectDetailComponents';
import { cva } from 'class-variance-authority';

export const Route = createFileRoute(
    '/user/_auth/_appshell/project-detail/$projectId'
)({
    component: AuthProjectDetail,
});

const navButtonStyles = cva(
    'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
    {
        variants: {
            active: {
                true: 'bg-button-primary-100 text-white shadow-sm',
                false: 'text-gray-500 hover:text-gray-700',
            },
        },
        defaultVariants: {
            active: false,
        },
    }
);

function AuthProjectDetail() {
    const { projectId } = useParams({
        from: '/user/_auth/_appshell/project-detail/$projectId',
    });
    const [activeTab, setActiveTab] = useState<'overview' | 'details'>(
        'overview'
    );
    const [isLiked, setIsLiked] = useState(false);

    const {
        data: projectsData = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['auth_project_detail', projectId],
        queryFn: async () => {
            try {
                return await getLatestProjects();
            } catch (err) {
                console.warn('Failed to fetch projects:', err);
                return [];
            }
        },
        refetchOnWindowFocus: false,
    });

    const project = projectsData
        .map(transformProjectData)
        .find((p) => p.id === projectId);

    usePageTitle(
        project ? `${project.name} - Project Details` : 'Project Details'
    );

    const handleLike = () => {
        // TODO: Implement actual like functionality with API call
        setIsLiked(!isLiked);
    };

    const handleShare = () => {
        // TODO: Implement actual share functionality
        if (navigator.share) {
            navigator.share({
                title: project?.name,
                text: project?.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading project...</div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg text-gray-600 mb-4">
                        {error ? 'Failed to load project' : 'Project not found'}
                    </div>
                    <Link
                        to="/user/browse"
                        className="text-button-primary-100 hover:text-button-primary-200 font-medium"
                    >
                        &#x2190; Back to Browse Projects
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="mt-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    className={navButtonStyles({
                                        active: activeTab === 'overview',
                                    })}
                                    onClick={() => setActiveTab('overview')}
                                >
                                    Overview
                                </button>

                                <button
                                    type="button"
                                    className={navButtonStyles({
                                        active: activeTab === 'details',
                                    })}
                                    onClick={() => setActiveTab('details')}
                                >
                                    Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && (
                    <ProjectDetailContent
                        project={project}
                        onLike={handleLike}
                        onShare={handleShare}
                        isLiked={isLiked}
                        showActionButtons={true}
                    />
                )}

                {activeTab === 'details' && (
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Project Details
                        </h1>
                    </div>
                )}
            </div>
        </div>
    );
}
