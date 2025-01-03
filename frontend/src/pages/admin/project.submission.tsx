import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AdminDashboard } from '@/components/layout';
import { getProjectDetails } from '@/services/project';
import type { Project } from '@/services/project';
import { format } from 'date-fns';
import { AnchorLinks } from '@/components';

interface Section {
    id: string;
    title: string;
    viewed?: boolean;
    questions: {
        question: string;
        answer: string;
    }[];
}

export const ProjectSubmissionPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sections, setSections] = useState<Section[]>([
        { id: '1', title: 'Bookkeeping Details', viewed: false, questions: [] },
        { id: '2', title: 'Company Overview', viewed: false, questions: [] },
        { id: '3', title: 'Product Overview', viewed: false, questions: [] },
        {
            id: '4',
            title: 'Customer & Demographic',
            viewed: false,
            questions: [],
        },
        { id: '5', title: 'Financials', viewed: false, questions: [] },
        { id: '6', title: 'Team Overview', viewed: false, questions: [] },
        {
            id: '7',
            title: 'Social Media & Web Presence',
            viewed: false,
            questions: [],
        },
    ]);

    // Helper function to create valid CSS selector IDs
    const createSectionId = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Replace any non-alphanumeric characters with dash
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
    };

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const projectData = await getProjectDetails(id!);
                setProject(projectData);

                // Update sections with data from the project
                setSections((prev) =>
                    prev.map((section) => {
                        // Find matching section from project data
                        const projectSection = projectData.sections?.find(
                            (s) => {
                                // Normalize both strings for comparison
                                const normalizedSectionTitle = section.title
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, '');
                                const normalizedProjectTitle = s.title
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, '');
                                return (
                                    normalizedSectionTitle ===
                                    normalizedProjectTitle
                                );
                            }
                        );

                        return {
                            ...section,
                            questions: projectSection?.questions || [],
                        };
                    })
                );

                // Debug logging
                console.log('Project Sections:', projectData.sections);
                console.log('Updated Sections:', sections);
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

        if (id) {
            fetchProject();
        }
    }, [id]);

    const formatDate = (dateString: string | undefined) => {
        try {
            if (!dateString) return '';
            return format(new Date(dateString), 'MMMM d, yyyy');
        } catch {
            return dateString || '';
        }
    };

    const CustomSidebar = (
        <div className="sticky top-[64px] w-64 bg-gray-50 border-r border-gray-200 p-4 h-[calc(100vh-64px)] overflow-y-auto">
            <div className="mb-6">
                <h2 className="text-lg font-semibold">Reviewing Project:</h2>
                <h3 className="text-xl font-bold">{project?.title || ''}</h3>
                <p className="text-sm text-gray-500">
                    {project?.created_at
                        ? `Submitted on ${formatDate(project.created_at)}`
                        : ''}
                </p>
            </div>

            <AnchorLinks
                links={sections.map((section) => ({
                    label: section.title,
                    target: `#${createSectionId(section.title)}`,
                    offset: 80, // offset for the fixed header
                }))}
            >
                {(link) => (
                    <div
                        className={`
              flex items-center justify-between px-3 py-2 text-sm rounded
              ${
                  link.active
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
                    >
                        <span>{link.label}</span>
                        {sections.find((s) => s.title === link.label)
                            ?.viewed && (
                            <span className="text-xs text-gray-500">
                                Viewed
                            </span>
                        )}
                    </div>
                )}
            </AnchorLinks>
        </div>
    );

    if (loading)
        return (
            <AdminDashboard customSidebar={CustomSidebar}>
                <div>Loading...</div>
            </AdminDashboard>
        );

    if (error || !project)
        return (
            <AdminDashboard customSidebar={CustomSidebar}>
                <div className="text-red-600">
                    {error || 'Project not found'}
                </div>
            </AdminDashboard>
        );

    return (
        <AdminDashboard customSidebar={CustomSidebar}>
            <div className="flex h-full">
                {/* Main Content - Scrollable */}
                <div className="flex-1 mr-72">
                    <div className="max-w-4xl mx-auto p-8">
                        {sections.map((section) => (
                            <div
                                key={section.id}
                                id={createSectionId(section.title)}
                                className="mb-12"
                            >
                                <div className="flex items-center justify-between sticky top-[64px] bg-white/95 backdrop-blur-sm py-4 z-10 border-b border-gray-100">
                                    <h2 className="text-2xl font-bold">
                                        {section.title}
                                    </h2>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-500">
                                            Viewed
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={section.viewed}
                                            onChange={() => {
                                                /* TODO: implement viewed toggle */
                                            }}
                                            className="h-4 w-4 text-blue-600 rounded"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6 mt-4">
                                    {section.questions?.length > 0 ? (
                                        section.questions.map((q, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-white rounded-lg border border-gray-200 p-6"
                                            >
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {q.question}
                                                </label>
                                                <div className="text-gray-900">
                                                    {q.answer}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-gray-500 text-sm">
                                            No questions available for this
                                            section
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar - Fixed */}
                <div className="w-72 bg-gray-50 border-l border-gray-200 p-4 fixed top-[64px] right-0 bottom-0 overflow-y-auto">
                    <h3 className="font-semibold mb-4">Uploaded Documents</h3>
                    <div className="space-y-3">
                        {project?.documents?.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center justify-between p-2 hover:bg-gray-100 rounded"
                            >
                                <div className="flex items-center space-x-2">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <span className="text-sm text-gray-600">
                                        {doc.name}
                                    </span>
                                </div>
                                <button
                                    onClick={() =>
                                        window.open(doc.url, '_blank')
                                    }
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminDashboard>
    );
};
