import { FiFolder, FiBook, FiUsers, FiSettings } from 'react-icons/fi';
import { Button, FormContainer } from '@components';
import { Section, Grid } from '@layouts';
import { DashboardTemplate } from '@/templates';

const adminMenuItems = [
    { label: 'Projects', path: '/admin/projects', icon: <FiFolder /> },
    { label: 'Resources', path: '/admin/resources', icon: <FiBook /> },
    { label: 'Users', path: '/admin/users', icon: <FiUsers /> },
    { label: 'Settings', path: '/admin/settings', icon: <FiSettings /> },
];

const AdminDashboardPage = () => {
    const adminActions = (
        <>
            <button className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-700">
                New Project
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full">
                <span className="sr-only">Admin menu</span>
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
            </button>
        </>
    );
    return (
        <DashboardTemplate
            menuItems={adminMenuItems}
            actions={adminActions}
            logo={<h1 className="text-xl font-bold">Admin Panel</h1>}
        >
            {/* main content */}
            <div className="flex-1 overflow-y-auto">
                <Section width="full" padding="large" container={false}>
                    <div className="px-6">
                        <Grid columns={2} gap="large">
                            {/* left column */}
                            <div className="space-y-6">
                                <FormContainer title="Admin Stats">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600">
                                                Total Users
                                            </p>
                                            <p className="text-2xl font-bold">
                                                1,234
                                            </p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600">
                                                Active Projects
                                            </p>
                                            <p className="text-2xl font-bold">
                                                567
                                            </p>
                                        </div>
                                    </div>
                                </FormContainer>

                                <FormContainer title="Pending Approvals">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                            <div>
                                                <p className="font-medium">
                                                    Project XYZ
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Awaiting review
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                            <div>
                                                <p className="font-medium">
                                                    Project ABC
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Pending verification
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </FormContainer>
                            </div>

                            {/* right column */}
                            <div className="space-y-6">
                                <FormContainer title="Quick Actions">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button variant="outline" liquid>
                                            Review Projects
                                        </Button>
                                        <Button variant="outline" liquid>
                                            Manage Users
                                        </Button>
                                        <Button variant="outline" liquid>
                                            System Settings
                                        </Button>
                                        <Button variant="outline" liquid>
                                            View Reports
                                        </Button>
                                    </div>
                                </FormContainer>
                            </div>
                        </Grid>
                    </div>
                </Section>
            </div>
        </DashboardTemplate>
    );
};

export { AdminDashboardPage };
