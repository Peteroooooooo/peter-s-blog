import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogEntry, LogCategory } from '../types';
import { logs, getAllCategories } from '../content/logs';
import { Clock, Search, Terminal, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

// Category color map — shared between filter tags and entry badges
const CATEGORY_COLORS: Record<LogCategory, string> = {
    [LogCategory.DEV]: '#60ff60',
    [LogCategory.RESEARCH]: '#a78bfa',
    [LogCategory.SYSTEM]: '#fbbf24',
    [LogCategory.THOUGHTS]: '#00FFFF',
    [LogCategory.TUTORIAL]: '#f472b6',
    [LogCategory.HARDWARE]: '#fb923c',
};

export const Logs: React.FC = () => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<LogCategory | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
    const [isEntered, setIsEntered] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Entry animation
    useEffect(() => {
        const timer = setTimeout(() => setIsEntered(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Filtered logs
    const filteredLogs = logs.filter(log => {
        const matchesCategory = activeFilter === 'ALL' || log.category === activeFilter;
        const matchesSearch = searchQuery === '' ||
            log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (log.tags && log.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesCategory && matchesSearch;
    });

    const displayedLogs = filteredLogs.slice(0, displayCount);
    const hasMore = displayCount < filteredLogs.length;

    // Infinite scroll
    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore) {
            setDisplayCount(prev => prev + ITEMS_PER_PAGE);
        }
    }, [hasMore]);

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '100px',
            threshold: 0,
        });
        if (loadMoreRef.current) observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [handleObserver]);

    // Reset display count when filter/search changes
    useEffect(() => {
        setDisplayCount(ITEMS_PER_PAGE);
    }, [activeFilter, searchQuery]);

    const categories = getAllCategories();

    return (
        <div className={`logs-page ${isEntered ? 'logs-page--visible' : ''}`}>
            <div className="logs-page__container">

                {/* ══════ Terminal Header with HUD ══════ */}
                <header className="logs-page__header">
                    <div className="logs-page__header-left">
                        {/* HUD decorative corner */}
                        <div className="logs-page__hud-corner logs-page__hud-corner--tl" />
                        <div className="logs-page__header-title">
                            <Terminal size={14} className="logs-page__header-icon" />
                            <span>PETER.BLOG // DATA_LOGS</span>
                            <span className="logs-page__cursor" />
                        </div>
                        <div className="logs-page__header-sub">
                            THOUGHT_STREAM // ENCRYPTED_CHANNEL
                        </div>
                    </div>
                    <div className="logs-page__header-right">
                        <div className="logs-page__header-stat">
                            <span className="logs-page__header-stat-label">ENTRIES</span>
                            <span className="logs-page__header-stat-value">{filteredLogs.length}</span>
                        </div>
                        <div className="logs-page__header-stat">
                            <span className="logs-page__header-stat-label">STATUS</span>
                            <span className="logs-page__header-stat-online">● LIVE</span>
                        </div>
                    </div>
                </header>

                {/* Separator with glow */}
                <div className="logs-page__separator logs-page__separator--main" />

                {/* ══════ Filter Bar ══════ */}
                <div className="logs-page__filter-bar">
                    <span className="logs-page__filter-prompt">&gt; FILTER:</span>
                    <button
                        className={`logs-page__filter-tag ${activeFilter === 'ALL' ? 'logs-page__filter-tag--active' : ''}`}
                        onClick={() => setActiveFilter('ALL')}
                        style={{
                            '--tag-color': '#00FFFF',
                        } as React.CSSProperties}
                    >
                        [ALL]
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`logs-page__filter-tag ${activeFilter === cat ? 'logs-page__filter-tag--active' : ''}`}
                            onClick={() => setActiveFilter(cat)}
                            style={{
                                '--tag-color': CATEGORY_COLORS[cat],
                            } as React.CSSProperties}
                        >
                            [{cat}]
                        </button>
                    ))}
                </div>

                {/* ══════ Search Bar ══════ */}
                <div className="logs-page__search-bar">
                    <span className="logs-page__search-prompt">&gt; SEARCH:</span>
                    <div className="logs-page__search-input-wrapper">
                        <Search size={12} className="logs-page__search-icon" />
                        <input
                            type="text"
                            className="logs-page__search-input"
                            placeholder="query..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Separator */}
                <div className="logs-page__separator logs-page__separator--double" />

                {/* ══════ Log Entries ══════ */}
                <div className="logs-page__entries">
                    {displayedLogs.length === 0 ? (
                        <div className="logs-page__empty">
                            <span>&gt; NO_ENTRIES_FOUND</span>
                            <span className="logs-page__empty-sub">Try adjusting your filter or search query.</span>
                        </div>
                    ) : (
                        displayedLogs.map((log, index) => (
                            <div
                                key={log.id}
                                className="logs-page__entry"
                                style={{
                                    animationDelay: `${index * 60}ms`,
                                    '--entry-color': CATEGORY_COLORS[log.category],
                                } as React.CSSProperties}
                                onClick={() => navigate(`/logs/${log.id}`)}
                            >
                                {/* Timeline connector */}
                                <div className="logs-page__timeline">
                                    <div className="logs-page__timeline-dot" />
                                    <div className="logs-page__timeline-line">
                                        <div className="logs-page__timeline-flow" />
                                    </div>
                                </div>

                                {/* Entry content */}
                                <div className="logs-page__entry-content">
                                    {/* Scanline hover overlay */}
                                    <div className="logs-page__entry-scanline" />

                                    {/* Meta row */}
                                    <div className="logs-page__entry-meta">
                                        <span className="logs-page__entry-date">{log.date}</span>
                                        <span className="logs-page__entry-arrow">▸</span>
                                        <span className="logs-page__entry-id">{log.id}</span>
                                        <span className="logs-page__entry-category">
                                            [{log.category}]
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="logs-page__entry-title">{log.title}</h2>

                                    {/* Preview */}
                                    <p className="logs-page__entry-preview">{log.preview}</p>

                                    {/* Footer */}
                                    <div className="logs-page__entry-footer">
                                        <span className="logs-page__entry-time">
                                            <Clock size={11} /> {log.readTime}
                                        </span>
                                        {log.tags && (
                                            <div className="logs-page__entry-tags">
                                                {log.tags.map(tag => (
                                                    <span key={tag} className="logs-page__entry-tag">#{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                        <span className="logs-page__entry-read">[READ] <ChevronRight size={12} className="logs-page__entry-chevron" /></span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Infinite scroll sentinel */}
                    {hasMore && (
                        <div ref={loadMoreRef} className="logs-page__loading">
                            <div className="logs-page__loading-bar" />
                            <span>LOADING_MORE_ENTRIES...</span>
                            <div className="logs-page__loading-bar" />
                        </div>
                    )}

                    {!hasMore && displayedLogs.length > 0 && (
                        <div className="logs-page__end">
                            &gt; END_OF_LOG_STREAM // {filteredLogs.length} ENTRIES LOADED
                        </div>
                    )}
                </div>
            </div>


            <style>{`
                .logs-page {
                    min-height: 100vh;
                    padding-top: 80px;
                    padding-bottom: 80px;
                    pointer-events: auto;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: opacity 0.6s ease, transform 0.6s ease;
                }
                .logs-page--visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .logs-page__container {
                    max-width: 780px;
                    margin: 0 auto;
                    padding: 0 24px;
                    font-family: 'JetBrains Mono', 'LXGW WenKai Mono', monospace;
                }

                /* ════════ HEADER ════════ */
                .logs-page__header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 12px;
                    position: relative;
                }
                .logs-page__header-left {
                    position: relative;
                }
                .logs-page__hud-corner--tl {
                    position: absolute;
                    top: -4px;
                    left: -8px;
                    width: 12px;
                    height: 12px;
                    border-top: 2px solid rgba(0, 255, 255, 0.4);
                    border-left: 2px solid rgba(0, 255, 255, 0.4);
                }
                .logs-page__header-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.8);
                    letter-spacing: 0.15em;
                }
                .logs-page__header-icon {
                    color: #00FFFF;
                    filter: drop-shadow(0 0 4px rgba(0, 255, 255, 0.5));
                }
                .logs-page__cursor {
                    display: inline-block;
                    width: 8px;
                    height: 16px;
                    background: #00FFFF;
                    animation: cursorBlink 1s step-end infinite;
                    margin-left: 2px;
                    box-shadow: 0 0 6px rgba(0, 255, 255, 0.6);
                }
                @keyframes cursorBlink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
                .logs-page__header-sub {
                    font-size: 10px;
                    color: rgba(0, 255, 255, 0.3);
                    letter-spacing: 0.12em;
                    margin-top: 4px;
                }
                .logs-page__header-right {
                    display: flex;
                    gap: 20px;
                    text-align: right;
                }
                .logs-page__header-stat {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .logs-page__header-stat-label {
                    font-size: 8px;
                    color: rgba(255, 255, 255, 0.2);
                    letter-spacing: 0.2em;
                }
                .logs-page__header-stat-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.7);
                }
                .logs-page__header-stat-online {
                    font-size: 11px;
                    color: #60ff60;
                    animation: subtlePulse 2s ease-in-out infinite;
                }
                @keyframes subtlePulse {
                    0%, 100% { opacity: 0.7; }
                    50% { opacity: 1; }
                }

                /* ════════ SEPARATORS ════════ */
                .logs-page__separator {
                    height: 1px;
                    background: linear-gradient(to right, rgba(0, 255, 255, 0.3), rgba(0, 255, 255, 0.05));
                    margin-bottom: 16px;
                }
                .logs-page__separator--main {
                    height: 1px;
                    position: relative;
                }
                .logs-page__separator--main::after {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: 0;
                    width: 60px;
                    height: 5px;
                    background: linear-gradient(to right, rgba(0, 255, 255, 0.4), transparent);
                    filter: blur(2px);
                }
                .logs-page__separator--double {
                    height: 1px;
                    background: linear-gradient(to right, rgba(0, 255, 255, 0.5), rgba(0, 255, 255, 0.02));
                    margin-bottom: 28px;
                    box-shadow: 0 0 12px rgba(0, 255, 255, 0.15);
                    position: relative;
                }

                /* ════════ FILTER BAR ════════ */
                .logs-page__filter-bar {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 5px;
                    margin-bottom: 12px;
                }
                .logs-page__filter-prompt {
                    font-size: 11px;
                    color: rgba(0, 255, 255, 0.5);
                    margin-right: 4px;
                }
                .logs-page__filter-tag {
                    background: none;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    color: var(--tag-color, rgba(255,255,255,0.35));
                    opacity: 0.5;
                    font-family: 'JetBrains Mono', 'LXGW WenKai Mono', monospace;
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    padding: 3px 8px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }
                .logs-page__filter-tag:hover {
                    opacity: 0.85;
                    border-color: var(--tag-color, rgba(0, 255, 255, 0.3));
                }
                .logs-page__filter-tag--active {
                    opacity: 1;
                    border-color: var(--tag-color, #00FFFF);
                    background: color-mix(in srgb, var(--tag-color, #00FFFF) 10%, transparent);
                    box-shadow: 0 0 10px color-mix(in srgb, var(--tag-color, #00FFFF) 25%, transparent);
                }

                /* ════════ SEARCH BAR ════════ */
                .logs-page__search-bar {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                .logs-page__search-prompt {
                    font-size: 11px;
                    color: rgba(0, 255, 255, 0.5);
                    flex-shrink: 0;
                }
                .logs-page__search-input-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex: 1;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    padding-bottom: 4px;
                    transition: border-color 0.3s;
                }
                .logs-page__search-input-wrapper:focus-within {
                    border-color: rgba(0, 255, 255, 0.4);
                }
                .logs-page__search-icon {
                    color: rgba(255, 255, 255, 0.2);
                    flex-shrink: 0;
                }
                .logs-page__search-input {
                    background: none;
                    border: none;
                    outline: none;
                    font-family: 'JetBrains Mono', 'LXGW WenKai Mono', monospace;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                    width: 100%;
                    caret-color: #00FFFF;
                }
                .logs-page__search-input::placeholder {
                    color: rgba(255, 255, 255, 0.12);
                }

                /* ════════ ENTRIES ════════ */
                .logs-page__entries {
                    position: relative;
                }
                .logs-page__empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 60px 0;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.3);
                }
                .logs-page__empty-sub {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.15);
                    margin-top: 8px;
                }

                /* ════════ SINGLE ENTRY ════════ */
                .logs-page__entry {
                    display: flex;
                    gap: 16px;
                    cursor: pointer;
                    padding: 4px 0;
                    opacity: 0;
                    animation: logEntryIn 0.5s ease forwards;
                }
                @keyframes logEntryIn {
                    from { opacity: 0; transform: translateX(-12px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                /* ════════ TIMELINE ════════ */
                .logs-page__timeline {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 14px;
                    flex-shrink: 0;
                    padding-top: 6px;
                }
                .logs-page__timeline-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    border: 2px solid rgba(255, 255, 255, 0.12);
                    background: #050505;
                    flex-shrink: 0;
                    transition: all 0.3s ease;
                    z-index: 1;
                    position: relative;
                }
                /* Pulse ring on dot */
                .logs-page__timeline-dot::after {
                    content: '';
                    position: absolute;
                    inset: -4px;
                    border-radius: 50%;
                    border: 1px solid transparent;
                    transition: all 0.3s ease;
                }
                .logs-page__timeline-line {
                    width: 1px;
                    flex: 1;
                    background: rgba(255, 255, 255, 0.15); /* Increased from 0.04 */
                    position: relative;
                    overflow: hidden;
                }
                /* Flowing data pulse on line */
                .logs-page__timeline-flow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 20px;
                    background: linear-gradient(to bottom, transparent, var(--entry-color, #00FFFF), transparent);
                    opacity: 0;
                    animation: dataFlow 3s ease-in-out infinite;
                }
                @keyframes dataFlow {
                    0% { transform: translateY(-20px); opacity: 0; }
                    30% { opacity: 0.4; }
                    70% { opacity: 0.4; }
                    100% { transform: translateY(120px); opacity: 0; }
                }

                /* Hover states for timeline */
                .logs-page__entry:hover .logs-page__timeline-dot {
                    border-color: var(--entry-color, #00FFFF);
                    background: var(--entry-color, #00FFFF);
                    box-shadow: 0 0 10px var(--entry-color, rgba(0, 255, 255, 0.6));
                }
                .logs-page__entry:hover .logs-page__timeline-dot::after {
                    border-color: var(--entry-color, rgba(0, 255, 255, 0.3));
                    animation: dotPulse 1.5s ease-out infinite;
                }
                @keyframes dotPulse {
                    0% { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
                .logs-page__entry:hover .logs-page__timeline-line {
                    background: linear-gradient(to bottom, var(--entry-color, rgba(0, 255, 255, 0.3)), rgba(255,255,255,0.04));
                }
                .logs-page__entry:hover .logs-page__timeline-flow {
                    opacity: 0.6;
                }

                /* ════════ ENTRY CONTENT ════════ */
                .logs-page__entry-content {
                    flex: 1;
                    padding: 12px 16px 16px 16px;
                    border: 1px solid rgba(255, 255, 255, 0.03);
                    border-left: 2px solid transparent;
                    margin-bottom: 8px;
                    transition: all 0.35s ease;
                    position: relative;
                    overflow: hidden;
                    background: rgba(255, 255, 255, 0.01);
                }
                .logs-page__entry:hover .logs-page__entry-content {
                    border-color: rgba(255, 255, 255, 0.06);
                    border-left-color: var(--entry-color, #00FFFF);
                    background: rgba(255, 255, 255, 0.025);
                    transform: translateX(6px);
                    box-shadow: 
                        -2px 0 12px color-mix(in srgb, var(--entry-color, #00FFFF) 15%, transparent),
                        inset 0 0 30px rgba(0, 0, 0, 0.3);
                }

                /* Scanline overlay on hover */
                .logs-page__entry-scanline {
                    position: absolute;
                    inset: 0;
                    background: repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 2px,
                        rgba(0, 255, 255, 0.015) 2px,
                        rgba(0, 255, 255, 0.015) 4px
                    );
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                    z-index: 1;
                }
                .logs-page__entry:hover .logs-page__entry-scanline {
                    opacity: 1;
                }

                /* ════════ META ROW ════════ */
                .logs-page__entry-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    font-size: 11px;
                    position: relative;
                    z-index: 2;
                }
                .logs-page__entry-date {
                    color: var(--entry-color, rgba(0, 255, 255, 0.9)); /* Increased from 0.6 */
                    letter-spacing: 0.05em;
                    font-weight: 600;
                }
                .logs-page__entry-arrow {
                    color: rgba(255, 255, 255, 0.3); /* Increased from 0.1 */
                    font-size: 10px;
                }
                .logs-page__entry-id {
                    color: rgba(255, 255, 255, 0.5); /* Increased from 0.18 */
                    letter-spacing: 0.05em;
                }
                .logs-page__entry-category {
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    padding: 2px 6px;
                    border: 1px solid color-mix(in srgb, var(--entry-color, #00FFFF) 25%, transparent);
                    color: var(--entry-color, #00FFFF);
                    background: color-mix(in srgb, var(--entry-color, #00FFFF) 5%, transparent);
                }

                /* ════════ TITLE ════════ */
                .logs-page__entry-title {
                    font-family: 'Rajdhani', 'LXGW WenKai Mono', sans-serif;
                    font-size: 21px;
                    font-weight: 700;
                    color: #fff; /* Increased from 0.88 */
                    margin: 0 0 6px 0;
                    line-height: 1.3;
                    transition: all 0.3s ease;
                    position: relative;
                    z-index: 2;
                }
                .logs-page__entry:hover .logs-page__entry-title {
                    color: #fff;
                    text-shadow: 0 0 25px color-mix(in srgb, var(--entry-color, #00FFFF) 40%, transparent);
                }

                /* ════════ PREVIEW ════════ */
                .logs-page__entry-preview {
                    font-family: 'Rajdhani', 'LXGW WenKai Mono', sans-serif;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.65); /* Increased from 0.32 */
                    line-height: 1.6;
                    margin: 0 0 10px 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    position: relative;
                    z-index: 2;
                }

                /* ════════ FOOTER ════════ */
                .logs-page__entry-footer {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 10px;
                    position: relative;
                    z-index: 2;
                }
                .logs-page__entry-time {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: rgba(255, 255, 255, 0.5); /* Increased from 0.18 */
                }
                .logs-page__entry-tags {
                    display: flex;
                    gap: 6px;
                    flex: 1;
                }
                .logs-page__entry-tag {
                    color: rgba(255, 255, 255, 0.45); /* Increased from 0.15 */
                    font-size: 10px;
                    transition: color 0.3s;
                }
                .logs-page__entry:hover .logs-page__entry-tag {
                    color: rgba(0, 255, 255, 0.7); /* Increased from 0.35 */
                }
                .logs-page__entry-read {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    color: rgba(255, 255, 255, 0.45); /* Increased from 0.1 */
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                }
                .logs-page__entry:hover .logs-page__entry-read {
                    color: var(--entry-color, #00FFFF);
                }
                .logs-page__entry-chevron {
                    transition: transform 0.3s ease;
                }
                .logs-page__entry:hover .logs-page__entry-chevron {
                    transform: translateX(4px);
                }

                /* ════════ LOADING ════════ */
                .logs-page__loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 24px;
                    font-size: 10px;
                    color: rgba(0, 255, 255, 0.4);
                    letter-spacing: 0.1em;
                }
                .logs-page__loading-bar {
                    width: 40px;
                    height: 2px;
                    background: linear-gradient(to right, transparent, rgba(0, 255, 255, 0.4), transparent);
                    animation: loadingPulse 1.5s ease-in-out infinite;
                }
                @keyframes loadingPulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }

                /* End of stream */
                .logs-page__end {
                    text-align: center;
                    padding: 32px;
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.12);
                    letter-spacing: 0.1em;
                }



                /* ════════ MOBILE ════════ */
                @media (max-width: 640px) {
                    .logs-page {
                        padding-top: 70px;
                    }

                    .logs-page__container {
                        padding: 0 16px;
                    }
                    .logs-page__header {
                        flex-direction: column;
                        gap: 8px;
                    }
                    .logs-page__header-right {
                        flex-direction: row;
                        gap: 16px;
                    }
                    .logs-page__entry-meta {
                        flex-wrap: wrap;
                    }
                    .logs-page__entry-title {
                        font-size: 17px;
                    }
                    .logs-page__entry-content {
                        padding: 10px 12px 12px 12px;
                    }
                }
            `}</style>
        </div>
    );
};