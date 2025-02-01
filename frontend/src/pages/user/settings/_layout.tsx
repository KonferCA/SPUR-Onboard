import { Link, Outlet, createFileRoute, useNavigate, useLocation } from '@tanstack/react-router'
import { SETTINGS_ROUTES } from '@/constants/settings'
import { useEffect } from 'react'

export const Route = createFileRoute('/user/settings/_layout')({
    component: SettingsLayout,
});

function SettingsLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    
    useEffect(() => {
        // If we're at the base settings path, redirect to profile?
        if (location.pathname === '/user/settings') {
            navigate({ to: '/user/settings/profile' })
        }
    }, [location.pathname, navigate])

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-[1440px] mx-auto">
                {/* Logo */}
                <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
                    <h1 className="text-xl font-bold">Logo</h1>
                </div>

                <div className="flex">
                    {/* Sidebar */}
                    <div className="w-64 min-h-[calc(100vh-4rem)] bg-white border-r border-gray-200">
                        <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Settings</h2>
                            <nav className="space-y-1">
                                {SETTINGS_ROUTES.map((route) => (
                                    <Link
                                        key={route.path}
                                        to={route.path}
                                        className={`
                                            flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md
                                            ${location.pathname === route.path
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

                    {/* Main content */}
                    <div className="flex-1">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    )
} 