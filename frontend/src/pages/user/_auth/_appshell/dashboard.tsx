import { Button, ProjectCard } from '@/components';
import { useAuth } from '@/contexts';
import { listProjects } from '@/services/project';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { useState } from 'react';

export const Route = createFileRoute('/user/_auth/_appshell/dashboard')({
    component: RouteComponent,
});

const navButtonStyles = cva(
    'p-4 transition rounded-xl text-gray-500 hover:outline outline-gray-300',
    {
        variants: {
            active: {
                true: 'bg-gray-200 text-gray-900 hover:outline-transparent',
            },
        },
    }
);

function RouteComponent() {
    const [filterBy, setFilter] = useState<'all' | 'draft'>('all');
    const { accessToken } = useAuth();
    const { data: projects, isLoading } = useQuery({
        queryKey: ['user_projects', accessToken],
        queryFn: async () => {
            if (!accessToken) return;
            return await listProjects(accessToken);
        },
        refetchOnWindowFocus: false,
        initialData: [],
    });
    const navigate = useNavigate({ from: '/user/dashboard' });

    return (
        <div>
            <div>
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
                    <div>
                        <Button
                            onClick={() =>
                                navigate({ to: '/user/project/new' })
                            }
                        >
                            Create a New Project
                        </Button>
                    </div>
                </nav>
            </div>
            <div className="h-[1px] bg-gray-300 my-6">{/* Separator */}</div>
            <div>
                <main>
                    {isLoading && (
                        <div className="w-full flex items-center justify-center">
                            <p>Loading projects...</p>
                        </div>
                    )}
                    {!isLoading && projects && projects.length < 1 && (
                        <div className="w-full flex items-center justify-center">
                            <p>You currently have no projects</p>
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
        </div>
    );
}
