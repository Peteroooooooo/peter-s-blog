import React, { useEffect, useState, useRef } from 'react';
import { Artifact } from '../../content/types';

interface CubeProjectionProps {
    artifact: Artifact | null;
    isDragging?: boolean;
}

type GlitchPhase = 'idle' | 'burst' | 'lost' | 'reconnect';

/**
 * Cyberpunk holographic projection from cube top-face center.
 * Glitch transition: burst → signal-loss → reconnect
 */
export const CubeProjection: React.FC<CubeProjectionProps> = ({ artifact, isDragging = false }) => {
    const [displayArtifact, setDisplayArtifact] = useState<Artifact | null>(artifact);
    const [phase, setPhase] = useState<GlitchPhase>('idle');
    const [isVisible, setIsVisible] = useState(false);
    const prevIdRef = useRef<string | null>(null);
    const isFirstRef = useRef(true);

    // Smooth fade-in on mount
    useEffect(() => {
        const t = setTimeout(() => setIsVisible(true), 400);
        return () => clearTimeout(t);
    }, []);

    // Drag signal-loss: burst → lost while dragging, reconnect on release
    const wasDraggingRef = useRef(false);
    useEffect(() => {
        if (isDragging && !wasDraggingRef.current) {
            // Drag started: quick burst then lost
            wasDraggingRef.current = true;
            setPhase('burst');
            const lostTimer = setTimeout(() => setPhase('lost'), 120);
            return () => clearTimeout(lostTimer);
        }
        if (!isDragging && wasDraggingRef.current) {
            // Drag ended: reconnect
            wasDraggingRef.current = false;
            setPhase('reconnect');
            const idleTimer = setTimeout(() => setPhase('idle'), 500);
            return () => clearTimeout(idleTimer);
        }
    }, [isDragging]);

    // Glitch transition on artifact change
    useEffect(() => {
        if (!artifact) {
            setDisplayArtifact(artifact);
            return;
        }
        if (prevIdRef.current === artifact.id) return;
        prevIdRef.current = artifact.id;

        // First artifact: show immediately
        if (isFirstRef.current) {
            isFirstRef.current = false;
            setDisplayArtifact(artifact);
            return;
        }

        // Phase 1: BURST — intense glitch on old content
        setPhase('burst');

        // Phase 2: LOST — signal blackout, swap content
        const lostTimer = setTimeout(() => {
            setPhase('lost');
            setDisplayArtifact(artifact); // swap during blackout
        }, 150);

        // Phase 3: RECONNECT — new content fades in with scan sweep
        const reconnectTimer = setTimeout(() => {
            setPhase('reconnect');
        }, 400);

        // Phase 4: IDLE — stable
        const idleTimer = setTimeout(() => {
            setPhase('idle');
        }, 900);

        return () => {
            clearTimeout(lostTimer);
            clearTimeout(reconnectTimer);
            clearTimeout(idleTimer);
        };
    }, [artifact]);

    if (!displayArtifact) return null;

    return (
        <div className={`holo-proj ${isVisible ? 'holo-proj--visible' : ''} holo-proj--${phase}`}>

            {/* === EMITTER NODE === */}
            <div className="holo-proj__emitter">
                <div className="holo-proj__emitter-core" />
                <div className="holo-proj__emitter-ring" />
                <div className="holo-proj__emitter-glow" />
            </div>

            {/* === BEAM CONE === */}
            <div className="holo-proj__beam">
                <div className="holo-proj__beam-fill" />
                <div className="holo-proj__beam-edge holo-proj__beam-edge--l" />
                <div className="holo-proj__beam-edge holo-proj__beam-edge--r" />
                <div className="holo-proj__beam-scanlines" />
            </div>

            {/* === HOLOGRAPHIC CONTENT === */}
            <div className="holo-proj__content">
                {/* Top HUD line */}
                <div className="holo-proj__hud-line">
                    <span className="holo-proj__hud-bracket">[</span>
                    <span className="holo-proj__hud-id">{displayArtifact.id}</span>
                    <span className="holo-proj__hud-separator">::</span>
                    <span className="holo-proj__hud-status">LOADED</span>
                    <span className="holo-proj__hud-dot">●</span>
                    <span className="holo-proj__hud-bracket">]</span>
                </div>

                {/* Title */}
                <h2 className="holo-proj__title" data-text={displayArtifact.title}>
                    {displayArtifact.title}
                </h2>

                {/* Date */}
                <div className="holo-proj__date">
                    <span className="holo-proj__date-prefix">▹</span>
                    {displayArtifact.date}
                    <span className="holo-proj__cursor">█</span>
                </div>

                {/* Tech stack */}
                <div className="holo-proj__tags">
                    {displayArtifact.techStack.slice(0, 4).map((tech, i) => (
                        <React.Fragment key={tech}>
                            {i > 0 && <span className="holo-proj__tag-sep">/</span>}
                            <span className="holo-proj__tag">{tech}</span>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* === SIGNAL LOST INDICATOR (shown during blackout) === */}
            <div className="holo-proj__signal-lost">
                <span>SIGNAL_LOST</span>
            </div>

            {/* === RECONNECT SCAN SWEEP === */}
            <div className="holo-proj__scan-sweep" />

            {/* === CORRUPTION OVERLAYS === */}
            <div className="holo-proj__corrupt holo-proj__corrupt--r" />
            <div className="holo-proj__corrupt holo-proj__corrupt--c" />

            <style>{`
                /* ====== ROOT ====== */
                .holo-proj {
                    position: absolute;
                    bottom: calc(100% - 8px);
                    left: 50%;
                    transform: translateX(-50%);
                    width: 300px;
                    display: flex;
                    flex-direction: column-reverse;
                    align-items: center;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.8s ease;
                }
                .holo-proj--visible { opacity: 1; }

                /* ====== EMITTER NODE ====== */
                .holo-proj__emitter {
                    position: relative;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .holo-proj__emitter-core {
                    width: 5px;
                    height: 5px;
                    background: #fff;
                    border-radius: 50%;
                    box-shadow: 0 0 4px 1px #fff, 0 0 12px 3px rgba(0,255,255,0.8);
                    z-index: 2;
                    transition: box-shadow 0.15s, background 0.15s;
                }
                .holo-proj__emitter-ring {
                    position: absolute;
                    width: 16px;
                    height: 16px;
                    border: 1px solid rgba(0,255,255,0.3);
                    border-radius: 50%;
                    animation: ring-breathe 3s ease-in-out infinite;
                }
                .holo-proj__emitter-glow {
                    position: absolute;
                    width: 30px;
                    height: 30px;
                    background: radial-gradient(circle, rgba(0,255,255,0.2) 0%, transparent 70%);
                }

                @keyframes ring-breathe {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.3); opacity: 0.1; }
                }

                /* ====== BEAM CONE ====== */
                .holo-proj__beam {
                    position: relative;
                    width: 100%;
                    height: 90px;
                    flex-shrink: 0;
                    overflow: hidden;
                    transition: opacity 0.1s;
                }
                .holo-proj__beam-fill {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        to top,
                        rgba(0,255,255,0.18) 0%,
                        rgba(0,255,255,0.06) 50%,
                        transparent 100%
                    );
                    clip-path: polygon(28% 0%, 72% 0%, 52% 100%, 48% 100%);
                    mask-image: linear-gradient(to top, black, transparent 92%);
                    -webkit-mask-image: linear-gradient(to top, black, transparent 92%);
                }
                .holo-proj__beam-edge {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 1px;
                    background: linear-gradient(to top, rgba(0,255,255,0.4), transparent 75%);
                }
                .holo-proj__beam-edge--l { left: 48%; transform: rotate(-5deg); transform-origin: bottom center; }
                .holo-proj__beam-edge--r { right: 48%; transform: rotate(5deg); transform-origin: bottom center; }
                .holo-proj__beam-scanlines {
                    position: absolute;
                    inset: 0;
                    background: repeating-linear-gradient(
                        to top,
                        transparent 0px, transparent 3px,
                        rgba(0,255,255,0.10) 3px, rgba(0,255,255,0.10) 4px
                    );
                    clip-path: polygon(28% 0%, 72% 0%, 52% 100%, 48% 100%);
                    animation: scan-drift 2s linear infinite;
                }

                @keyframes scan-drift {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-4px); }
                }

                /* ====== CONTENT PANEL ====== */
                .holo-proj__content {
                    position: relative;
                    padding: 12px 16px 8px;
                    text-align: center;
                    background: radial-gradient(ellipse at center, rgba(0,20,30,0.4) 0%, transparent 70%);
                    transition: opacity 0.08s, transform 0.08s;
                }

                /* HUD line */
                .holo-proj__hud-line {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 9px;
                    color: rgba(0,255,255,0.35);
                    letter-spacing: 0.12em;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 3px;
                }
                .holo-proj__hud-bracket { color: rgba(0,255,255,0.25); }
                .holo-proj__hud-id { color: rgba(255,255,255,0.5); }
                .holo-proj__hud-separator { color: rgba(0,255,255,0.2); }
                .holo-proj__hud-status { color: rgba(0,255,100,0.5); }
                .holo-proj__hud-dot {
                    color: rgba(0,255,100,0.6);
                    font-size: 6px;
                    animation: dot-pulse 3s ease-in-out infinite;
                }
                @keyframes dot-pulse {
                    0%, 90% { opacity: 1; }
                    95%, 100% { opacity: 0.3; }
                }

                /* Title */
                .holo-proj__title {
                    font-family: 'Rajdhani', sans-serif;
                    font-weight: 700;
                    font-size: 24px;
                    color: #fff;
                    margin: 0 0 6px 0;
                    text-shadow: 0 0 2px rgba(255,255,255,0.3), 0 0 6px rgba(0,255,255,0.5);
                    letter-spacing: 0.15em;
                    position: relative;
                    line-height: 1.2;
                    text-transform: uppercase;
                }

                /* Date */
                .holo-proj__date {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    color: rgba(0,255,255,0.6);
                    margin-bottom: 10px;
                    text-shadow: 0 0 4px rgba(0,255,255,0.3);
                }
                .holo-proj__date-prefix {
                    color: rgba(0,255,255,0.3);
                    margin-right: 4px;
                }
                .holo-proj__cursor {
                    font-size: 10px;
                    color: rgba(0,255,255,0.5);
                    animation: cursor-blink 1.2s step-end infinite;
                    margin-left: 2px;
                }
                @keyframes cursor-blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }

                /* Tags */
                .holo-proj__tags {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .holo-proj__tag {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px;
                    color: rgba(0,255,255,0.55);
                    letter-spacing: 0.08em;
                }
                .holo-proj__tag-sep {
                    font-family: 'JetBrains Mono', monospace;
                    color: rgba(0,255,255,0.2);
                    margin: 0 6px;
                    font-size: 10px;
                }

                /* ====== SIGNAL LOST INDICATOR ====== */
                .holo-proj__signal-lost {
                    position: absolute;
                    top: 30%;
                    left: 50%;
                    transform: translateX(-50%);
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 9px;
                    letter-spacing: 0.3em;
                    color: rgba(255,0,102,0.7);
                    opacity: 0;
                    pointer-events: none;
                    text-shadow: 0 0 8px rgba(255,0,102,0.5);
                }

                /* ====== SCAN SWEEP (bottom-to-top reveal on reconnect) ====== */
                .holo-proj__scan-sweep {
                    position: absolute;
                    left: 10%;
                    right: 10%;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, rgba(0,255,255,0.9) 30%, #fff 50%, rgba(0,255,255,0.9) 70%, transparent);
                    box-shadow: 0 0 12px 2px rgba(0,255,255,0.6), 0 0 30px 4px rgba(0,255,255,0.2);
                    opacity: 0;
                    pointer-events: none;
                    bottom: 0;
                }

                /* ====== CORRUPTION OVERLAYS ====== */
                .holo-proj__corrupt {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    opacity: 0;
                }
                .holo-proj__corrupt--r {
                    background: rgba(255,0,102,0.12);
                    mix-blend-mode: screen;
                }
                .holo-proj__corrupt--c {
                    background: rgba(0,255,255,0.12);
                    mix-blend-mode: screen;
                }


                /* =============================================
                   PHASE 1: BURST — intense corruption (0-150ms)
                   ============================================= */

                /* Content: violent displacement + flicker */
                .holo-proj--burst .holo-proj__content {
                    animation: burst-content 0.15s step-end forwards;
                }
                @keyframes burst-content {
                    0%   { opacity: 1; transform: none; }
                    10%  { opacity: 0.2; transform: skewX(8deg) translateX(6px); filter: blur(2px); }
                    20%  { opacity: 0.9; transform: skewX(-4deg) translateX(-8px); clip-path: inset(5% 0 60% 0); }
                    30%  { opacity: 0.05; transform: translateY(-3px); filter: blur(3px); }
                    45%  { opacity: 0.7; transform: skewX(6deg) translateX(4px); clip-path: inset(40% 0 20% 0); }
                    60%  { opacity: 0.1; transform: skewX(-10deg) translateX(-5px); }
                    75%  { opacity: 0.4; transform: translateX(3px) skewX(3deg); clip-path: inset(20% 0 50% 0); }
                    90%  { opacity: 0.05; transform: none; filter: blur(4px); }
                    100% { opacity: 0; transform: none; }
                }

                /* Title: aggressive RGB split */
                .holo-proj--burst .holo-proj__title {
                    animation: burst-title 0.15s step-end forwards;
                }
                .holo-proj--burst .holo-proj__title::before {
                    content: attr(data-text);
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    color: #ff0066;
                    mix-blend-mode: screen;
                    pointer-events: none;
                    animation: burst-rgb-r 0.15s step-end forwards;
                }
                .holo-proj--burst .holo-proj__title::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    color: #00ffff;
                    mix-blend-mode: screen;
                    pointer-events: none;
                    animation: burst-rgb-c 0.15s step-end forwards;
                }

                @keyframes burst-title {
                    0%   { text-shadow: 0 0 2px rgba(255,255,255,0.3), 0 0 6px rgba(0,255,255,0.5); }
                    15%  { text-shadow: -6px 0 #ff0066, 6px 0 #00ffff, 0 0 25px rgba(255,0,102,0.6); }
                    30%  { text-shadow: 4px 2px #ff0066, -4px -2px #00ffff, 0 0 40px rgba(0,255,255,0.8); }
                    50%  { text-shadow: -8px 0 #ff0066, 8px 0 #00ffff; }
                    70%  { text-shadow: 2px 0 #ff0066, -2px 0 #00ffff; }
                    100% { text-shadow: none; }
                }
                @keyframes burst-rgb-r {
                    0%   { opacity: 0; transform: none; }
                    15%  { opacity: 0.8; transform: translate(-7px, 2px); clip-path: inset(10% 0 50% 0); }
                    30%  { opacity: 0.5; transform: translate(5px, -1px); clip-path: inset(40% 0 20% 0); }
                    50%  { opacity: 0.9; transform: translate(-4px, 0); clip-path: inset(0); }
                    70%  { opacity: 0.3; transform: translate(3px, 1px); }
                    100% { opacity: 0; }
                }
                @keyframes burst-rgb-c {
                    0%   { opacity: 0; transform: none; }
                    15%  { opacity: 0.8; transform: translate(7px, -2px); clip-path: inset(50% 0 10% 0); }
                    30%  { opacity: 0.5; transform: translate(-5px, 1px); clip-path: inset(20% 0 40% 0); }
                    50%  { opacity: 0.9; transform: translate(4px, 0); clip-path: inset(0); }
                    70%  { opacity: 0.3; transform: translate(-3px, -1px); }
                    100% { opacity: 0; }
                }

                /* Beam: violent flicker */
                .holo-proj--burst .holo-proj__beam {
                    animation: burst-beam 0.15s step-end forwards;
                }
                @keyframes burst-beam {
                    0%   { opacity: 1; }
                    15%  { opacity: 0.05; }
                    25%  { opacity: 0.8; }
                    40%  { opacity: 0; }
                    55%  { opacity: 0.6; }
                    70%  { opacity: 0.1; }
                    85%  { opacity: 0.3; }
                    100% { opacity: 0; }
                }

                /* Emitter: overload flash */
                .holo-proj--burst .holo-proj__emitter-core {
                    box-shadow: 0 0 15px 5px #fff, 0 0 40px 10px #ff0066;
                    background: #ff0066;
                }

                /* Corruption overlays active during burst */
                .holo-proj--burst .holo-proj__corrupt--r {
                    opacity: 1;
                    animation: corrupt-r 0.1s step-end infinite;
                }
                .holo-proj--burst .holo-proj__corrupt--c {
                    opacity: 1;
                    animation: corrupt-c 0.1s step-end infinite;
                }
                @keyframes corrupt-r {
                    0%   { clip-path: inset(8% 0 72% 0); transform: translateX(-5px); }
                    25%  { clip-path: inset(55% 0 15% 0); transform: translateX(4px); }
                    50%  { clip-path: inset(25% 0 55% 0); transform: translateX(-3px); }
                    75%  { clip-path: inset(70% 0 8% 0); transform: translateX(5px); }
                    100% { clip-path: inset(40% 0 35% 0); transform: translateX(-2px); }
                }
                @keyframes corrupt-c {
                    0%   { clip-path: inset(65% 0 10% 0); transform: translateX(4px); }
                    25%  { clip-path: inset(10% 0 70% 0); transform: translateX(-4px); }
                    50%  { clip-path: inset(45% 0 30% 0); transform: translateX(3px); }
                    75%  { clip-path: inset(15% 0 65% 0); transform: translateX(-5px); }
                    100% { clip-path: inset(55% 0 20% 0); transform: translateX(2px); }
                }


                /* =============================================
                   PHASE 2: LOST — signal blackout (150-400ms)
                   ============================================= */

                .holo-proj--lost .holo-proj__content {
                    opacity: 0;
                }
                .holo-proj--lost .holo-proj__beam {
                    opacity: 0;
                }
                .holo-proj--lost .holo-proj__emitter-core {
                    box-shadow: 0 0 3px 1px rgba(255,0,102,0.4), 0 0 6px 2px rgba(255,0,102,0.2);
                    background: rgba(255,0,102,0.6);
                    animation: lost-emitter-blink 0.2s step-end infinite;
                }
                @keyframes lost-emitter-blink {
                    0%, 50% { opacity: 1; }
                    25%, 75% { opacity: 0.2; }
                }

                /* SIGNAL_LOST text visible */
                .holo-proj--lost .holo-proj__signal-lost {
                    opacity: 1;
                    animation: signal-lost-blink 0.25s step-end infinite;
                }
                @keyframes signal-lost-blink {
                    0%   { opacity: 0.8; }
                    50%  { opacity: 0.2; }
                    100% { opacity: 0.8; }
                }

                .holo-proj--lost .holo-proj__corrupt { opacity: 0; }


                /* =============================================
                   PHASE 3: RECONNECT — scan sweep reveal (400-900ms)
                   ============================================= */

                .holo-proj--reconnect .holo-proj__content {
                    animation: reconnect-reveal 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
                }
                @keyframes reconnect-reveal {
                    0%   { opacity: 0; transform: translateY(5px); filter: blur(2px); clip-path: inset(100% 0 0 0); }
                    30%  { opacity: 0.6; transform: translateY(2px); filter: blur(1px); clip-path: inset(40% 0 0 0); }
                    60%  { opacity: 0.9; transform: translateY(0); filter: none; clip-path: inset(10% 0 0 0); }
                    80%  { opacity: 1; clip-path: inset(2% 0 0 0); }
                    100% { opacity: 1; transform: none; filter: none; clip-path: inset(0); }
                }

                /* Beam fades back in */
                .holo-proj--reconnect .holo-proj__beam {
                    animation: reconnect-beam 0.5s ease-out forwards;
                }
                @keyframes reconnect-beam {
                    0%   { opacity: 0; }
                    40%  { opacity: 0.4; }
                    100% { opacity: 1; }
                }

                /* Scan sweep line moves bottom → top */
                .holo-proj--reconnect .holo-proj__scan-sweep {
                    animation: sweep-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
                }
                @keyframes sweep-up {
                    0%   { bottom: 0; opacity: 1; }
                    80%  { bottom: 95%; opacity: 0.8; }
                    100% { bottom: 100%; opacity: 0; }
                }

                /* Emitter recovers */
                .holo-proj--reconnect .holo-proj__emitter-core {
                    animation: reconnect-emitter 0.4s ease-out forwards;
                }
                @keyframes reconnect-emitter {
                    0%   { box-shadow: 0 0 3px 1px rgba(255,0,102,0.4); background: rgba(255,0,102,0.6); }
                    30%  { box-shadow: 0 0 10px 3px #fff, 0 0 25px 6px rgba(0,255,255,0.5); background: #fff; }
                    100% { box-shadow: 0 0 4px 1px #fff, 0 0 12px 3px rgba(0,255,255,0.8); background: #fff; }
                }

                /* Residual flicker on title during reconnect */
                .holo-proj--reconnect .holo-proj__title {
                    animation: reconnect-title-flicker 0.5s ease-out forwards;
                }
                @keyframes reconnect-title-flicker {
                    0%   { opacity: 0; text-shadow: none; }
                    20%  { opacity: 0.6; text-shadow: -2px 0 #ff0066, 2px 0 #00ffff; }
                    35%  { opacity: 0.3; text-shadow: 1px 0 #00ffff; }
                    50%  { opacity: 0.9; text-shadow: -1px 0 #ff0066, 1px 0 #00ffff, 0 0 8px rgba(0,255,255,0.4); }
                    70%  { opacity: 1; text-shadow: 0 0 4px rgba(0,255,255,0.3); }
                    100% { opacity: 1; text-shadow: 0 0 2px rgba(255,255,255,0.3), 0 0 6px rgba(0,255,255,0.5); }
                }

                .holo-proj--reconnect .holo-proj__signal-lost { opacity: 0; }
                .holo-proj--reconnect .holo-proj__corrupt { opacity: 0; }
            `}</style>
        </div>
    );
};
