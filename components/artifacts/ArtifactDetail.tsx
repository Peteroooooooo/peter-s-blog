import React, { useEffect, useState } from 'react';
import { Artifact } from '../../content/types';

interface ArtifactDetailProps {
    artifact: Artifact;
    onClose: () => void;
}

export const ArtifactDetail: React.FC<ArtifactDetailProps> = ({ artifact, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => requestAnimationFrame(() => setIsVisible(true)));
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 400);
    };

    return (
        <div
            className={`artifact-detail-overlay ${isVisible ? 'artifact-detail-overlay--visible' : ''}`}
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
            <div className={`artifact-detail ${isVisible ? 'artifact-detail--visible' : ''}`}>
                {/* Close button */}
                <button className="artifact-detail__close" onClick={handleClose}>
                    <span>×</span>
                </button>

                {/* Header: ID + Date */}
                <div className="artifact-detail__header">
                    <span className="artifact-detail__id">#{artifact.id}</span>
                    <span className="artifact-detail__date">▸ {artifact.date}</span>
                </div>

                {/* Scan line */}
                <div className="artifact-detail__scan" />

                {/* Title */}
                <h1 className="artifact-detail__title">{artifact.title}</h1>

                {/* Divider */}
                <div className="artifact-detail__divider" />

                {/* Description */}
                <p className="artifact-detail__desc">{artifact.description}</p>

                {/* Tech Stack */}
                <div className="artifact-detail__section-label">TECH_STACK</div>
                <div className="artifact-detail__tags">
                    {artifact.techStack.map((tech) => (
                        <span key={tech} className="artifact-detail__tag">{tech}</span>
                    ))}
                </div>

                {/* Links */}
                {(artifact.projectUrl || artifact.sourceUrl) && (
                    <>
                        <div className="artifact-detail__divider" />
                        <div className="artifact-detail__links">
                            {artifact.projectUrl && (
                                <a href={artifact.projectUrl} target="_blank" rel="noopener noreferrer" className="artifact-detail__link">
                                    <span className="artifact-detail__link-icon">◈</span>
                                    VIEW PROJECT
                                </a>
                            )}
                            {artifact.sourceUrl && (
                                <a href={artifact.sourceUrl} target="_blank" rel="noopener noreferrer" className="artifact-detail__link artifact-detail__link--secondary">
                                    <span className="artifact-detail__link-icon">⟨/⟩</span>
                                    SOURCE CODE
                                </a>
                            )}
                        </div>
                    </>
                )}

                {/* Corner accents */}
                <div className="artifact-detail__corner artifact-detail__corner--tl" />
                <div className="artifact-detail__corner artifact-detail__corner--tr" />
                <div className="artifact-detail__corner artifact-detail__corner--bl" />
                <div className="artifact-detail__corner artifact-detail__corner--br" />
            </div>

            <style>{`
                .artifact-detail-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 100;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0);
                    backdrop-filter: blur(0px);
                    transition: background 0.4s ease, backdrop-filter 0.4s ease;
                    pointer-events: auto;
                }
                .artifact-detail-overlay--visible {
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                }

                .artifact-detail {
                    position: relative;
                    max-width: 560px;
                    width: 90%;
                    background: rgba(8, 8, 12, 0.95);
                    border: 1px solid rgba(0, 255, 255, 0.15);
                    padding: 48px 44px;
                    opacity: 0;
                    transform: translateY(30px) scale(0.96);
                    transition: opacity 0.4s cubic-bezier(0.23, 1, 0.32, 1),
                                transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
                }
                .artifact-detail--visible {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }

                .artifact-detail__close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    width: 32px;
                    height: 32px;
                    background: none;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 20px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: border-color 0.3s, color 0.3s;
                }
                .artifact-detail__close:hover {
                    border-color: rgba(0, 255, 255, 0.5);
                    color: rgba(0, 255, 255, 0.8);
                }

                .artifact-detail__header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .artifact-detail__id {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    color: rgba(0, 255, 255, 0.5);
                    letter-spacing: 0.1em;
                }
                .artifact-detail__date {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.3);
                }

                .artifact-detail__scan {
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(0,255,255,0.5), transparent);
                    animation: detail-scan 3s linear infinite;
                    pointer-events: none;
                }
                @keyframes detail-scan {
                    0% { top: 0; opacity: 0; }
                    5% { opacity: 0.8; }
                    95% { opacity: 0.8; }
                    100% { top: 100%; opacity: 0; }
                }

                .artifact-detail__title {
                    font-family: 'Rajdhani', sans-serif;
                    font-weight: 700;
                    font-size: 32px;
                    color: #fff;
                    margin: 0 0 8px 0;
                    letter-spacing: 0.02em;
                    line-height: 1.2;
                    text-shadow: 0 0 20px rgba(0, 255, 255, 0.15);
                }

                .artifact-detail__divider {
                    height: 1px;
                    background: linear-gradient(90deg, rgba(0,255,255,0.3), rgba(0,255,255,0.05) 70%, transparent);
                    margin: 20px 0;
                }

                .artifact-detail__desc {
                    font-family: 'Rajdhani', sans-serif;
                    font-size: 15px;
                    color: rgba(255, 255, 255, 0.65);
                    line-height: 1.7;
                    margin: 0 0 24px 0;
                }

                .artifact-detail__section-label {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px;
                    font-weight: 700;
                    color: rgba(0, 255, 255, 0.4);
                    letter-spacing: 0.2em;
                    margin-bottom: 10px;
                }

                .artifact-detail__tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 24px;
                }
                .artifact-detail__tag {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    padding: 4px 12px;
                    background: rgba(0, 255, 255, 0.05);
                    border: 1px solid rgba(0, 255, 255, 0.2);
                    color: rgba(0, 255, 255, 0.7);
                    letter-spacing: 0.04em;
                    transition: background 0.3s, box-shadow 0.3s;
                }
                .artifact-detail__tag:hover {
                    background: rgba(0, 255, 255, 0.1);
                    box-shadow: 0 0 8px rgba(0, 255, 255, 0.15);
                }

                .artifact-detail__links {
                    display: flex;
                    gap: 12px;
                }
                .artifact-detail__link {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    color: rgba(0, 255, 255, 0.8);
                    text-decoration: none;
                    padding: 10px 20px;
                    border: 1px solid rgba(0, 255, 255, 0.3);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                }
                .artifact-detail__link:hover {
                    background: rgba(0, 255, 255, 0.08);
                    border-color: rgba(0, 255, 255, 0.6);
                    box-shadow: 0 0 15px rgba(0, 255, 255, 0.15);
                    color: #fff;
                }
                .artifact-detail__link--secondary {
                    color: rgba(255, 255, 255, 0.5);
                    border-color: rgba(255, 255, 255, 0.15);
                }
                .artifact-detail__link--secondary:hover {
                    color: rgba(0, 255, 255, 0.8);
                    border-color: rgba(0, 255, 255, 0.4);
                    background: rgba(0, 255, 255, 0.05);
                }

                .artifact-detail__link-icon {
                    font-size: 14px;
                }

                /* Corner accents */
                .artifact-detail__corner {
                    position: absolute;
                    width: 14px;
                    height: 14px;
                }
                .artifact-detail__corner--tl { top: -1px; left: -1px; border-top: 2px solid rgba(0,255,255,0.4); border-left: 2px solid rgba(0,255,255,0.4); }
                .artifact-detail__corner--tr { top: -1px; right: -1px; border-top: 2px solid rgba(0,255,255,0.4); border-right: 2px solid rgba(0,255,255,0.4); }
                .artifact-detail__corner--bl { bottom: -1px; left: -1px; border-bottom: 2px solid rgba(0,255,255,0.4); border-left: 2px solid rgba(0,255,255,0.4); }
                .artifact-detail__corner--br { bottom: -1px; right: -1px; border-bottom: 2px solid rgba(0,255,255,0.4); border-right: 2px solid rgba(0,255,255,0.4); }
            `}</style>
        </div>
    );
};
