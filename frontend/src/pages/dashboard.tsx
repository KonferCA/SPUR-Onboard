import { Button, Section, Header, NotificationBanner } from '@components';
import { DashboardTemplate } from '@templates';
import { FiFolder, FiBook, FiStar, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const userMenuItems = [
    { label: 'My Projects', path: '/projects', icon: <FiFolder /> },
    { label: 'Resources', path: '/resources', icon: <FiBook /> },
    { label: 'Favorites', path: '/favorites', icon: <FiStar /> },
    { label: 'Profile', path: '/profile', icon: <FiUser /> },
];

const userNavTabs = [
    { label: 'All Projects', path: '/projects' },
    { label: 'Drafts', path: '/drafts' },
];

const DashboardPage = () => {
    const isVerified = false;

    const navigate = useNavigate();
    const { companyId } = useAuth();

    const userActions = (
        <>
            <button
                onClick={() =>
                    !companyId
                        ? navigate('/new-company')
                        : navigate('/submit-project')
                }
                className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {!companyId ? 'Create company' : 'Submit a project'}
            </button>
            <div className="relative">
                <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full">
                    <span className="sr-only">User menu</span>
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                </button>
            </div>
        </>
    );

    return (
        <DashboardTemplate
            menuItems={userMenuItems}
            navTabs={userNavTabs}
            actions={userActions}
        >
            {/* header */}
            <Header>
                <Section
                    width="full"
                    padding="small"
                    background="bg-white"
                    container={false}
                >
                    <div className="px-6 flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Dashboard</h2>
                        <Button size="sm">Action</Button>
                    </div>
                </Section>
            </Header>

            <div className="flex-1 flex flex-col">
                <div className="mt-8 text-center text-gray-500">
                    You currently have no projects
                </div>

                {!isVerified && (
                    <div className="mt-auto relative h-[100px]">
                        <NotificationBanner
                            variant="warning"
                            position="bottom"
                            message="Your account is currently unverified, please give our team 48 to 72 hours to verify your account before you can submit a project."
                        />
                    </div>
                )}
            </div>
        </DashboardTemplate>
    );
};

export { DashboardPage };
