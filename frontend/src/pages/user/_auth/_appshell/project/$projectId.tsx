import React, { useState } from 'react';
import { createFileRoute, useParams, Link } from '@tanstack/react-router';
import { usePageTitle } from '@/utils';
import { FiArrowLeft } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { getLatestProjects } from '@/services/project';
import {
    transformProjectData,
    toggleProjectLike,
} from '@/components/browse/BrowseComponents';
import { ProjectDetailContent } from '@/components/project/ProjectDetailComponents';

export const Route = createFileRoute(
    '/user/_auth/_appshell/project/$projectId'
)({
    component: AuthenticatedProjectDetail,
});

function AuthenticatedProjectDetail() {
    const { projectId } = useParams({
        from: '/user/_auth/_appshell/project/$projectId',
    });

    const {
        data: projectsData = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['project_detail_auth', projectId],
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

    const [project, setProject] = useState<ReturnType<
        typeof transformProjectData
    > | null>(null);

    React.useEffect(() => {
        const transformedProject = projectsData
            .map(transformProjectData)
            .find((p) => p.id === projectId);
        setProject(transformedProject || null);
    }, [projectsData, projectId]);

    usePageTitle(
        project ? `${project.name} - Project Details` : 'Project Details'
    );

    const handleLike = () => {
        if (!project) {
            return;
        }

        const newLikedState = toggleProjectLike(project.id);
        setProject((prev) => (prev ? { ...prev, liked: newLikedState } : null));
    };

    const handleShare = () => {
        if (!project) {
            return;
        }

        // copy to clipboard
        const url = `${window.location.origin}/project/${project.id}`;
        navigator.clipboard
            .writeText(url)
            .then(() => {
                // TODO: add toast notifs
                console.log('Project URL copied to clipboard');
            })
            .catch((err) => {
                console.error('Failed to copy URL:', err);
            });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center min-h-screen bg-gray-50">
                <div className="pt-20 max-w-7xl mx-auto w-full px-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-lg text-gray-600">
                            Loading project...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="flex flex-col justify-center min-h-screen bg-gray-50">
                <div className="pt-20 max-w-7xl mx-auto w-full px-6">
                    <div className="text-center py-12">
                        <div className="text-lg text-gray-600 mb-4">
                            {error
                                ? 'Failed to load project'
                                : 'Project not found'}
                        </div>

                        <Link
                            to="/user/browse"
                            className="text-button-primary-100 hover:text-button-primary-200 font-medium"
                        >
                            &#x2190; Back to Browse Projects
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-between min-h-screen bg-gray-50">
            <div className="pt-20 max-w-7xl mx-auto w-full">
                <div className="px-6">
                    <div className="mb-6">
                        <Link
                            to="/user/browse"
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors w-fit"
                        >
                            <FiArrowLeft className="w-4 h-4" />
                            Back to Projects Marketplace
                        </Link>
                    </div>

                    <ProjectDetailContent
                        project={project}
                        onLike={handleLike}
                        onShare={handleShare}
                        isLiked={project.liked}
                        showActionButtons={true}
                    />
                </div>
            </div>
        </div>
    );
}
