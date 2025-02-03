import { createFileRoute, Outlet, Link } from '@tanstack/react-router'
import { FiFolder, FiBook, FiStar, FiUser } from 'react-icons/fi'
import { DashboardTemplate } from '@templates'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useAuth } from '@contexts'
import { SETTINGS_ROUTES } from '@/constants/settings'

export const Route = createFileRoute('/user/_auth/_appshell')({
  component: RouteComponent,
})

const userMenuItems = [
  { label: 'My Projects', path: '/user/projects', icon: <FiFolder /> },
  { label: 'Resources', path: '/resources', icon: <FiBook /> },
  { label: 'Favorites', path: '/favorites', icon: <FiStar /> },
  { label: 'Profile', path: '/profile', icon: <FiUser /> },
]

const userNavTabs = [
  { label: 'All Projects', path: '/user/projects' },
  { label: 'Drafts', path: '/drafts' },
]

function RouteComponent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { companyId } = useAuth()

  const isSettingsPage = location.pathname.includes('/settings')

  // Settings sidebar
  const SettingsSidebar = isSettingsPage ? (
    <div className="w-64 bg-white border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Settings
        </h2>
        <nav className="space-y-1">
          {SETTINGS_ROUTES.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className={`
                flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md
                ${
                  location.pathname === route.path
                    ? 'bg-gray-50 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              {route.icon}
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  ) : null

  const userActions = (
    <>
      <button
        onClick={() =>
          !companyId
            ? navigate({ to: '/user/company/new' })
            : navigate({ to: '/user/project/new' })
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
  )

  return (
    <DashboardTemplate
      menuItems={userMenuItems}
      navTabs={userNavTabs}
      actions={userActions}
      customSidebar={SettingsSidebar}
    >
      <Outlet />
    </DashboardTemplate>
  )
}
