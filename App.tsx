import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './store';
import { Background } from './components/Background';
import { Navigation } from './components/Navigation';
import { GlobalCube } from './components/GlobalCube';
import { Home } from './pages/Home';
import { Artifacts } from './pages/Artifacts';
import { Logs } from './pages/Logs';
import { LogDetail } from './pages/LogDetail';
import { About } from './pages/About';


const ContentWrapper: React.FC = () => {
    const location = useLocation();
    return (
        <div className="relative min-h-screen text-white">
            <Background />
            <Navigation />
            <GlobalCube />

            <main className="relative z-10 transition-opacity duration-500 ease-in-out pointer-events-none">
                <Routes location={location}>
                    <Route path="/" element={<Home />} />
                    <Route path="/artifacts" element={<Artifacts />} />
                    <Route path="/logs" element={<Logs />} />
                    <Route path="/logs/:id" element={<LogDetail />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <HashRouter>
                <ContentWrapper />
            </HashRouter>
        </AppProvider>
    );
};

export default App;