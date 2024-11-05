import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from '@pages'

const Router = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={ <Landing /> } />
        </Routes>
    </BrowserRouter>
);

export { Router };