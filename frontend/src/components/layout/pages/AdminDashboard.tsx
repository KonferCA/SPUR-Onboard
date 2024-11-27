import React, { ReactNode } from "react";
import { FiFolder, FiBook, FiUsers, FiSettings } from "react-icons/fi";
import { DashboardTemplate } from "../templates/DashboardTemplate";

const adminMenuItems = [
  { label: "Projects", path: "/admin/projects", icon: <FiFolder /> },
  { label: "Resources", path: "/admin/resources", icon: <FiBook /> },
  { label: "Users", path: "/admin/users", icon: <FiUsers /> },
  { label: "Settings", path: "/admin/settings", icon: <FiSettings /> },
];

const adminNavTabs = [
  { label: "All Projects", path: "/admin/projects" },
  { label: "Pending", path: "/admin/projects/pending" },
  { label: "Approved", path: "/admin/projects/approved" },
];

interface AdminDashboardProps {
  children: ReactNode;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ children }) => {
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
      navTabs={adminNavTabs}
      actions={adminActions}
      logo={<h1 className="text-xl font-bold">Admin Panel</h1>}
    >
      {children}
    </DashboardTemplate>
  );
};
