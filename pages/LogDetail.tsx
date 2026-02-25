import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { logs, getLogById } from '../content/logs';
import { CATEGORY_COLORS } from '../content/types';
import { ArrowLeft, Clock, ChevronLeft, ChevronRight, Check, Copy, TerminalSquare } from 'lucide-react';

const CodeBlock = ({ language, value }: { language: string, value: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="log-detail__code-wrapper">
            <div className="log-detail__code-header">
                <div className="log-detail__code-lang">
                    <TerminalSquare size={12} className="opacity-50" />
                    <span>{language || 'text'}</span>
                </div>
                <button
                    className={`log-detail__code-copy ${copied ? 'copied' : ''}`}
                    onClick={handleCopy}
                    aria-label="Copy code"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
            </div>
            <SyntaxHighlighter
                style={vscDarkPlus}
                language={language}
                PreTag="div"
                customStyle={{
                    background: 'transparent',
                    padding: '16px',
                    margin: 0,
                    fontSize: '13px',
                    fontFamily: "'JetBrains Mono', 'LXGW WenKai Mono', monospace",
                }}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
};

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
                            border: '1px solid rgba(0,255,255,0.6)',
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
                    <span
                        className="log-detail__meta-category"
                        style={{ color: CATEGORY_COLORS[log.category] }}
                    >
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
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                            code({ className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                const codeString = String(children).replace(/\n$/, '');
                                if (match) {
                                    return <CodeBlock language={match[1]} value={codeString} />;
                                }
                                return (
                                    <code className="log-detail__inline-code" {...props}>
                                        {children}
                                    </code>
                                );
                            },
                            img({ src, alt, ...props }) {
                                // Automatically remap relative paths to the corresponding content/image folder
                                let imageSrc = src;
                                if (src && src.startsWith('./') && log?.id) {
                                    imageSrc = `/content/image/${log.id}/${src.replace('./', '')}`;
                                }

                                return (
                                    <img
                                        src={imageSrc}
                                        alt={alt || "Log Article Image"}
                                        {...props}
                                    />
                                );
                            }
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
                    color: rgba(0, 255, 255, 0.8);
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
                    color: rgba(0, 255, 255, 0.8);
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
                    background: linear-gradient(to right, rgba(0, 255, 255, 0.6), rgba(0, 255, 255, 0.05));
                    margin: 24px 0;
                }

                /* Content — Markdown styled (Modern Github/Docs Style) */
                .log-detail__content {
                    font-family: 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
                    font-size: 16px;
                    font-weight: 400;
                    letter-spacing: 0.3px;
                    line-height: 1.75;
                    color: #d1d5db;
                }
                .log-detail__content h1,
                .log-detail__content h2,
                .log-detail__content h3,
                .log-detail__content h4 {
                    font-family: 'Rajdhani', 'LXGW WenKai Mono', sans-serif;
                    color: #f3f4f6;
                    font-weight: 700;
                    margin-top: 2em;
                    margin-bottom: 1em;
                    line-height: 1.3;
                }
                .log-detail__content h1 {
                    display: none; /* Handled by page header */
                }
                .log-detail__content h2 {
                    font-size: 24px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .log-detail__content h3 {
                    font-size: 20px;
                }
                .log-detail__content h4 {
                    font-size: 16px;
                }
                .log-detail__content p {
                    margin-top: 0;
                    margin-bottom: 1.5em;
                }
                .log-detail__content strong {
                    color: #fff;
                    font-weight: 600;
                }
                .log-detail__content em {
                    color: rgba(255, 255, 255, 0.8);
                    font-style: italic;
                }
                .log-detail__content a {
                    color: #00FFFF;
                    text-decoration: none;
                    background-image: linear-gradient(rgba(0, 255, 255, 0.4), rgba(0, 255, 255, 0.4));
                    background-position: 0% 100%;
                    background-repeat: no-repeat;
                    background-size: 100% 1px;
                    transition: all 0.2s ease;
                }
                .log-detail__content a:hover {
                    color: #fff;
                    background-size: 100% 100%;
                    background-image: linear-gradient(rgba(0, 255, 255, 0.8), rgba(0, 255, 255, 0.8));
                    padding: 0 2px;
                    margin: 0 -2px;
                    border-radius: 2px;
                }
                .log-detail__content blockquote {
                    position: relative;
                    margin: 1.5em 0;
                    padding: 16px 20px;
                    background: rgba(0, 255, 255, 0.05);
                    border-left: 4px solid rgba(0, 255, 255, 0.8);
                    border-radius: 0 8px 8px 0;
                    color: rgba(255, 255, 255, 0.75);
                    word-wrap: break-word; /* Ensure blockquote itself handles long words gracefully */
                }
                .log-detail__content blockquote p:last-child {
                    margin-bottom: 0;
                }
                .log-detail__content ul,
                .log-detail__content ol {
                    padding-left: 24px;
                    margin-top: 0;
                    margin-bottom: 1.5em;
                }
                .log-detail__content li {
                    margin: 8px 0;
                }
                .log-detail__content ul li {
                    list-style-type: disc;
                }
                .log-detail__content ol li {
                    list-style-type: decimal;
                }
                .log-detail__content ul ul li,
                .log-detail__content ol ul li {
                    list-style-type: circle;
                }
                .log-detail__content li::marker {
                    color: rgba(0, 255, 255, 0.6);
                }
                .log-detail__content li > p {
                    margin-bottom: 0; /* Remove gap within list items to prevent huge line spacing */
                }
                
                /* Images */
                .log-detail__content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    margin: 1em 0;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                
                /* Inline Code */
                .log-detail__inline-code {
                    font-family: 'JetBrains Mono', 'LXGW WenKai Mono', monospace;
                    font-size: 0.85em;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 4px;
                    padding: 0.2em 0.4em;
                    color: #e5e7eb;
                    word-break: break-all; /* Allow breaking long codes exactly where they overflow */
                    white-space: pre-wrap; /* Preserve spaces if any */
                }

                /* Custom Code Block with Header */
                .log-detail__code-wrapper {
                    margin: 1.5em 0;
                    background: #111116; /* Very dark background for the code itself */
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                .log-detail__code-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 8px 16px;
                }
                .log-detail__code-lang {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-family: 'JetBrains Mono', 'LXGW WenKai Mono', monospace;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .log-detail__code-copy {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: none;
                    border: 1px solid transparent;
                    color: rgba(255, 255, 255, 0.4);
                    font-family: 'JetBrains Mono', 'LXGW WenKai Mono', monospace;
                    font-size: 11px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .log-detail__code-copy:hover {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.1);
                }
                .log-detail__code-copy.copied {
                    color: #60ff60;
                    border-color: rgba(96, 255, 96, 0.3);
                    background: rgba(96, 255, 96, 0.1);
                }

                /* Custom Code Block Scrollbar */
                .log-detail__code-wrapper div::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .log-detail__code-wrapper div::-webkit-scrollbar-track {
                    background: transparent;
                }
                .log-detail__code-wrapper div::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 4px;
                }
                .log-detail__code-wrapper div::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 255, 255, 0.4);
                }


                /* Tables */
                .log-detail__content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 2em 0;
                    font-size: 0.9em;
                    overflow-x: auto;
                    display: block; /* To handle horizontal scroll on small screens */
                }
                .log-detail__content th {
                    background: rgba(255, 255, 255, 0.05);
                    color: #f3f4f6;
                    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
                    font-weight: 600;
                    text-align: left;
                    padding: 12px 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .log-detail__content td {
                    padding: 12px 16px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.75);
                }
                .log-detail__content tr:nth-child(even) td {
                    background: rgba(255, 255, 255, 0.02);
                }
                .log-detail__content tr:hover td {
                    background: rgba(0, 255, 255, 0.03);
                }
                
                .log-detail__content hr {
                    border: none;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.1);
                    margin: 3em 0;
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
                    color: rgba(0, 255, 255, 0.6);
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
                    color: rgba(0, 255, 255, 0.7);
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
