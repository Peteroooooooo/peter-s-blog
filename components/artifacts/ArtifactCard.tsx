import React from 'react';
import { Artifact } from '../../content/types';

interface ArtifactCardProps {
    artifact: Artifact;
    isSelected: boolean;
    position: 'above' | 'center' | 'below';
    offset: number;
    onClick: () => void;
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({
    artifact,
    isSelected,
    position,
    offset,
    onClick,
}) => {
    const absOffset = Math.min(Math.abs(offset), 1.5);
    const scale = absOffset < 0.05 ? 1 : 1 - absOffset * 0.18;
    const opacity = 1 - absOffset * 0.6;
    const translateY = offset * 240;

    return (
        <div
            className="artifact-card-wrapper"
            onClick={onClick}
            style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
                opacity: Math.max(0, opacity),
                zIndex: isSelected ? 10 : 5 - Math.floor(absOffset),
                transition: 'none',
                cursor: 'pointer',
                width: '420px',
                willChange: isSelected ? 'auto' : 'transform, opacity',
            }}
        >
            <div className={`artifact-card ${isSelected ? 'artifact-card--selected' : ''}`}>
                {/* Content */}
                <h3 className="artifact-card__title glitch-text" data-text={artifact.title}>{artifact.title}</h3>
                <p className="artifact-card__desc glitch-text" data-text={artifact.description}>{artifact.description}</p>
                <div className="artifact-card__tags">
                    {artifact.techStack.map((tech) => (
                        <span key={tech} className="artifact-card__tag glitch-text" data-text={tech}>{tech}</span>
                    ))}
                </div>
                <div className="artifact-card__meta">
                    <span className="artifact-card__date glitch-text" data-text={`▸ ${artifact.date}`}>▸ {artifact.date}</span>
                    <span className="artifact-card__id glitch-text" data-text={`#${artifact.id}`}>#{artifact.id}</span>
                </div>

                {/* Corner decorations */}
                <div className="artifact-card__corner artifact-card__corner--tr" />
                <div className="artifact-card__corner artifact-card__corner--br" />

                {/* Scanline */}
                <div className="artifact-card__scanline" />
            </div>

