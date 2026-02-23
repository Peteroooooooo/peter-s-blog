
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';
import { AppState } from '../types';
import { Activity, Box, Cpu, FileText } from 'lucide-react';

export const Navigation: React.FC = () => {
    const { appState } = useAppStore();
    const location = useLocation();
    const isOverclocked = appState === AppState.OVERCLOCKED;

    const navItems = [
        { path: '/', label: 'HOME', icon: <Cpu size={14} /> },
        { path: '/artifacts', label: 'ARTIFACTS', icon: <Box size={14} /> },
        { path: '/logs', label: 'LOGS', icon: <FileText size={14} /> },
        { path: '/about', label: 'ABOUT ME', icon: <Activity size={14} /> },
    ];

    return (
        <div className="fixed top-8 left-0 w-full z-40 flex justify-center pointer-events-none">
            {/* Connecting Rail Line */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[1px] -z-10 transition-all duration-1000 ${isOverclocked
                    ? 'bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-100'
                    : 'bg-gradient-to-r from-transparent via-gray-600 to-transparent opacity-50'
                }`} />

            <div className="flex items-center gap-6 pointer-events-auto">
                {navItems.map((item, index) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        // Add target attribute for ElectricOverlay
                        data-circuit-target={`nav-${index}`}
                        className={({ isActive }) => `
                            relative flex flex-col items-center justify-center
                            w-28 h-10 clip-path-slant transition-all duration-300
                            border-b-2 
                            ${isActive
                                ? (isOverclocked
                                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,255,255,0.4)]'
                                    : 'bg-gray-800 border-white text-white shadow-lg')
                                : (isOverclocked
                                    ? 'bg-[#050505]/90 border-cyan-900/50 text-cyan-700 hover:border-cyan-500 hover:text-cyan-400'
                                    : 'bg-[#111]/90 border-gray-600 text-gray-400 hover:border-white hover:text-white')
                            }
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                {/* Inner Tech Detail */}
                                <div className="flex items-center space-x-2 text-xs font-bold tracking-widest uppercase z-10">
                                    <span className={isActive && isOverclocked ? 'animate-pulse' : ''}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </div>

                                {/* Micro Decorations */}
                                <div className={`absolute top-0 right-0 w-1 h-1 ${isActive ? 'bg-current' : 'bg-transparent'}`} />
                                <div className={`absolute bottom-0 left-0 w-1 h-1 ${isActive ? 'bg-current' : 'bg-transparent'}`} />
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            <style>{`
                .clip-path-slant {
                    clip-path: polygon(10% 0, 100% 0, 90% 100%, 0% 100%);
                }
            `}</style>
        </div>
    );
};
