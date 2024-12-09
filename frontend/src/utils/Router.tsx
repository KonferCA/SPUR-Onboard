import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing, Register, DashboardPage, AdminDashboardPage, SubmitProjectPage, AdminProjectsPage, ProjectDetailsPage, ProjectSubmissionPage } from '@pages';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

const Router = () => (
    <AuthProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={ <Landing /> } />
                <Route path="/register" element={ <Register /> } />
                
                {/* User routes */}
                <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={['startup_owner', 'investor', 'admin']}>
                        <DashboardPage />
                    </ProtectedRoute>
                } />
                <Route path="/projects" element={
                    <ProtectedRoute allowedRoles={['startup_owner', 'investor', 'admin']}>
                        <DashboardPage />
                    </ProtectedRoute>
                } />
                <Route path="/resources" element={
                    <ProtectedRoute allowedRoles={['startup_owner', 'investor', 'admin']}>
                        <DashboardPage />
                    </ProtectedRoute>
                } />
                <Route path="/favorites" element={
                    <ProtectedRoute allowedRoles={['startup_owner', 'investor', 'admin']}>
                        <DashboardPage />
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute allowedRoles={['startup_owner', 'investor', 'admin']}>
                        <DashboardPage />
                    </ProtectedRoute>
                } />
                <Route path="/drafts" element={
                    <ProtectedRoute allowedRoles={['startup_owner', 'investor', 'admin']}>
                        <DashboardPage />
                    </ProtectedRoute>
                } />
                <Route path="/submit-project" element={
                    <ProtectedRoute allowedRoles={['startup_owner']}>
                        <SubmitProjectPage />
                    </ProtectedRoute>
                } />
                
                {/* Admin routes */}
                <Route path="/admin/dashboard" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/projects" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminProjectsPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/projects/:id" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <ProjectDetailsPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/projects/:id/submission" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <ProjectSubmissionPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/projects/pending" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminProjectsPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/projects/approved" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminProjectsPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/resources" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage />
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    </AuthProvider>
);

export { Router };
