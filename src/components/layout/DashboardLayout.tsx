import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiFolder, FiBook } from "react-icons/fi";
import { PageLayout } from "./PageLayout";

interface MenuItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const menuItems: MenuItem[] = [
  { label: "Projects", path: "/projects", icon: <FiFolder /> },
  { label: "Resources", path: "/resources", icon: <FiBook /> },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <PageLayout className="bg-gray-100">
      {/* top navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-8">
            {/* logo */}
            <h1 className="text-xl font-bold">Logo</h1>

            {/* project tabs */}
            <div className="flex gap-4">
              <Link
                to="/projects"
                className={`px-4 py-2 text-sm font-medium ${
                  location.pathname === "/projects"
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All Projects
              </Link>
              <Link
                to="/drafts"
                className={`px-4 py-2 text-sm font-medium ${
                  location.pathname === "/drafts"
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Drafts
              </Link>
            </div>
          </div>

          {/* right side actions */}
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-700">
              Submit a project
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full">
              <span className="sr-only">User menu</span>
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
            </button>
          </div>
        </div>
      </nav>

      {/* main content area */}
      <div className="flex-1 flex">
        {/* sidebar */}
        <aside className="w-48 bg-white border-r border-gray-200">
          <nav className="p-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-2 mb-1 rounded-md text-sm
                  ${
                    location.pathname === item.path
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* main content */}
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </PageLayout>
  );
};

export { DashboardLayout };
