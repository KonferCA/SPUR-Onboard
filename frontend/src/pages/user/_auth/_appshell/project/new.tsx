import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { createProject } from '@/services/project';
import { useAuth } from '@/contexts';
import { useNavigate } from '@tanstack/react-router';

const NewProjectPage = () => {
    const navigate = useNavigate();
    const { getAccessToken } = useAuth();
    const hasTriggeredFetchRef = useRef(false);

    // biome-ignore lint/correctness/useExhaustiveDependencies: lint has problem with navigate not being in the list of dependencies but the function never changes so it is ok to leave it out
    useEffect(() => {
        const accessToken = getAccessToken();
        if (!accessToken || hasTriggeredFetchRef.current) return;

        // create project on mount
        const newProject = async () => {
            const project = await createProject(accessToken);
            navigate({ to: `/user/project/${project.id}/form`, replace: true });
        };

        hasTriggeredFetchRef.current = true;

        newProject();
    }, [getAccessToken]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
    );
};

export const Route = createFileRoute('/user/_auth/_appshell/project/new')({
    component: React.memo(NewProjectPage),
});
