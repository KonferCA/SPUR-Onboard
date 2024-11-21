import { motion } from 'framer-motion';
import { UserDashboard, NotificationBanner } from '@components';

const DashboardPage = () => {
  const isVerified = false;

  return (
    <UserDashboard>
      <div className="flex-1 flex flex-col">
        <h1 className="text-2xl font-semibold mb-6">
          Dashboard
        </h1>
        
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
};

export { DashboardPage };