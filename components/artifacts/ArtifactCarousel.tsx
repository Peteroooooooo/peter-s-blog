import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ArtifactCard } from './ArtifactCard';
import { Artifact } from '../../types';

interface ArtifactCarouselProps {
    artifacts: Artifact[];
    selectedIndex: number;
    onSelectIndex: (index: number) => void;
    onOpenDetail: (artifact: Artifact) => void;
}

export const ArtifactCarousel: React.FC<ArtifactCarouselProps> = ({
    artifacts,
    selectedIndex,
    onSelectIndex,
    onOpenDetail,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const count = artifacts.length;
    if (count === 0) return null;

    // Spring physics (only spring settle, no free momentum)
    const positionRef = useRef(0);
    const velocityRef = useRef(0);
    const targetRef = useRef(0);
    const rafRef = useRef<number>(0);
    const lastSelectedRef = useRef(-1);
    const [, forceRender] = useState(0);

    // Spring tuning
    const SPRING_K = 120;
    const SPRING_D = 17;
    const SETTLE_EPS = 0.0008;

    // Scroll accumulator for discrete navigation
    const scrollAccumRef = useRef(0);
    const SCROLL_THRESHOLD = 80; // pixels of scroll delta to trigger one card move

    const wrapIndex = useCallback((i: number) => ((i % count) + count) % count, [count]);

    const dispatchArtifactSelect = useCallback((index: number) => {
        const artifact = artifacts[index];
        if (artifact) {
            window.dispatchEvent(new CustomEvent('artifact-select', { detail: artifact }));
        }
    }, [artifacts]);

    // Navigate by N cards (positive = forward, negative = backward)
    const navigateBy = useCallback((delta: number) => {
        targetRef.current += delta;
    }, []);

    // Pure spring animation loop (no free momentum — much more stable)
    useEffect(() => {
        let prev = performance.now();
        const tick = (now: number) => {
            const dt = Math.min((now - prev) / 1000, 0.032);
            prev = now;

            const displacement = positionRef.current - targetRef.current;
            const springForce = -SPRING_K * displacement;
            const dampingForce = -SPRING_D * velocityRef.current;
            velocityRef.current += (springForce + dampingForce) * dt;
            positionRef.current += velocityRef.current * dt;

            // Settle
            if (Math.abs(displacement) < SETTLE_EPS && Math.abs(velocityRef.current) < SETTLE_EPS) {
                positionRef.current = targetRef.current;
                velocityRef.current = 0;
            }

            // Track selection changes
            const currentSel = wrapIndex(Math.round(positionRef.current));
            if (currentSel !== lastSelectedRef.current) {
                lastSelectedRef.current = currentSel;
                onSelectIndex(currentSel);
                dispatchArtifactSelect(currentSel);
            }

            forceRender(t => t + 1);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [count, wrapIndex, onSelectIndex, dispatchArtifactSelect]);

    useEffect(() => { dispatchArtifactSelect(0); }, [dispatchArtifactSelect]);

    // Scroll → discrete card navigation (like Apple picker wheel)
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            scrollAccumRef.current += e.deltaY;

            // When accumulated enough, move one card
            if (scrollAccumRef.current > SCROLL_THRESHOLD) {
                navigateBy(1);
                scrollAccumRef.current = 0;
            } else if (scrollAccumRef.current < -SCROLL_THRESHOLD) {
                navigateBy(-1);
                scrollAccumRef.current = 0;
            }
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [navigateBy]);

    // Click to select
    const handleCardClick = useCallback((cardIndex: number) => {
        const nearest = Math.round(positionRef.current);
        const currentSel = wrapIndex(nearest);
        if (currentSel === cardIndex) {
            onOpenDetail(artifacts[cardIndex]);
            return;
        }
        let diff = cardIndex - currentSel;
        if (diff > count / 2) diff -= count;
        if (diff < -count / 2) diff += count;
        targetRef.current = nearest + diff;
        velocityRef.current = 0;
    }, [count, wrapIndex, artifacts]);

    // Render
    const VISIBLE = 2;
    const pos = positionRef.current;
    const center = Math.round(pos);
    const currentSelected = wrapIndex(center);

    const cards: React.ReactElement[] = [];
    for (let i = -VISIBLE; i <= VISIBLE; i++) {
        const rawIdx = center + i;
        const wrappedIdx = wrapIndex(rawIdx);
        const offset = rawIdx - pos;
        if (Math.abs(offset) > 2) continue;
        cards.push(
            <ArtifactCard
                key={`card-${rawIdx}`}
                artifact={artifacts[wrappedIdx]}
                isSelected={Math.abs(offset) < 0.5}
                position={offset < -0.3 ? 'above' : offset > 0.3 ? 'below' : 'center'}
                offset={offset}
                onClick={() => handleCardClick(wrappedIdx)}
            />
        );
    }

    // Progress
    const progressFraction = ((pos % count) + count) % count / count;
    const thumbHeight = 100 / count;
    const thumbTop = progressFraction * (100 - thumbHeight);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
            }}
        >
            {cards}

            {/* Cyberpunk neon scroll indicator */}
            <div style={{
                position: 'absolute',
                right: '2px',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '140px',
                width: '3px',
                borderRadius: '1.5px',
                background: 'rgba(0,255,255,0.08)',
                overflow: 'hidden',
                boxShadow: '0 0 4px rgba(0,255,255,0.05)',
            }}>
                <div style={{
                    position: 'absolute',
                    top: `${thumbTop}%`,
                    left: 0,
                    width: '100%',
                    height: `${thumbHeight}%`,
                    borderRadius: '1.5px',
                    background: 'rgba(0,255,255,0.8)',
                    boxShadow: '0 0 6px rgba(0,255,255,0.6), 0 0 12px rgba(0,255,255,0.3)',
                }} />
            </div>
        </div>
    );
};
