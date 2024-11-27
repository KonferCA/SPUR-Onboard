import { UserDashboard, Section, Grid, Footer, Header, FormContainer, NotificationBanner } from '@components';
import { Button } from '@components';

const DashboardPage = () => {
  const isVerified = false;

  return (
    <UserDashboard>
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
    </UserDashboard>
  );
}

export { DashboardPage };