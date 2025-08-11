import { useState } from 'react';
import { createFileRoute, useParams, Link } from '@tanstack/react-router';
import { usePageTitle } from '@/utils';
import { FiHeart, FiArrowLeft } from 'react-icons/fi';
import { LogoSVG } from '@/assets';
import { useQuery } from '@tanstack/react-query';
import { getLatestProjects } from '@/services/project';
import {
    transformProjectData,
    SearchHeader,
} from '@/components/browse/BrowseComponents';
import { ProjectDetailContent } from '@/components/project/ProjectDetailComponents';
import { AuthRequiredModal } from '@/components/project/AuthRequiredModal';

export const Route = createFileRoute('/project/$projectId')({
    component: PublicProjectDetail,
});

function PublicProjectDetail() {
    const { projectId } = useParams({ from: '/project/$projectId' });
    const [searchQuery, setSearchQuery] = useState('');
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalAction, setAuthModalAction] = useState<'like' | 'share'>(
        'like'
    );

    const {
        data: projectsData = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['project_detail', projectId],
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
        setAuthModalAction('like');
        setAuthModalOpen(true);
    };

    const handleShare = () => {
        setAuthModalAction('share');
        setAuthModalOpen(true);
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
                        to="/browse"
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
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center">
                                <img
                                    src={LogoSVG}
                                    alt="SPUR"
                                    className="w-10 h-10"
                                />
                                <span className="ml-2 text-xl font-bold tracking-wider">
                                    ONBOARD
                                </span>
                            </div>

                            <Link
                                to="/browse"
                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <FiArrowLeft className="w-4 h-4" />
                                Back to Browse
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <SearchHeader
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                            />

                            <button
                                type="button"
                                onClick={() => {
                                    setAuthModalAction('like');
                                    setAuthModalOpen(true);
                                }}
                                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                <FiHeart className="w-5 h-5" />
                                Liked Projects
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ProjectDetailContent
                    project={project}
                    onLike={handleLike}
                    onShare={handleShare}
                    isLiked={false}
                    showActionButtons={true}
                />
            </div>

            <AuthRequiredModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                action={authModalAction}
            />
        </div>
    );
}
