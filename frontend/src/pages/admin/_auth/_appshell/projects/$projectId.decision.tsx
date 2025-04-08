import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import {
    getProject,
    ProjectStatusEnum,
    updateProjectStatus,
} from '@/services/projects';
import { usePageTitle } from '@/utils';

export const Route = createFileRoute(
    '/admin/_auth/_appshell/projects/$projectId/decision'
)({
    component: ProjectDecisionPage,
});

function ProjectDecisionPage() {
    // set project decision page title
    usePageTitle('Project Decision');

    const { projectId } = Route.useParams();
    const { getAccessToken } = useAuth();
    const { push } = useNotification();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<ProjectStatusEnum>();

    useEffect(() => {
        async function loadProject() {
            const accessToken = getAccessToken();
            if (!accessToken || !projectId) return;

            try {
                const project = await getProject(accessToken, projectId);
                setProjectName(project.title);
            } catch (error) {
                console.error('Failed to load project:', error);
                push({
                    message: 'Failed to load project details',
                    level: 'error',
                });
            } finally {
                setLoading(false);
            }
        }

        loadProject();
    }, [getAccessToken, projectId, push]);

    const handleSubmit = async () => {
        const accessToken = getAccessToken();
        if (!selectedStatus || !accessToken || !projectId) return;

        try {
            setSubmitting(true);
            await updateProjectStatus(accessToken, projectId, selectedStatus);
            push({
                message: 'Project status updated successfully',
                level: 'success',
            });
            navigate({ to: '/admin/dashboard' });
        } catch (error) {
            console.error('Failed to update project status:', error);
            push({
                message: 'Failed to update project status',
                level: 'error',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading project details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">
                    Reviewing Project: {projectName}
                </h1>
                <p className="text-gray-600">Submitted on Nov 8, 2024</p>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Project Status</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Select the final status for this project. This action will
                    notify the project team.
                </p>

                <div className="space-y-3">
                    <p className="block">
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedStatus === ProjectStatusEnum.Verified
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onKeyUp={() =>
                                setSelectedStatus(ProjectStatusEnum.Verified)
                            }
                            onClick={() =>
                                setSelectedStatus(ProjectStatusEnum.Verified)
                            }
                        >
                            <div className="flex items-center gap-3">
                                <FiCheck
                                    className={`w-5 h-5 ${selectedStatus === ProjectStatusEnum.Verified ? 'text-green-600' : 'text-gray-500'}`}
                                />
                                <div>
                                    <p className="font-medium">Approved</p>
                                    <p className="text-sm text-gray-600">
                                        The project meets all requirements and
                                        is ready to proceed
                                    </p>
                                </div>
                            </div>
                        </div>
                    </p>

                    <p className="block">
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedStatus === ProjectStatusEnum.Pending
                                    ? 'border-yellow-500 bg-yellow-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onKeyUp={() =>
                                setSelectedStatus(ProjectStatusEnum.Pending)
                            }
                            onClick={() =>
                                setSelectedStatus(ProjectStatusEnum.Pending)
                            }
                        >
                            <div className="flex items-center gap-3">
                                <FiAlertCircle
                                    className={`w-5 h-5 ${selectedStatus === ProjectStatusEnum.Pending ? 'text-yellow-600' : 'text-gray-500'}`}
                                />
                                <div>
                                    <p className="font-medium">
                                        Needs Revisions
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        This option has been automatically
                                        selected because you left comments
                                    </p>
                                </div>
                            </div>
                        </div>
                    </p>

                    <p className="block">
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedStatus === ProjectStatusEnum.Declined
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onKeyUp={() =>
                                setSelectedStatus(ProjectStatusEnum.Declined)
                            }
                            onClick={() =>
                                setSelectedStatus(ProjectStatusEnum.Declined)
                            }
                        >
                            <div className="flex items-center gap-3">
                                <FiX
                                    className={`w-5 h-5 ${selectedStatus === ProjectStatusEnum.Declined ? 'text-red-600' : 'text-gray-500'}`}
                                />
                                <div>
                                    <p className="font-medium">Rejected</p>
                                    <p className="text-sm text-gray-600">
                                        The project does not meet the
                                        requirements
                                    </p>
                                </div>
                            </div>
                        </div>
                    </p>
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
                <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={() =>
                        navigate({ to: `/admin/projects/${projectId}/review` })
                    }
                >
                    Back to Review
                </button>
                <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmit}
                    disabled={!selectedStatus || submitting}
                >
                    {submitting ? 'Saving...' : 'Save and Send Project'}
                </button>
            </div>
        </div>
    );
}
