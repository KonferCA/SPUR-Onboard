import { createFileRoute, redirect } from '@tanstack/react-router';
import { isAdmin } from '@/utils/permissions';

const Landing: React.FC = () => {
    return <div />;
};

export const Route = createFileRoute('/')({
    component: Landing,
    beforeLoad: ({ context }) => {
        const { auth } = context;

        // If user is authenticated, redirect to appropriate page
        if (auth?.user) {
            if (isAdmin(auth.user.permissions)) {
                throw redirect({
                    to: '/admin/dashboard',
                    replace: true,
                });
            }

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
