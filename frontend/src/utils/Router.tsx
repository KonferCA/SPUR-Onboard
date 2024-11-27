import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing, Register, DashboardPage, AdminDashboardPage, SubmitProjectPage } from '@pages';

const Router = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={ <Landing /> } />
            <Route path="/register" element={ <Register /> } />
            
            {/* User routes */}
            <Route path="/dashboard" element={ <DashboardPage /> } />
            <Route path="/projects" element={ <DashboardPage /> } />
            <Route path="/resources" element={ <DashboardPage /> } />
            <Route path="/favorites" element={ <DashboardPage /> } />
            <Route path="/profile" element={ <DashboardPage /> } />
            <Route path="/drafts" element={ <DashboardPage /> } />
            
            {/* Admin routes */}
            <Route path="/admin/dashboard" element={ <AdminDashboardPage /> } />
            <Route path="/admin/projects" element={ <AdminDashboardPage /> } />
            <Route path="/admin/projects/pending" element={ <AdminDashboardPage /> } />
            <Route path="/admin/projects/approved" element={ <AdminDashboardPage /> } />
            <Route path="/admin/resources" element={ <AdminDashboardPage /> } />
            <Route path="/admin/users" element={ <AdminDashboardPage /> } />
            <Route path="/admin/settings" element={ <AdminDashboardPage /> } />
            <Route path="/submit-project" element={<SubmitProjectPage />} />
        </Routes>
    </BrowserRouter>
);

export { Router };