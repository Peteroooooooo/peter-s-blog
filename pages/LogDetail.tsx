import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { logs, getLogById } from '../content/logs';
import { ArrowLeft, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export const LogDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isEntered, setIsEntered] = useState(false);

    const log = id ? getLogById(id) : undefined;

    // Find prev/next
    const currentIndex = logs.findIndex(l => l.id === id);
    const prevLog = currentIndex > 0 ? logs[currentIndex - 1] : null;
    const nextLog = currentIndex < logs.length - 1 ? logs[currentIndex + 1] : null;

    useEffect(() => {
        window.scrollTo(0, 0);
        const timer = setTimeout(() => setIsEntered(true), 100);
        return () => clearTimeout(timer);
    }, [id]);

    if (!log) {
        return (
            <div className="log-detail" style={{ paddingTop: '120px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'JetBrains Mono', 'LXGW WenKai Mono', monospace", color: 'rgba(255,255,255,0.3)' }}>
                    <p>&gt; ERROR: LOG_ENTRY_NOT_FOUND</p>
                    <p style={{ fontSize: '12px', marginTop: '8px' }}>&gt; ID "{id}" does not exist in the registry.</p>
                    <button
                        onClick={() => navigate('/logs')}
                        style={{
                            marginTop: '24px',
                            background: 'none',
                            border: '1px solid rgba(0,255,255,0.3)',
                            color: '#00FFFF',
                            padding: '8px 20px',
                            fontFamily: "'JetBrains Mono', 'LXGW WenKai Mono', monospace",
                            fontSize: '11px',
                            cursor: 'pointer',
                            letterSpacing: '0.1em',
                        }}
                    >
                        [RETURN_TO_INDEX]
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`log-detail ${isEntered ? 'log-detail--visible' : ''}`}>
            <div className="log-detail__container">

                {/* Back button */}
                <button className="log-detail__back" onClick={() => navigate('/logs')}>
                    <ArrowLeft size={14} />
                    <span>RETURN_TO_INDEX</span>
                </button>

                {/* Meta header */}
                <div className="log-detail__meta">
                    <span className="log-detail__meta-id">&gt; LOG_ID: {log.id}</span>
                    <span className="log-detail__meta-sep">|</span>
                    <span className="log-detail__meta-date">DATE: {log.date}</span>
                    <span className="log-detail__meta-sep">|</span>
                    <span className={`log-detail__meta-category log-detail__cat--${log.category.toLowerCase()}`}>
                        [{log.category}]
                    </span>
                    <span className="log-detail__meta-sep">|</span>
                    <span className="log-detail__meta-time"><Clock size={10} /> {log.readTime}</span>
                </div>

                {/* Title */}
                <h1 className="log-detail__title">{log.title}</h1>

                {/* Separator */}
                <div className="log-detail__divider" />

                {/* Markdown Content */}
                <article className="log-detail__content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                const codeString = String(children).replace(/\n$/, '');
                                if (match) {
                                    return (
                                        <SyntaxHighlighter
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            customStyle={{
                                                background: 'rgba(10, 10, 15, 0.8)',
                                                border: '1px solid rgba(0, 255, 255, 0.1)',
                                                borderRadius: '0',
                                                fontSize: '12px',
                                                padding: '16px',
                                                margin: '16px 0',
                                            }}
                                        >
                                            {codeString}
                                        </SyntaxHighlighter>
                                    );
                                }
                                return (
                                    <code className="log-detail__inline-code" {...props}>
                                        {children}
                                    </code>
                                );
                            },
                        }}
                    >
                        {log.content}
                    </ReactMarkdown>
                </article>

                {/* Tags */}
                {log.tags && log.tags.length > 0 && (
                    <div className="log-detail__tags">
                        <span className="log-detail__tags-label">&gt; TAGS:</span>
                        {log.tags.map(tag => (
                            <span key={tag} className="log-detail__tag">#{tag}</span>
                        ))}
                    </div>
                )}

                {/* Divider */}
                <div className="log-detail__divider" />

                {/* Prev / Next navigation */}
                <nav className="log-detail__nav">
                    {prevLog ? (
                        <button
                            className="log-detail__nav-btn log-detail__nav-btn--prev"
                            onClick={() => { setIsEntered(false); setTimeout(() => navigate(`/logs/${prevLog.id}`), 150); }}
                        >
                            <ChevronLeft size={14} />
                            <div>
                                <span className="log-detail__nav-label">PREV_LOG</span>
                                <span className="log-detail__nav-title">{prevLog.title}</span>
                            </div>
                        </button>
                    ) : <div />}
                    {nextLog ? (
                        <button
                            className="log-detail__nav-btn log-detail__nav-btn--next"
                            onClick={() => { setIsEntered(false); setTimeout(() => navigate(`/logs/${nextLog.id}`), 150); }}
                        >
                            <div>
                                <span className="log-detail__nav-label">NEXT_LOG</span>
                                <span className="log-detail__nav-title">{nextLog.title}</span>
                            </div>
                            <ChevronRight size={14} />
                        </button>
                    ) : <div />}
                </nav>
            </div>

            <style>{`
                .log-detail {
                    min-height: 100vh;
                    padding-top: 80px;
                    padding-bottom: 80px;
                    pointer-events: auto;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: opacity 0.5s ease, transform 0.5s ease;
                }
                .log-detail--visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .log-detail__container {
                    max-width: 720px;
                    margin: 0 auto;
                    padding: 0 24px;
                }

                /* Back */
                .log-detail__back {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: none;
                    border: none;
                    color: rgba(0, 255, 255, 0.5);
                    font-family: 'JetBrains Mono', 'LXGW WenKai Mono', monospace;
                    font-size: 11px;
                    letter-spacing: 0.1em;
                    cursor: pointer;
                    padding: 0;
                    margin-bottom: 24px;
                    transition: color 0.2s;
                }
                .log-detail__back:hover {
                    color: #00FFFF;
                }

                /* Meta */
                .log-detail__meta {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 8px;
                    font-family: 'JetBrains Mono', 'LXGW WenKai Mono', monospace;
                    font-size: 11px;
                    margin-bottom: 16px;
                }
                .log-detail__meta-id {
                    color: rgba(0, 255, 255, 0.5);
                }
                .log-detail__meta-sep {
                    color: rgba(255, 255, 255, 0.1);
                }
                .log-detail__meta-date {
                    color: rgba(255, 255, 255, 0.3);
                }
                .log-detail__meta-category {
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                }
                .log-detail__cat--dev { color: #60ff60; }
                .log-detail__cat--research { color: #a78bfa; }
                .log-detail__cat--system { color: #fbbf24; }
                .log-detail__cat--thoughts { color: #00FFFF; }
                .log-detail__cat--tutorial { color: #f472b6; }
                .log-detail__cat--hardware { color: #fb923c; }
                .log-detail__meta-time {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: rgba(255, 255, 255, 0.2);
                }

                /* Title */
                .log-detail__title {
                    font-family: 'Rajdhani', 'LXGW WenKai Mono', sans-serif;
                    font-size: 36px;
                    font-weight: 700;
                    color: white;
                    line-height: 1.2;
                    margin: 0 0 20px 0;
                    letter-spacing: 0.02em;
                }

                /* Divider */
                .log-detail__divider {
                    height: 1px;
                    background: linear-gradient(to right, rgba(0, 255, 255, 0.3), rgba(0, 255, 255, 0.02));
                    margin: 24px 0;
                }

                /* Content — Markdown styled */
                .log-detail__content {
                    font-family: 'Rajdhani', 'LXGW WenKai Mono', sans-serif;
                    font-size: 16px;
                    line-height: 1.8;
                    color: rgba(255, 255, 255, 0.75);
                }
                .log-detail__content h1,
                .log-detail__content h2,
                .log-detail__content h3 {
                    font-family: 'JetBrains Mono', 'LXGW WenKai Mono', monospace;
                    color: rgba(255, 255, 255, 0.9);
                    margin: 32px 0 12px 0;
                    line-height: 1.3;
                }
                .log-detail__content h1 {
                    font-size: 24px;
                    color: #00FFFF;
                    display: none; /* Hide H1 since we have the title */
                }
                .log-detail__content h2 {
                    font-size: 18px;
                    padding-bottom: 6px;
                    border-bottom: 1px solid rgba(0, 255, 255, 0.1);
                }
                .log-detail__content h2::before {
                    content: '▸ ';
                    color: #00FFFF;
                    opacity: 0.6;
                }
                .log-detail__content h3 {
                    font-size: 15px;
                }
                .log-detail__content h3::before {
                    content: '▹ ';
                    color: rgba(0, 255, 255, 0.4);
                }
                .log-detail__content p {
                    margin: 12px 0;
                }
                .log-detail__content strong {
                    color: rgba(255, 255, 255, 0.95);
                    font-weight: 700;
                }
                .log-detail__content em {
                    color: rgba(0, 255, 255, 0.6);
                    font-style: italic;
                }
                .log-detail__content a {
                    color: #00FFFF;
                    text-decoration: none;
                    border-bottom: 1px solid rgba(0, 255, 255, 0.3);
                    transition: border-color 0.2s;
                }
                .log-detail__content a:hover {
                    border-color: #00FFFF;
                }
                .log-detail__content blockquote {
                    border-left: 3px solid rgba(0, 255, 255, 0.4);
                    margin: 16px 0;
                    padding: 12px 16px;
                    background: rgba(0, 255, 255, 0.03);
                    color: rgba(255, 255, 255, 0.6);
                    font-style: italic;
                }
                .log-detail__content ul,
                .log-detail__content ol {
                    padding-left: 20px;
                    margin: 12px 0;
                }
                .log-detail__content li {
                    margin: 6px 0;
                }
                .log-detail__content li::marker {
                    color: rgba(0, 255, 255, 0.4);
                }
                .log-detail__inline-code {
                    font-family: 'JetBrains Mono', 'LXGW WenKai Mono', monospace;
                    font-size: 13px;
                    background: rgba(0, 255, 255, 0.06);
                    border: 1px solid rgba(0, 255, 255, 0.1);
                    padding: 1px 6px;
                    color: #00FFFF;
                }
                .log-detail__content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 16px 0;
                    font-size: 14px;
                }
                .log-detail__content th {
                    background: rgba(0, 255, 255, 0.06);
                    color: rgba(0, 255, 255, 0.8);
                    font-family: 'JetBrains Mono', 'LXGW WenKai Mono', monospace;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-align: left;
                    padding: 8px 12px;
                    border-bottom: 1px solid rgba(0, 255, 255, 0.2);
                }
                .log-detail__content td {
                    padding: 8px 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                    color: rgba(255, 255, 255, 0.6);
                }
                .log-detail__content tr:hover td {
                    background: rgba(0, 255, 255, 0.02);
                }
                .log-detail__content hr {
                    border: none;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.06);
                    margin: 24px 0;
                }

                /* Tags */
                .log-detail__tags {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: 'JetBrains Mono', 'LXGW WenKai Mono', monospace;
                    font-size: 11px;
                    margin-bottom: 8px;
                }
                .log-detail__tags-label {
                    color: rgba(255, 255, 255, 0.2);
                }
                .log-detail__tag {
                    color: rgba(0, 255, 255, 0.35);
                }

                /* Nav */
                .log-detail__nav {
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                }
                .log-detail__nav-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.5);
                    padding: 12px 16px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    max-width: 48%;
                    font-family: 'JetBrains Mono', 'LXGW WenKai Mono', monospace;
                }
                .log-detail__nav-btn:hover {
                    background: rgba(0, 255, 255, 0.05);
                    border-color: rgba(0, 255, 255, 0.3);
                    color: #00FFFF;
                }
                .log-detail__nav-btn--next {
                    margin-left: auto;
                    text-align: right;
                }
                .log-detail__nav-label {
                    display: block;
                    font-size: 9px;
                    letter-spacing: 0.15em;
                    color: rgba(0, 255, 255, 0.4);
                    margin-bottom: 4px;
                }
                .log-detail__nav-title {
                    display: block;
                    font-size: 12px;
                    color: inherit;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 200px;
                }

                /* Mobile */
                @media (max-width: 640px) {
                    .log-detail {
                        padding-top: 70px;
                    }
                    .log-detail__container {
                        padding: 0 16px;
                    }
                    .log-detail__title {
                        font-size: 26px;
                    }
                    .log-detail__meta {
                        font-size: 10px;
                    }
                    .log-detail__nav {
                        flex-direction: column;
                    }
                    .log-detail__nav-btn {
                        max-width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};
