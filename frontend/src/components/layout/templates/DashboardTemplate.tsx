import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { PageLayout } from "../components/PageLayout";
import { Stack } from "../components/Stack";

interface MenuItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface DashboardTemplateProps {
  children: ReactNode;
  menuItems: MenuItem[];
  logo?: ReactNode;
  navTabs?: Array<{
    label: string;
    path: string;
  }>;
  actions?: ReactNode;
  customSidebar?: ReactNode;
}

export const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  children,
  menuItems,
  logo = <h1 className="text-xl font-bold">Logo</h1>,
  navTabs = [],
  actions,
  customSidebar,
}) => {
  const location = useLocation();

  return (
    <PageLayout className="bg-gray-50">
      {/* top navbar - fixed */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-6">
          <Stack direction="row" justify="between" align="center" className="h-16">
            <Stack direction="row" gap="lg" align="center">
              {/* logo */}
              {logo}

              {/* navigation tabs */}
              {navTabs.length > 0 && (
                <Stack direction="row" gap="md">
                  {navTabs.map((tab) => (
                    <Link
                      key={tab.path}
                      to={tab.path}
                      className={`px-4 py-2 text-sm font-medium ${
                        location.pathname === tab.path
                          ? "text-gray-900 border-b-2 border-gray-900"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  ))}
                </Stack>
              )}
            </Stack>

            {/* right side actions */}
            {actions && (
              <Stack direction="row" gap="md" align="center">
                {actions}
              </Stack>
            )}
          </Stack>
        </div>
      </div>

      {/* spacer for fixed header */}
      <div className="h-16" />

      {/* main content area */}
      <div className="w-full max-w-[1440px] mx-auto flex flex-1">
        {/* sidebar */}
        {customSidebar || (
          <div className="w-64 bg-white border-r border-gray-200">
            <nav className="sticky top-16 py-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-6 py-2 text-sm whitespace-nowrap
                    ${
                      location.pathname === item.path
                        ? "bg-gray-50 text-gray-900 font-medium"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </PageLayout>
  );
};
