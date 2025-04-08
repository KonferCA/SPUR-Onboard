import { createFileRoute, redirect } from '@tanstack/react-router';

const Landing: React.FC = () => {
    return <div />;
};

export const Route = createFileRoute('/')({
    component: Landing,
    beforeLoad: ({ context }) => {
        const { auth } = context;

        // If user is authenticated, redirect to home page
        if (auth?.user) {
            throw redirect({
                to: '/user/home',
                replace: true,
            });
        }

        // If not authenticated, redirect to auth page
        throw redirect({
            to: '/auth',
            replace: true,
        });
    },
});
