import { createFileRoute, redirect } from '@tanstack/react-router';

const Landing: React.FC = () => {
    return <div></div>;
};

export const Route = createFileRoute('/')({
    component: Landing,
    beforeLoad: () => {
        throw redirect({
            to: '/auth',
            replace: true,
        });
    },
});
