import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing, DashboardPage } from '@pages'

const Router = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={ <Landing /> } />
            <Route path="/dashboard" element={ <DashboardPage /> } />
        </Routes>
    </BrowserRouter>
);

export { Router };