import { Button, ProjectCard } from '@/components';
import { useAuth } from '@/contexts';
import { listProjects } from '@/services/project';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { useState } from 'react';
import { usePageTitle } from '@/utils';

export const Route = createFileRoute('/user/_auth/_appshell/dashboard')({
    component: RouteComponent,
});

const navButtonStyles = cva(
    'py-2 px-4 rounded-md text-gray-500 transition-all',
    {
        variants: {
            active: {
                true: 'bg-[#FFC298] text-button-primary-text-100 border-2 border-[#F4802F]',
                false: 'hover:bg-gray-100',
            },
        },
        defaultVariants: {
            active: false,
        },
    }
);

function RouteComponent() {
    // set page title
    usePageTitle('Dashboard');

    const [filterBy, setFilter] = useState<'all' | 'draft'>('all');
    const { getAccessToken } = useAuth();
    const { data: projects, isLoading } = useQuery({
        queryKey: ['user_projects'],
        queryFn: async () => {
            const accessToken = getAccessToken();
            if (!accessToken) return;
            return await listProjects(accessToken);
        },
        enabled: !!getAccessToken(),
        refetchOnWindowFocus: false,
        initialData: [],
    });
    const navigate = useNavigate({ from: '/user/dashboard' });

    const handleCreateProject = () => {
        navigate({ to: '/user/project/new' });
    };

    return (
        <div className="flex flex-col h-full p-6">
            <div className="mb-6">
                <nav className="flex justify-between items-center">
                    <div>
                        <ul className="flex items-center gap-3">
                            <li>
                                <button
                                    type="button"
                                    className={navButtonStyles({
                                        active: filterBy === 'all',
                                    })}
                                    onClick={() => setFilter('all')}
                                >
                                    All Projects
                                </button>
                            </li>

                            <li>
                                <button
                                    type="button"
                                    className={navButtonStyles({
                                        active: filterBy === 'draft',
                                    })}
                                    onClick={() => setFilter('draft')}
                                >
                                    Drafts
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="hidden md:block">
                        <Button onClick={handleCreateProject} variant="primary">
                            Create a New Project
                        </Button>
                    </div>
                </nav>
            </div>

            <div className="h-[1px] bg-gray-300 mb-6" />

            <div className="flex-1">
                <main>
                    {isLoading && (
                        <div className="w-full flex items-center justify-center py-12">
                            <p>Loading projects...</p>
                        </div>
                    )}

                    {!isLoading && projects && projects.length < 1 && (
                        <div className="w-full flex items-center justify-center py-12">
                            <div className="text-center">
                                <p className="text-md text-black mb-4 mt-52">
                                    You currently have no projects
                                </p>
                            </div>
                        </div>
                    )}

                    {projects && (
                        <div className="space-y-4">
                            {projects
                                .filter((project) =>
                                    filterBy === 'all'
                                        ? true
                                        : project.status === filterBy
                                )
                                .map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        data={project}
                                    />
                                ))}
                        </div>
                    )}
                </main>
            </div>

            <div className="md:hidden p-4 mt-auto">
                <Button
                    onClick={handleCreateProject}
                    variant="primary"
                    size="lg"
                    liquid
                >
                    Create a new project
                </Button>
            </div>
        </div>
    );
}
