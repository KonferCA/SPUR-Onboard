import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing, Register } from '@pages'

const Router = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={ <Landing /> } />
            <Route path="/register" element={ <Register /> } />
        </Routes>
    </BrowserRouter>
);

export { Router };