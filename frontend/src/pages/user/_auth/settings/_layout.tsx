import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/user/_auth/settings/_layout')({
  component: SettingsLayout,
  beforeLoad: ({ location }) => {
    if (location.pathname === '/user/settings') {
      throw redirect({
        to: '/user/settings/profile'
      })
    }
  }
})

function SettingsLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-white border-r border-gray-200">
          <nav className="p-4 space-y-1">
            <Link
              to="/user/settings/profile"
              activeProps={{
                className: 'bg-gray-100 text-gray-900'
              }}
              inactiveProps={{
                className: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }}
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md"
            >
              Personal Profile
            </Link>
            <Link
              to="/user/settings/company"
              activeProps={{
                className: 'bg-gray-100 text-gray-900'
              }}
              inactiveProps={{
                className: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }}
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md"
            >
              Company Profile
            </Link>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
