import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
    // Landing,
    Register,
    DashboardPage,
    AdminDashboardPage,
    SubmitProjectPage,
    AdminProjectsPage,
    ProjectDetailsPage,
    ProjectSubmissionPage,
    UserProjectsPage,
    CreateCompany,
} from '@pages';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute, RegistrationGuard } from '@router';

const Router = () => (
    <AuthProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Register />} />
                <Route path="/register" element={<Register />} />

                {/* User routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                'startup_owner',
                                'investor',
                                'admin',
                            ]}
                        >
                            <RegistrationGuard>
                                <DashboardPage />
                            </RegistrationGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/new-company"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                'startup_owner',
                                'investor',
                                'admin',
                            ]}
                        >
                            <RegistrationGuard>
                                <CreateCompany />
                            </RegistrationGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/projects"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                'startup_owner',
                                'investor',
                                'admin',
                            ]}
                        >
                            <RegistrationGuard>
                                <UserProjectsPage />
                            </RegistrationGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/resources"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                'startup_owner',
                                'investor',
                                'admin',
                            ]}
                        >
                            <RegistrationGuard>
                                <DashboardPage />
                            </RegistrationGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/favorites"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                'startup_owner',
                                'investor',
                                'admin',
                            ]}
                        >
                            <RegistrationGuard>
                                <DashboardPage />
                            </RegistrationGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                'startup_owner',
                                'investor',
                                'admin',
                            ]}
                        >
                            <RegistrationGuard>
                                <DashboardPage />
                            </RegistrationGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/drafts"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                'startup_owner',
                                'investor',
                                'admin',
                            ]}
                        >
                            <RegistrationGuard>
                                <DashboardPage />
                            </RegistrationGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/submit-project"
                    element={
                        <ProtectedRoute allowedRoles={['startup_owner']}>
                            <RegistrationGuard>
                                <SubmitProjectPage />
                            </RegistrationGuard>
                        </ProtectedRoute>
                    }
                />

                {/* Admin routes */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <RegistrationGuard>
                                <AdminDashboardPage />
                            </RegistrationGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/projects"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <RegistrationGuard>
                                <AdminProjectsPage />
                            </RegistrationGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/projects/:id"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <RegistrationGuard>
                                <ProjectDetailsPage />
                            </RegistrationGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/projects/:id/submission"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <RegistrationGuard>
                                <ProjectSubmissionPage />
                            </RegistrationGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/projects/pending"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <RegistrationGuard>
                                <AdminProjectsPage />
                            </RegistrationGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/projects/approved"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <RegistrationGuard>
                                <AdminProjectsPage />
                            </RegistrationGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/resources"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <RegistrationGuard>
                                <AdminDashboardPage />
                            </RegistrationGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <RegistrationGuard>
                                <AdminDashboardPage />
                            </RegistrationGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/settings"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <RegistrationGuard>
                                <AdminDashboardPage />
                            </RegistrationGuard>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    </AuthProvider>
);

export { Router };
