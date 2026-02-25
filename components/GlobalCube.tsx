
import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../store';
import { AppState, Artifact } from '../content/types';
import { CubeProjection } from './artifacts/CubeProjection';

export const GlobalCube: React.FC = () => {
    const { appState, setAppState } = useAppStore();
    const isOverclocked = appState === AppState.OVERCLOCKED;
    const location = useLocation();
    const isHome = location.pathname === '/';
    const isArtifacts = location.pathname === '/artifacts';
    const isLogs = location.pathname.startsWith('/logs');
    const isAbout = location.pathname === '/about';

    // ── Scroll Elevator (Logs page) ──
    // smoothScrollRef: 0→1, lerped each rAF frame, written directly to DOM (no React state!)
    // This avoids the transition-interruption bug where setSmoothScrollRatio re-renders
    // reset the CSS transition on the same element every 16ms.
    const rawScrollRatioRef = useRef(0);
    const smoothScrollRef = useRef(0);

    // Unified wrapper for page-transitions and elevator scrolling
    const cubeWrapperRef = useRef<HTMLDivElement>(null);
    // Depth HUD ref for Mag-Lev system
    const depthHudRef = useRef<HTMLDivElement>(null);

    // Toggle transitions to avoid fighting rAF while scrolling
    const [isTransitioningPage, setIsTransitioningPage] = useState(false);
    React.useLayoutEffect(() => {
        setIsTransitioningPage(true);
        const timer = setTimeout(() => setIsTransitioningPage(false), 900);
        return () => clearTimeout(timer);
    }, [location.pathname, isOverclocked]);

    const isActivated = isOverclocked || isArtifacts || isLogs || isAbout; // Cube glows on Logs too
    const [showContent, setShowContent] = useState(false);
    const [projectedArtifact, setProjectedArtifact] = useState<Artifact | null>(null);
    const prevArtifactIdRef = useRef<string | null>(null);
    const [isCubeDragging, setIsCubeDragging] = useState(false);


    // Rotation State - Drives the visual render
    const [rotation, setRotation] = useState({ x: -20, y: 45 });

    // Interaction Refs
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const lastMousePosRef = useRef({ x: 0, y: 0 });
    const lastDragTimeRef = useRef(0); // To detect stops before release
    const isClickRef = useRef(true);

    // Physics Engine Refs
    const requestRef = useRef<number>(0);
    const mousePosRef = useRef({ x: 0, y: 0 });

    // Core Physics State
    const accumulatedYRef = useRef(45);
    const restingXRef = useRef(-20);

    // Dynamics
    const velocityRef = useRef({ x: 0, y: 0 });
    const spinSpeedRef = useRef(0.05); // Current auto-spin speed
    const currentRotationRef = useRef({ x: -20, y: 45 }); // For smoothing
    const isOverclockedRef = useRef(isOverclocked); // Sync for event dispatch
    const isArtifactsRef = useRef(isArtifacts); // Sync for animation loop

    // Constants
    const CUBE_SIZE = '14rem';
    const HALF_SIZE = '7rem';

    const lerp = (start: number, end: number, factor: number) => {
        return start + (end - start) * factor;
    };

    // --- Content Reveal ---
    useEffect(() => {
        if (isOverclocked) {
            const timer = setTimeout(() => setShowContent(true), 800);
            return () => clearTimeout(timer);
        } else {
            setShowContent(false);
        }
    }, [isOverclocked]);

    // Sync isOverclocked to ref for use in animation loop closures
    useEffect(() => {
        isOverclockedRef.current = isOverclocked;
    }, [isOverclocked]);

    useEffect(() => {
        isArtifactsRef.current = isArtifacts;
    }, [isArtifacts]);

    const isLogsRef = useRef(isLogs);
    useEffect(() => {
        isLogsRef.current = isLogs;
    }, [isLogs]);

    const isAboutRef = useRef(isAbout);
    useEffect(() => {
        isAboutRef.current = isAbout;
    }, [isAbout]);

    // --- Scroll-synced spin speed + elevator ratio on Logs page ---
    useEffect(() => {
        if (!isLogs) {
            // Reset when leaving Logs
            rawScrollRatioRef.current = 0;
            return;
        }
        let lastScrollY = window.scrollY;
        let scrollTimeout: ReturnType<typeof setTimeout>;
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
            rawScrollRatioRef.current = Math.min(scrollTop / maxScroll, 1);

            const delta = scrollTop - lastScrollY;
            lastScrollY = scrollTop;
            spinSpeedRef.current = 0.04 + Math.abs(delta) * 0.015;
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                spinSpeedRef.current = 0.04;
            }, 300);
        };
        // Also compute on mount in case page is already scrolled
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [isLogs]);

    // --- Fixed display angle when entering Artifacts page ---
    const ARTIFACTS_DISPLAY_X = -20;
    // --- Fixed overhead angle when on Logs page (elevator perspective) ---
    const LOGS_DISPLAY_X = -28;
    useEffect(() => {
        if (isArtifacts) {
            restingXRef.current = ARTIFACTS_DISPLAY_X;
            velocityRef.current.x = 0;
        } else if (isLogs) {
            restingXRef.current = LOGS_DISPLAY_X;
            velocityRef.current.x = 0;
        } else if (isAbout) {
            velocityRef.current.x = 0;
            velocityRef.current.y = 0;
            spinSpeedRef.current = 1.0;
        }
    }, [isArtifacts, isLogs, isAbout]);

    const lastScrollYRef = useRef(0);
    const particleStateRef = useRef(Array.from({ length: 150 }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, size: 0 })));
    const lastEmitYRef = useRef(0);

    // --- Mouse Position Tracker ---
    useEffect(() => {
        const handleWindowMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            mousePosRef.current = { x, y };
        };
        window.addEventListener('mousemove', handleWindowMouseMove);
        return () => window.removeEventListener('mousemove', handleWindowMouseMove);
    }, []);

    // --- Unified Physics Loop ---
    useEffect(() => {
        const animate = () => {
            // ── Unified Transform (solves the parabola trajectory bug) ──
            // By applying X, Y, and Scale inside a single transform string, CSS interpolates
            // them cleanly as linear trajectories without them multiplying together.
            smoothScrollRef.current = lerp(smoothScrollRef.current, rawScrollRatioRef.current, 0.06);

            const vh = window.innerHeight;
            const vw = window.innerWidth;

            let targetX = 0;
            let targetY = 0;
            let targetScale = 1;

            if (isLogsRef.current) {
                targetX = 420;
                targetScale = 0.15;
                const trackTop = 96;
                const trackHeight = vh - 210; // Leave some space at the bottom
                const absoluteY = trackTop + smoothScrollRef.current * trackHeight;
                // No division by scale required since X, Y, and Scale share standard order string
                targetY = absoluteY - (vh / 2);

                // Update Depth HUD text and Holographic Trail
                if (depthHudRef.current) {
                    const pct = (smoothScrollRef.current * 100).toFixed(1);
                    const formattedPct = pct.padStart(4, '0');
                    depthHudRef.current.textContent = `${formattedPct}%`;
                    // HUD floats perfectly ABOVE the cube, moving linearly in 2D
                    depthHudRef.current.style.transform = `translate(-50%, calc(${absoluteY}px - 10px))`;
                }

                // Update proximity glow & fluid particle system
                const grooveEl = document.querySelector('.maglev-groove') as HTMLElement | null;
                const particles = document.querySelectorAll('.maglev-p') as NodeListOf<HTMLElement>;

                if (grooveEl) {
                    grooveEl.style.setProperty('--cube-y', `${absoluteY}px`);
                }

                if (particles.length > 0) {
                    const currentY = absoluteY;
                    const dy = currentY - lastScrollYRef.current;
                    lastScrollYRef.current = currentY;

                    const pState = particleStateRef.current;
                    const distance = Math.abs(currentY - lastEmitYRef.current);
                    const direction = Math.sign(dy) || 1;

                    // Emit particles simply based on distance traveled!
                    // This guarantees a perfectly contiguous fluid trail no matter the speed.
                    const spawnCount = Math.floor(distance / 5); // 1 particle every 5px of scrolling

                    if (spawnCount > 0) {
                        for (let s = 0; s < Math.min(spawnCount, 30); s++) { // Increased cap to prevent gaps on fast scroll
                            const p = pState.find(p => p.life <= 0);
                            if (p) {
                                p.life = 1.2; // slight overcharge for longer trail
                                p.x = 0; // Center of groove
                                // Interpolate spawn Y so they space out perfectly instead of clumping
                                p.y = lastEmitYRef.current + (s * 5) * direction;

                                // Velocity: Some lateral scatter, and slight trail momentum backwards
                                p.vx = (Math.random() - 0.5) * 2;
                                p.vy = -direction * (0.2 + Math.random() * 0.8);
                                p.size = 2.5 + Math.random() * 2.5;
                            }
                        }
                        lastEmitYRef.current = currentY;
                    }

                    // Simulate particles
                    for (let i = 0; i < pState.length; i++) {
                        const p = pState[i];
                        const el = particles[i];
                        if (p.life > 0) {
                            const age = 1.2 - p.life; // 0 to 1.2
                            p.x += p.vx * (1 + age * 0.8); // Diffuse outward as it ages
                            p.y += p.vy;

                            p.vy *= 0.92; // Friction
                            p.vx *= 0.95;

                            p.life -= 0.02; // Lifespan decays by 0.02 per frame (~1 sec total)

                            const currentSize = Math.max(0, p.size * (p.life / 1.2));
                            const stretch = 1 + Math.abs(p.vy) * 0.4;

                            // +2 centers it in the 4px groove
                            el.style.transform = `translate(${p.x - currentSize / 2 + 2}px, ${p.y - currentSize / 2}px) scaleY(${stretch})`;
                            el.style.opacity = Math.min(1, p.life).toFixed(2);
                            el.style.width = `${currentSize}px`;
                            el.style.height = `${currentSize}px`;
                        } else if (el.style.opacity !== '0') {
                            el.style.opacity = '0';
                            el.style.transform = `translate(0, -9999px)`;
                        }
                    }
                }

            } else if (isArtifactsRef.current) {
                targetX = vw * -0.12; // -12vw
                targetY = vh * 0.1;   // 10vh
                targetScale = 0.8;
            } else if (isAboutRef.current) {
                // Hide the cube entirely on the About page
                targetX = 0;
                targetY = 0;
                targetScale = 0; // Scale to 0 to vanish
            } else if (isOverclockedRef.current) {
                targetX = 0;
                targetY = 128; // 8rem1
                targetScale = 0.9;
            } else {
                targetX = 0;
                targetY = 0;
                targetScale = 1;
            }

            if (cubeWrapperRef.current) {
                cubeWrapperRef.current.style.transform = `translateX(${targetX}px) translateY(${targetY}px) scale(${targetScale})`;
            }

            if (isDraggingRef.current) {
                const targetVisualX = restingXRef.current + (mousePosRef.current.y * -15);
                const targetVisualY = accumulatedYRef.current + (mousePosRef.current.x * 15);
                currentRotationRef.current = { x: targetVisualX, y: targetVisualY };
                setRotation({ x: currentRotationRef.current.x, y: currentRotationRef.current.y });

                window.dispatchEvent(new CustomEvent('circuit-rotation-update', {
                    detail: { rotation: currentRotationRef.current, isOverclocked: isOverclockedRef.current }
                }));
            }
            else {
                velocityRef.current.x *= 0.9;
                restingXRef.current += velocityRef.current.x;

                if (isArtifactsRef.current) {
                    restingXRef.current = lerp(restingXRef.current, -20, 0.08);
                } else if (isLogsRef.current) {
                    // On Logs: spring pitch to overhead angle, no mouse X/Y influence
                    restingXRef.current = lerp(restingXRef.current, -28, 0.06);
                } else if (isAboutRef.current) {
                    // Simple idle spin on the About page
                    spinSpeedRef.current = lerp(spinSpeedRef.current, 0.4, 0.05);

                    // 3D LOOK-AT TILTING: Slightly tilt towards the mouse position
                    const lookAtPitch = mousePosRef.current.y * -30; // Look up/down
                    restingXRef.current = lerp(restingXRef.current, lookAtPitch, 0.08);
                }

                // Normal spin applies only if not on About page (as spinSpeed approaches 0 rapidly)
                if (!isAboutRef.current) {
                    const targetSpeed = 0.04 * (Math.sign(spinSpeedRef.current) || 1);
                    spinSpeedRef.current = lerp(spinSpeedRef.current, targetSpeed, 0.02);
                }

                accumulatedYRef.current += spinSpeedRef.current;

                // On Logs & About: no mouse-look offset (locked perspective)
                const mouseInfluenceX = (isLogsRef.current || isAboutRef.current) ? 0 : mousePosRef.current.y * -15;
                const mouseInfluenceY = (isLogsRef.current || isAboutRef.current) ? 0 : mousePosRef.current.x * 15;
                const targetVisualX = restingXRef.current + mouseInfluenceX;
                const targetVisualY = accumulatedYRef.current + mouseInfluenceY;

                currentRotationRef.current.x = lerp(currentRotationRef.current.x, targetVisualX, 0.1);
                currentRotationRef.current.y = lerp(currentRotationRef.current.y, targetVisualY, 0.1);

                setRotation({ x: currentRotationRef.current.x, y: currentRotationRef.current.y });

                window.dispatchEvent(new CustomEvent('circuit-rotation-update', {
                    detail: { rotation: currentRotationRef.current, isOverclocked: isOverclockedRef.current }
                }));
            }
            requestRef.current = requestAnimationFrame(animate);
        };
        requestRef.current = requestAnimationFrame(animate);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, []);

    // --- Drag Interaction ---
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isHome && !isArtifacts) return; // Logs page: no drag interaction
        isDraggingRef.current = true;
        if (isArtifacts) setIsCubeDragging(true);
        isClickRef.current = true;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        lastDragTimeRef.current = Date.now();
        velocityRef.current = { x: 0, y: 0 };
        spinSpeedRef.current = 0;
    };

    useEffect(() => {
        const handleWindowDragMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return;
            const now = Date.now();
            const deltaX = e.clientX - dragStartRef.current.x;
            const deltaY = e.clientY - dragStartRef.current.y;
            const vx = (e.clientY - lastMousePosRef.current.y) * -0.3;
            const vy = (e.clientX - lastMousePosRef.current.x) * 0.3;
            velocityRef.current = { x: vx, y: vy };
            lastMousePosRef.current = { x: e.clientX, y: e.clientY };
            lastDragTimeRef.current = now;
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) isClickRef.current = false;
            restingXRef.current += velocityRef.current.x;
            accumulatedYRef.current += velocityRef.current.y;
        };
        const handleWindowDragUp = () => {
            if (isDraggingRef.current) {
                isDraggingRef.current = false;
                if (isArtifactsRef.current) {
                    // On Artifacts: preserve spin direction from drag, kill pitch momentum
                    velocityRef.current.x = 0;
                    spinSpeedRef.current = velocityRef.current.y || spinSpeedRef.current;
                    setIsCubeDragging(false);
                } else {
                    // On Home: preserve momentum
                    if (Date.now() - lastDragTimeRef.current > 50) velocityRef.current = { x: 0, y: 0 };
                    spinSpeedRef.current = velocityRef.current.y;
                }
            }
        };
        window.addEventListener('mousemove', handleWindowDragMove);
        window.addEventListener('mouseup', handleWindowDragUp);
        return () => {
            window.removeEventListener('mousemove', handleWindowDragMove);
            window.removeEventListener('mouseup', handleWindowDragUp);
        };
    }, []);

    const handleCoreClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isClickRef.current && isHome) setAppState(isOverclocked ? AppState.IDLE : AppState.OVERCLOCKED);
    };

    // Listen for artifact selection from Carousel (sync cube+projection)
    useEffect(() => {
        const handleArtifactSelect = (e: any) => {
            const artifact = e.detail as Artifact;
            if (!artifact || artifact.id === prevArtifactIdRef.current) return;
            prevArtifactIdRef.current = artifact.id;
            setProjectedArtifact(artifact);
        };
        window.addEventListener('artifact-select', handleArtifactSelect);
        return () => window.removeEventListener('artifact-select', handleArtifactSelect);
    }, []);

    return (
        <div
            className={`fixed inset-0 z-0 flex items-center justify-center pointer-events-none ${(isHome || isArtifacts || isLogs) ? 'pointer-events-auto' : ''}`}
        >
            {/* ═══ MAG-LEV GHOST GROOVE (Logs only) ═══ */}
            <div className={`maglev-groove ${isLogs ? 'maglev-groove--visible' : ''}`}>
                <div className="maglev-flow" />
                {Array.from({ length: 150 }).map((_, i) => (
                    <div key={`p-${i}`} className="maglev-p" style={{ transform: 'translate(0, -9999px)' }} />
                ))}
                {/* Holographic Tether and HUD Projection (Detached from 3D Rotation) */}
                <div className="maglev-hud-container" ref={depthHudRef}>
                    000.0%
                </div>
            </div>

            <div className={`relative z-10 w-full h-screen flex flex-col items-center justify-center perspective-container ${isDraggingRef.current ? 'cursor-grabbing' : (isHome || isArtifacts) ? 'cursor-grab' : ''} ${(isHome || isArtifacts) ? 'pointer-events-auto' : 'pointer-events-none'}`} onMouseDown={handleMouseDown}
                style={{ overflow: 'visible' }}
            >
                <style>{`
                    .perspective-container {
                        perspective: 1000px;
                        perspective-origin: ${isArtifacts ? 'calc(50% - 12vw) 50%'
                        : isLogs ? 'calc(50% + 12vw) 50%'
                            : '50% 50%'
                    };
                        transition: perspective-origin 0.9s cubic-bezier(0.23,1,0.32,1);
                    }
                    .preserve-3d { transform-style: preserve-3d; }
                    @keyframes scanline-up {
                        0% { transform: translateY(100%); }
                        100% { transform: translateY(-100%); }
                    }
                    @keyframes emitter-pulse {
                        0%, 100% { opacity: 0.8; transform: scaleX(1); }
                        50% { opacity: 1; transform: scaleX(1.3); }
                    }
                    .premium-glass {
                        background: rgba(20, 25, 35, 0.05);
                        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 0 0 2px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(0, 255, 255, 0.05);
                        background-image: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 20%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%);
                    }
                    .premium-glass-active {
                        background: rgba(0, 255, 255, 0.02);
                        box-shadow: inset 0 0 0 1px rgba(0, 255, 255, 0.4), inset 0 0 30px rgba(0, 255, 255, 0.1);
                        background-image: linear-gradient(135deg, rgba(0,255,255,0.2) 0%, transparent 50%);
                    }
                    .premium-glass-logs {
                        background: rgba(0, 255, 255, 0.05);
                        box-shadow: inset 0 0 0 2px rgba(0, 255, 255, 0.1), inset 0 0 60px rgba(0, 255, 255, 0.6);
                        background-image: linear-gradient(135deg, rgba(0,255,255,0.2) 0%, transparent 60%);
                    }
                    /* ═══ MAG-LEV LIGHT TRACK ═══ */
                    /* The Energy Pillar */
                    .maglev-groove {
                        position: fixed;
                        /* Perfectly align with the Cube at exactly +420px */
                        left: calc(50% + 420px);
                        top: 0px; 
                        bottom: 0px;
                        width: 2px;
                        pointer-events: none;
                        z-index: 0;
                        background: rgba(255, 255, 255, 0.04);
                        opacity: 0;
                        transition: opacity 0.8s ease;
                    }
                    .maglev-groove--visible {
                        opacity: 1;
                    }
                    
                    /* Flowing Energy inside the pillar */
                    .maglev-flow {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 120px;
                        background: linear-gradient(to bottom, transparent, rgba(0, 255, 255, 0.6), transparent);
                        opacity: 0.6;
                        animation: maglevDataFlow 3s ease-in-out infinite;
                    }
                    @keyframes maglevDataFlow {
                        0% { transform: translateY(-120px); opacity: 0; }
                        30% { opacity: 0.8; }
                        70% { opacity: 0.8; }
                        100% { transform: translateY(100vh); opacity: 0; }
                    }
                    
                    /* Fluid DOM Particles */
                    .maglev-p {
                        position: absolute;
                        border-radius: 50%;
                        background: #00ffff;
                        box-shadow: 0 0 8px #00ffff;
                        pointer-events: none;
                        will-change: transform, opacity, width, height;
                        z-index: 5;
                        top: 0;
                        left: 0;
                    }

                    /* Holographic Projection HUD */
                    .maglev-hud-container {
                        position: absolute;
                        top: 0;
                        left: calc(50% + 50px); /* Slightly nudged right */
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 11px;
                        font-weight: 700;
                        color: rgba(0, 255, 255, 0.9);
                        text-shadow: 0 0 8px rgba(0, 255, 255, 0.6), 0 0 2px rgba(255, 255, 255, 0.4);
                        letter-spacing: 0.1em;
                        white-space: nowrap;
                        pointer-events: none;
                        will-change: transform, opacity;
                        opacity: 0; /* Hidden by default */
                        transition: opacity 0.4s ease;
                    }
                    
                    .maglev-groove--visible .maglev-hud-container {
                        opacity: 1;
                        transition-delay: 0.9s; /* Wait 0.9s for Cube to slide into Logs position */
                    }
                    
                    /* Scanner triangle pointing left */
                    .maglev-hud-container::before {
                        content: '';
                        position: absolute;
                        top: 50%;
                        right: -8px; /* Tucked closer to the text */
                        width: 0;
                        height: 0;
                        border-top: 4px solid transparent;
                        border-bottom: 4px solid transparent;
                        border-right: 6px solid #00ffff;
                        background: transparent;
                        filter: drop-shadow(0 0 4px cyan);
                        transform: translateY(-50%);
                    }

                    @media (max-width: 640px) {
                        .maglev-groove { display: none; }
                    }
                `}</style>

                {/*
                  UNIFIED CSS MATRIX TRANSFORM ARCHITECTURE (fixes parabola trajectory bug):
                  Translation + Scale merged onto a single element. CSS inherently interpolates 
                  them cleanly in a straight line instead of multiplying them.
                  We toggle 'transition-all' on mount/unmount to get initial fly-in,
                  but strip it away during steady state so rAF scrolling has 0ms latency.
                */}
                <div
                    ref={cubeWrapperRef}
                    className={`relative ${isTransitioningPage ? 'transition-all duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)]' : ''}`}
                    style={{
                        opacity: 1, // Restored full brightness on all pages including Logs
                        width: CUBE_SIZE,
                        height: CUBE_SIZE,
                        flexShrink: 0,
                    }}
                >
                    <div className="w-full h-full">

                        {/* DATA-ATTRIBUTES SYNC */}
                        <div
                            data-circuit-target={isHome ? "core-center" : ""}
                            data-rot-x={rotation.x}
                            data-rot-y={rotation.y}
                            data-overclock={isOverclocked ? 1 : 0}
                            className="relative preserve-3d w-full h-full"
                        >
                            <div onClick={handleCoreClick} className="w-full h-full preserve-3d" style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}>

                                {/* 1. HOLOGRAPHIC PROJECTION */}
                                <div className={`absolute bottom-[50%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] pointer-events-none transition-all duration-[600ms] ease-out origin-bottom flex flex-col justify-center items-center pb-24 ${(showContent && isHome) ? 'opacity-100 scale-100' : 'opacity-0 scale-y-0'}`}
                                    style={{ transform: 'translateX(-50%) translateY(-7rem) translateZ(0px)' }}>

                                    {/* EMITTER EFFECT */}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-12 flex flex-col items-center justify-end z-20">
                                        <div className="w-20 h-[4px] bg-white rounded-full shadow-[0_0_15px_#fff,0_0_30px_cyan] animate-[emitter-pulse_1.5s_ease-in-out_infinite]" />
                                        <div className="absolute bottom-[-4px] w-8 h-8 bg-cyan-400 blur-lg opacity-80" />
                                    </div>

                                    {/* Light beam */}
                                    <div className="absolute inset-0 z-0 bg-gradient-to-t from-cyan-400/50 via-cyan-500/10 to-transparent"
                                        style={{
                                            clipPath: 'polygon(15% 0, 85% 0, 51.5% 100%, 48.5% 100%)',
                                            WebkitClipPath: 'polygon(15% 0, 85% 0, 51.5% 100%, 48.5% 100%)',
                                            maskImage: 'linear-gradient(to top, black 0%, black 25%, rgba(0,0,0,0.4) 45%, transparent 85%)',
                                            WebkitMaskImage: 'linear-gradient(to top, black 0%, black 25%, rgba(0,0,0,0.4) 45% , transparent 85%)'
                                        }}
                                    >
                                        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(transparent_4px,rgba(0,255,255,0.4)_5px,transparent_6px)] bg-[size:100%_8px] opacity-30 animate-[scanline-up_0.3s_linear_infinite]" />
                                    </div>

                                    {/* Text position */}
                                    {isHome && (
                                        <div className="relative z-10 translate-y-[90px]">
                                            <h1 className={`text-7xl font-bold text-white tracking-[0.1em] leading-[1.1] text-center chaos-text ${showContent ? 'opacity-100' : 'opacity-0'} drop-shadow-[0_0_20px_rgba(0,255,255,0.9)] ml-[0.1em]`}>
                                                PETER.BLOG
                                                <br />
                                                <span className="text-3xl text-cyan-400 tracking-[0.3em] ml-[0.3em]">ONLINE</span>
                                            </h1>
                                        </div>
                                    )}
                                </div>

                                {/* 2. THE INNER CORE */}
                                <div className="absolute inset-0 m-auto w-24 h-24 preserve-3d" style={{ transform: 'translateZ(0px)' }}>
                                    {[
                                        { t: 'translateZ(3rem)', c: 'bg-[#080808]' }, { t: 'rotateY(180deg) translateZ(3rem)', c: 'bg-[#080808]' },
                                        { t: 'rotateY(90deg) translateZ(3rem)', c: 'bg-[#050505]' }, { t: 'rotateY(-90deg) translateZ(3rem)', c: 'bg-[#050505]' },
                                        { t: 'rotateX(90deg) translateZ(3rem)', c: 'bg-[#0a0a0a]' }, { t: 'rotateX(-90deg) translateZ(3rem)', c: 'bg-[#0a0a0a]' }
                                    ].map((face, i) => (
                                        <div key={i} className={`absolute inset-0 border border-gray-800/60 ${face.c} flex items-center justify-center`} style={{ transform: face.t }}>
                                            {(i === 0 || i === 1) && (
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-8 h-1 rounded-sm mb-2 transition-all duration-[1500ms] ${isActivated ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-gray-600'}`}></div>
                                                    <span className={`font-mono text-[8px] tracking-[0.2em] transition-all duration-[1500ms] ${isActivated ? 'text-cyan-200' : 'text-gray-500'}`}>PETER.BLOG</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div className={`absolute inset-0 bg-cyan-400 blur-2xl transition-all duration-[1500ms] ${isLogs ? 'opacity-40 scale-125' : isActivated ? 'opacity-30' : 'opacity-0'}`} />
                                </div>

                                {/* 3. THE PREMIUM CRYSTAL GLASS FACES */}
                                {[
                                    { name: 'front', transform: `translateZ(${HALF_SIZE})` }, { name: 'back', transform: `rotateY(180deg) translateZ(${HALF_SIZE})` },
                                    { name: 'right', transform: `rotateY(90deg) translateZ(${HALF_SIZE})` }, { name: 'left', transform: `rotateY(-90deg) translateZ(${HALF_SIZE})` },
                                    { name: 'top', transform: `rotateX(90deg) translateZ(${HALF_SIZE})` }, { name: 'bottom', transform: `rotateX(-90deg) translateZ(${HALF_SIZE})` }
                                ].map((face) => (
                                    <div key={face.name} className={`absolute inset-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${isLogs ? 'premium-glass-logs' : isActivated ? 'premium-glass-active' : 'premium-glass group'}`} style={{ transform: face.transform, backfaceVisibility: 'visible' }} />
                                ))}

                                {/* 4. CYBERPUNK HOLOGRAPHIC PROJECTION (bound to cube rotation) */}
                                {isArtifacts && (
                                    <CubeProjection artifact={projectedArtifact} isDragging={isCubeDragging} />
                                )}
                            </div>

                        </div>{/* end data-attributes */}
                    </div>{/* end elevatorInner */}
                </div>{/* end outer page-switch */}
            </div>
        </div>
    );
};