            <style>{`
                /* ═══════════════════════════
                   BASE CARD
                   ═══════════════════════════ */
                .artifact-card {
                    position: relative;
                    background: rgba(10, 10, 12, 0.88);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-left: 3px solid rgba(0, 255, 255, 0.25);
                    padding: 28px 32px;
                    overflow: hidden;
                    transition: border-color 0.4s ease, box-shadow 0.4s ease, background 0.4s ease;
                }
                .artifact-card--selected {
                    border: 1px solid rgba(0, 255, 255, 0.45);
                    border-left: 3px solid rgba(0, 255, 255, 0.9);
                    box-shadow: 0 0 20px rgba(0,255,255,0.12), 0 0 50px rgba(0,255,255,0.06), inset 0 0 30px rgba(0,255,255,0.02);
                    background: rgba(10, 10, 12, 0.92);
                }
                .artifact-card:hover { border-left-color: rgba(0,255,255,0.7); }
                .artifact-card--selected:hover {
                    border-left-color: rgba(0,255,255,1);
                    box-shadow: 0 0 25px rgba(0,255,255,0.18), 0 0 60px rgba(0,255,255,0.08), inset 0 0 30px rgba(0,255,255,0.03);
                }

                /* Scanline */
                .artifact-card__scanline {
                    position: absolute; top: 0; left: 0; right: 0; height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(0,255,255,0.4), transparent);
                    animation: card-scan 4s linear infinite;
                    pointer-events: none; z-index: 1;
                }
                @keyframes card-scan {
                    0% { top: 0; opacity: 0; } 10% { opacity: 0.6; } 90% { opacity: 0.6; } 100% { top: 100%; opacity: 0; }
                }

                /* ═══════════════════════════
                   CONTENT
                   ═══════════════════════════ */
                .artifact-card__title {
                    font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 22px;
                    color: #fff; margin: 0 0 8px 0; letter-spacing: 0.02em;
                    position: relative;
                }
                .artifact-card__desc {
                    font-family: 'Rajdhani', sans-serif; font-size: 14px; color: #9CA3AF;
                    line-height: 1.6; margin: 0 0 16px 0;
                    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
                }
                .artifact-card__tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; overflow: hidden; }
                .artifact-card__tag {
                    font-family: 'JetBrains Mono', monospace; font-size: 10px;
                    padding: 2px 8px; background: rgba(0,255,255,0.06);
                    border: 1px solid rgba(0,255,255,0.15); color: rgba(0,255,255,0.6); letter-spacing: 0.05em;
                }
                .artifact-card__meta {
                    display: flex; justify-content: space-between; align-items: center;
                    font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #4B5563;
                }
                .artifact-card__id { opacity: 0.6; }

                /* Corners */
                .artifact-card__corner { position: absolute; width: 10px; height: 10px; }
                .artifact-card__corner--tr { top: -1px; right: -1px; border-top: 2px solid rgba(255,255,255,0.2); border-right: 2px solid rgba(255,255,255,0.2); }
                .artifact-card__corner--br { bottom: -1px; right: -1px; border-bottom: 2px solid rgba(255,255,255,0.2); border-right: 2px solid rgba(255,255,255,0.2); }
                .artifact-card--selected .artifact-card__corner--tr { border-color: rgba(0,255,255,0.5); }
                .artifact-card--selected .artifact-card__corner--br { border-color: rgba(0,255,255,0.5); }

                /* ═══════════════════════════════════════════════
                   GLITCH EFFECT — pure CSS keyframe animation
                   3-layer approach: card skew + ::before cyan + ::after red
                   Smooth 2.5s cycle with brief glitch bursts
                   ═══════════════════════════════════════════════ */

                /* 1) Card body — skew + border flash + glow */
                .artifact-card:hover {
                    animation: glitch-card 2.5s infinite, glitch-border 2.5s infinite, glitch-glow 2.5s infinite;
                }

                /* Corners flash on glitch */
                .artifact-card:hover .artifact-card__corner--tr,
                .artifact-card:hover .artifact-card__corner--br {
                    animation: glitch-corners 2.5s infinite;
                }

                /* 2) Cyan channel overlay — translates opposite to red */
                .artifact-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 30;
                }
                .artifact-card:hover::before {
                    animation: glitch-cyan 2.5s infinite;
                }

                /* 3) Red/magenta channel overlay — translates opposite to cyan */
                .artifact-card::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 30;
                }
                .artifact-card:hover::after {
                    animation: glitch-red 2.5s infinite;
                }

                /* 4) All text elements — RGB split via pseudo-elements */
                .glitch-text {
                    position: relative;
                }
                .glitch-text::before,
                .glitch-text::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    padding: inherit;
                    pointer-events: none;
                    opacity: 0;
                    mix-blend-mode: screen;
                }
                .glitch-text::before { color: #00ffcc; }
                .glitch-text::after { color: #ff3366; }

                /* All text — same strength */
                .artifact-card:hover .glitch-text::before {
                    animation: glitch-text-cyan 2.5s infinite;
                }
                .artifact-card:hover .glitch-text::after {
                    animation: glitch-text-red 2.5s infinite;
                }

                /* ═══ KEYFRAMES ═══ */

                /* Card body skew — brief distortion bursts */
                @keyframes glitch-card {
                    0%   { transform: none; }
                    7%   { transform: skew(-1deg, -1.5deg); }
                    10%  { transform: none; }
                    27%  { transform: none; }
                    30%  { transform: skew(1.5deg, -0.3deg); }
                    35%  { transform: none; }
                    52%  { transform: none; }
                    55%  { transform: skew(-1.8deg, 0.5deg); }
                    58%  { transform: none; }
                    72%  { transform: none; }
                    75%  { transform: skew(0.8deg, 1.8deg); }
                    80%  { transform: none; }
                    100% { transform: none; }
                }

                /* Cyan overlay — translate offset + opacity pulse */
                @keyframes glitch-cyan {
                    0%   { transform: none; box-shadow: none; }
                    7%   { transform: translate(-4px, -5px); box-shadow: inset 0 0 12px rgba(103,243,218,0.15), 0 0 8px rgba(103,243,218,0.1); }
                    10%  { transform: none; box-shadow: none; }
                    27%  { transform: none; box-shadow: none; }
                    30%  { transform: translate(-8px, -3px); box-shadow: inset 0 0 15px rgba(103,243,218,0.18), 0 0 10px rgba(103,243,218,0.12); }
                    35%  { transform: none; box-shadow: none; }
                    52%  { transform: none; box-shadow: none; }
                    55%  { transform: translate(-7px, -2px); box-shadow: inset 0 0 12px rgba(103,243,218,0.15), 0 0 8px rgba(103,243,218,0.1); }
                    58%  { transform: none; box-shadow: none; }
                    72%  { transform: none; box-shadow: none; }
                    75%  { transform: translate(-3px, -8px); box-shadow: inset 0 0 12px rgba(103,243,218,0.12), 0 0 6px rgba(103,243,218,0.08); }
                    80%  { transform: none; box-shadow: none; }
                    100% { transform: none; box-shadow: none; }
                }

                /* Red overlay — translate opposite + edge glow */
                @keyframes glitch-red {
                    0%   { transform: none; box-shadow: none; }
                    7%   { transform: translate(4px, 5px); box-shadow: inset 0 0 12px rgba(241,111,111,0.15), 0 0 8px rgba(241,111,111,0.1); }
                    10%  { transform: none; box-shadow: none; }
                    27%  { transform: none; box-shadow: none; }
                    30%  { transform: translate(8px, 3px); box-shadow: inset 0 0 15px rgba(241,111,111,0.18), 0 0 10px rgba(241,111,111,0.12); }
                    35%  { transform: none; box-shadow: none; }
                    52%  { transform: none; box-shadow: none; }
                    55%  { transform: translate(7px, 2px); box-shadow: inset 0 0 12px rgba(241,111,111,0.15), 0 0 8px rgba(241,111,111,0.1); }
                    58%  { transform: none; box-shadow: none; }
                    72%  { transform: none; box-shadow: none; }
                    75%  { transform: translate(3px, 8px); box-shadow: inset 0 0 12px rgba(241,111,111,0.12), 0 0 6px rgba(241,111,111,0.08); }
                    80%  { transform: none; box-shadow: none; }
                    100% { transform: none; box-shadow: none; }
                }

                /* Title cyan text — channel separation */
                @keyframes glitch-text-cyan {
                    0%   { transform: none; opacity: 0; }
                    7%   { transform: translate(-5px, -3px); opacity: 0.5; }
                    10%  { transform: none; opacity: 0; }
                    27%  { transform: none; opacity: 0; }
                    30%  { transform: translate(-8px, -2px); opacity: 0.6; }
                    35%  { transform: none; opacity: 0; }
                    52%  { transform: none; opacity: 0; }
                    55%  { transform: translate(-6px, -3px); opacity: 0.55; }
                    58%  { transform: none; opacity: 0; }
                    72%  { transform: none; opacity: 0; }
                    75%  { transform: translate(-4px, -6px); opacity: 0.5; }
                    80%  { transform: none; opacity: 0; }
                    100% { transform: none; opacity: 0; }
                }

                /* Red text — opposite channel separation */
                @keyframes glitch-text-red {
                    0%   { transform: none; opacity: 0; }
                    7%   { transform: translate(5px, 3px); opacity: 0.5; }
                    10%  { transform: none; opacity: 0; }
                    27%  { transform: none; opacity: 0; }
                    30%  { transform: translate(8px, 2px); opacity: 0.6; }
                    35%  { transform: none; opacity: 0; }
                    52%  { transform: none; opacity: 0; }
                    55%  { transform: translate(6px, 3px); opacity: 0.55; }
                    58%  { transform: none; opacity: 0; }
                    72%  { transform: none; opacity: 0; }
                    75%  { transform: translate(4px, 6px); opacity: 0.5; }
                    80%  { transform: none; opacity: 0; }
                    100% { transform: none; opacity: 0; }
                }

                /* ═══ BORDER, GLOW & CORNERS ═══ */

                /* Left border — flash cyan → magenta → white at glitch moments */
                @keyframes glitch-border {
                    0%   { border-left-color: rgba(0,255,255,0.7); }
                    6%   { border-left-color: rgba(0,255,255,0.7); }
                    7%   { border-left-color: #ff3366; }
                    8%   { border-left-color: #fff; }
                    10%  { border-left-color: rgba(0,255,255,0.7); }
                    29%  { border-left-color: rgba(0,255,255,0.7); }
                    30%  { border-left-color: #00ffcc; }
                    31%  { border-left-color: #ff3366; }
                    33%  { border-left-color: #fff; }
                    35%  { border-left-color: rgba(0,255,255,0.7); }
                    54%  { border-left-color: rgba(0,255,255,0.7); }
                    55%  { border-left-color: #ff3366; }
                    56%  { border-left-color: #00ffcc; }
                    58%  { border-left-color: rgba(0,255,255,0.7); }
                    74%  { border-left-color: rgba(0,255,255,0.7); }
                    75%  { border-left-color: #fff; }
                    76%  { border-left-color: #00ffcc; }
                    78%  { border-left-color: #ff3366; }
                    80%  { border-left-color: rgba(0,255,255,0.7); }
                    100% { border-left-color: rgba(0,255,255,0.7); }
                }

                /* Card glow — subtle box-shadow pulse at glitch moments */
                @keyframes glitch-glow {
                    0%   { box-shadow: none; }
                    7%   { box-shadow: 0 0 15px rgba(255,51,102,0.15), inset 0 0 20px rgba(0,255,204,0.05); }
                    10%  { box-shadow: none; }
                    30%  { box-shadow: 0 0 20px rgba(0,255,204,0.15), inset 0 0 25px rgba(255,51,102,0.05); }
                    35%  { box-shadow: none; }
                    55%  { box-shadow: 0 0 15px rgba(255,51,102,0.12), inset 0 0 15px rgba(0,255,204,0.04); }
                    58%  { box-shadow: none; }
                    75%  { box-shadow: 0 0 18px rgba(0,255,204,0.12), inset 0 0 20px rgba(255,51,102,0.04); }
                    80%  { box-shadow: none; }
                    100% { box-shadow: none; }
                }

                /* Corners — flash bright at glitch moments */
                @keyframes glitch-corners {
                    0%   { border-color: rgba(255,255,255,0.2); }
                    7%   { border-color: rgba(0,255,204,0.8); }
                    10%  { border-color: rgba(255,255,255,0.2); }
                    30%  { border-color: rgba(255,51,102,0.7); }
                    35%  { border-color: rgba(255,255,255,0.2); }
                    55%  { border-color: rgba(0,255,204,0.7); }
                    58%  { border-color: rgba(255,255,255,0.2); }
                    75%  { border-color: rgba(255,255,255,0.9); }
                    80%  { border-color: rgba(255,255,255,0.2); }
                    100% { border-color: rgba(255,255,255,0.2); }
                }
            `}</style>
        </div>
    );
};
