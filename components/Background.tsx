import React from 'react';
import { useAppStore } from '../store';
import { AppState, PersonalityMode } from '../content/types';
import { ElectricOverlay } from './ElectricOverlay';

export const Background: React.FC = () => {
    const { appState, personality } = useAppStore();
    const isOverclocked = appState === AppState.OVERCLOCKED;
    const isExtrovert = personality === PersonalityMode.EXTROVERT;

    // Use absolute paths with leading slash
    const circuitImg = isExtrovert ? '/asset/gold_circuit.svg' : '/asset/cyan_circuit.svg';
    const color = isExtrovert ? '#FFBF00' : '#00FFFF';

    return (
        <>
            <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#050505]">
                {/* The Grid Floor */}
                <div className={`absolute inset-0 perspective-grid transition-opacity duration-[2000ms] z-0 ${isOverclocked ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="absolute inset-0 perspective-grid-inner w-full h-[200%] -top-[50%]">
                        {/* PCB Circuit Pattern via Masking */}
                        <div 
                            className="w-full h-full"
                            style={{
                                backgroundColor: color,
                                maskImage: `url(${circuitImg})`,
                                WebkitMaskImage: `url(${circuitImg})`,
                                maskSize: '800px 1331px', 
                                WebkitMaskSize: '800px 1331px',
                                maskRepeat: 'repeat',
                                WebkitMaskRepeat: 'repeat',
                                maskPosition: 'center 0',
                                WebkitMaskPosition: 'center 0',
                                animation: `scrolling-grid ${isOverclocked ? '20s' : '60s'} linear infinite`
                            }}
                        />
                    </div>
                </div>

                {/* Fog / Gradient */}
                <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-b from-[#050505]/90 via-transparent to-[#050505]/90" />

                {/* Bloom Overlay */}
                <div className={`absolute inset-0 bg-radial-gradient from-transparent to-[#050505] z-2 transition-all duration-1000 pointer-events-none ${isOverclocked ? 'opacity-0' : 'opacity-60'}`} />
                
                {/* CRT Scanlines Overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none crt-overlay opacity-20"></div>

                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)] z-3 pointer-events-none" />

                <style>{`
                    @keyframes scrolling-grid {
                        0% { 
                            -webkit-mask-position: center 0; 
                            mask-position: center 0; 
                        }
                        100% { 
                            -webkit-mask-position: center 1331px; 
                            mask-position: center 1331px; 
                        }
                    }
                `}</style>
            </div>
            
            {/* The Mouse-Reactive Electric Overlay */}
            <ElectricOverlay />
        </>
    );
};