
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../store';

class Impact {
    x: number; y: number; life: number; maxLife: number; color: string; maxRadius: number;
    constructor(x: number, y: number, color: string, speed: number) {
        this.x = x; this.y = y; this.color = color; this.life = 0; this.maxLife = 20;
        this.maxRadius = speed * 3;
    }
    update() { this.life++; }
    draw(ctx: CanvasRenderingContext2D) {
        const progress = this.life / this.maxLife;
        const alpha = 1 - progress;
        const size = 2 + progress * this.maxRadius;

        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.globalAlpha = alpha * 0.8; ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, size, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = alpha; ctx.strokeStyle = this.color; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(this.x, this.y, size, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.shadowBlur = 0; // Reset
    }
}

class Particle {
    x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string;
    history: { x: number, y: number }[]; size: number; initialSpeed: number;
    constructor(x: number, y: number, color: string, speedFactor: number) {
        this.x = x; this.y = y; this.color = color; this.initialSpeed = speedFactor;
        const speed = Math.random() * 4 + 2;
        if (Math.random() > 0.5) { this.vx = Math.random() > 0.5 ? speed : -speed; this.vy = 0; }
        else { this.vx = 0; this.vy = Math.random() > 0.5 ? speed : -speed; }

        this.life = 0;

        // Speed Factor: Low (slow mouse) -> Short life (dim). High (fast mouse) -> Long life (bright).
        // TUNED: Saturate at speed 20 (medium speed) instead of 50
        const intensity = Math.min(speedFactor, 20) / 10;
        this.maxLife = 15 + (intensity * 60) + (Math.random() * 10);

        this.history = [{ x, y }]; this.size = Math.random() * 2 + 1;
    }
    update() {
        this.x += this.vx; this.y += this.vy; this.life++;
        if (this.life % 2 === 0) {
            this.history.push({ x: this.x, y: this.y });
            if (this.history.length > 10) this.history.shift();
        }
        if (Math.random() < 0.05) {
            const isDiagonal = this.vx !== 0 && this.vy !== 0;
            if (isDiagonal) { if (Math.random() > 0.5) this.vx = 0; else this.vy = 0; }
            else {
                const speed = Math.max(Math.abs(this.vx), Math.abs(this.vy));
                if (this.vx !== 0) this.vy = Math.random() > 0.5 ? speed : -speed;
                else this.vx = Math.random() > 0.5 ? speed : -speed;
            }
        }
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath(); ctx.strokeStyle = this.color;

        // Life progress (fades out over time)
        const lifeRatio = 1 - (this.life / this.maxLife);

        // CONTRAST BOOST: Map maxLife to Opacity/Brightness
        // maxLife ranges roughly from 15 (slow) to 85 (fast)
        // We map this to an opacity multiplier of 0.3 to 1.0
        const brightness = Math.min(1, Math.max(0.3, this.maxLife / 80));

        const alpha = lifeRatio * brightness;

        ctx.globalAlpha = Math.max(0, alpha); ctx.lineWidth = this.size;

        // Add Glow - Scale glow with brightness too
        ctx.shadowBlur = 5 * brightness;
        ctx.shadowColor = this.color;

        if (this.history.length > 0) {
            ctx.moveTo(this.history[0].x, this.history[0].y);
            for (let i = 1; i < this.history.length; i++) ctx.lineTo(this.history[i].x, this.history[i].y);
            ctx.lineTo(this.x, this.y);
        }
        ctx.stroke(); ctx.globalAlpha = 1;
        ctx.shadowBlur = 0; // Reset
    }
}

interface Target {
    id: string;
    isComplex: boolean;
    rect: { x: number; y: number; w: number; h: number };
    polygon?: { x: number; y: number }[];
}

export const ElectricOverlay: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const impacts = useRef<Impact[]>([]);

    const targets = useRef<Target[]>([]);
    const allTargets = useRef<Target[]>([]);
    const location = useLocation();
    const isHomeRef = useRef(location.pathname === '/');
    const isArtifactsRef = useRef(location.pathname === '/artifacts');
    const isLogsRef = useRef(location.pathname.startsWith('/logs'));
    const isAboutRef = useRef(location.pathname === '/about');

    useEffect(() => {
        isHomeRef.current = location.pathname === '/';
        isArtifactsRef.current = location.pathname === '/artifacts';
        isLogsRef.current = location.pathname.startsWith('/logs');
        isAboutRef.current = location.pathname === '/about';
    }, [location.pathname]);

    const CYNA_COLOR = '#00FFFF';
    const GOLD_COLOR = '#FFBF00';
    const getRandomColor = () => Math.random() > 0.5 ? CYNA_COLOR : GOLD_COLOR;

    const isInsidePolygon = (x: number, y: number, polygon: { x: number, y: number }[]) => {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    };

    const getConvexHull = (points: { x: number, y: number }[]) => {
        if (points.length <= 2) return points;
        points.sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);
        const upper = [], lower = [];
        const crossProduct = (a: any, b: any, c: any) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
        for (const p of points) {
            while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
            upper.push(p);
        }
        for (let i = points.length - 1; i >= 0; i--) {
            const p = points[i];
            while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
            lower.push(p);
        }
        upper.pop(); lower.pop();
        return upper.concat(lower);
    };

    const updateStaticTargets = () => {
        const elements = document.querySelectorAll('[data-circuit-target]:not([data-circuit-target="core-center"])');
        const newStaticTargets: Target[] = [];
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            newStaticTargets.push({
                id: el.getAttribute('data-circuit-target') || 'unknown',
                isComplex: false,
                rect: { x: rect.left, y: rect.top, w: rect.width, h: rect.height }
            });
        });
        targets.current = newStaticTargets; // Initialize with static targets
    };

    // Cache Mutable State for 3D Cube (avoid DOM read every frame)
    const cubeState = useRef({ rotX: -20, rotY: 45, isOverclocked: false });

    useEffect(() => {
        const handleRotationUpdate = (e: any) => {
            if (e.detail) {
                cubeState.current.rotX = e.detail.rotation.x;
                cubeState.current.rotY = e.detail.rotation.y;
                cubeState.current.isOverclocked = e.detail.isOverclocked;
            }
        };
        window.addEventListener('circuit-rotation-update', handleRotationUpdate);
        return () => window.removeEventListener('circuit-rotation-update', handleRotationUpdate);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        let animationFrameId: number;
        let lastX = 0, lastY = 0;
        let step = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            updateStaticTargets(); // Only scan static DOM on resize
        };
        window.addEventListener('resize', resize);
        // Also update targets on scroll to keep positions sync
        window.addEventListener('scroll', updateStaticTargets);
        resize();

        const checkIfInsideTarget = (x: number, y: number) => {
            for (const t of allTargets.current) {
                if (t.isComplex && t.polygon) {
                    if (isInsidePolygon(x, y, t.polygon)) return true;
                } else {
                    if (x >= t.rect.x && x <= t.rect.x + t.rect.w && y >= t.rect.y && y <= t.rect.y + t.rect.h) {
                        return true;
                    }
                }
            }
            return false;
        };

        const handleMouseMove = (e: MouseEvent) => {
            // Disable particles on Artifacts, Logs, and About pages
            if (isArtifactsRef.current || isLogsRef.current || isAboutRef.current) return;

            if (checkIfInsideTarget(e.clientX, e.clientY)) return;

            const dist = Math.sqrt(Math.pow(e.clientX - lastX, 2) + Math.pow(e.clientY - lastY, 2));
            if (dist > 1) {
                step++;
                if (step % 3 === 0) { // Throttling: only generate 1 particle every 5 valid steps
                    // Pass distance as speed factor
                    particles.current.push(new Particle(e.clientX, e.clientY, getRandomColor(), dist));
                }
                lastX = e.clientX; lastY = e.clientY;
            }

        };
        const handleClick = (e: MouseEvent) => {
            // Disable click particles on Artifacts, Logs, and About pages
            if (isArtifactsRef.current || isLogsRef.current || isAboutRef.current) return;

            if (checkIfInsideTarget(e.clientX, e.clientY)) return;
            for (let i = 0; i < 15; i++) particles.current.push(new Particle(e.clientX, e.clientY, getRandomColor(), 50));
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleClick);

        const render = () => {
            // OPTIMIZED TARGET UPDATE: 
            // 1. Start with cached static targets
            const currentTargets = [...targets.current];

            // 2. Calculate Dynamic Cube (Math-only, no DOM reads)
            const { rotX, rotY, isOverclocked } = cubeState.current;
            const rX = rotX * (Math.PI / 180);
            const rY = rotY * (Math.PI / 180);
            const winCX = window.innerWidth / 2;
            const winCY = window.innerHeight / 2;
            const size = 224; const s = size / 2;
            const dist = 1000; const transY = isOverclocked ? 128 : 0;
            const vertices = [
                { x: -s, y: -s, z: s }, { x: s, y: -s, z: s }, { x: s, y: s, z: s }, { x: -s, y: s, z: s },
                { x: -s, y: -s, z: -s }, { x: s, y: -s, z: -s }, { x: s, y: s, z: -s }, { x: -s, y: s, z: -s }
            ];
            const projectedPoints = vertices.map(v => {
                let x1 = v.x * Math.cos(rY) + v.z * Math.sin(rY);
                let z1 = -v.x * Math.sin(rY) + v.z * Math.cos(rY);
                let y2 = v.y * Math.cos(rX) - z1 * Math.sin(rX);
                let z2 = v.y * Math.sin(rX) + z1 * Math.cos(rX);
                const scale = dist / (dist - z2);
                return { x: x1 * scale + winCX, y: (y2 + transY) * scale + winCY };
            });

            // Add Cube to targets ONLY if on Homepage
            if (isHomeRef.current) {
                currentTargets.push({
                    id: 'core', isComplex: true, rect: { x: 0, y: 0, w: 0, h: 0 }, // polygon is what matters
                    polygon: getConvexHull(projectedPoints)
                });
            }
            allTargets.current = currentTargets;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = impacts.current.length - 1; i >= 0; i--) {
                const imp = impacts.current[i]; imp.update(); imp.draw(ctx);
                if (imp.life >= imp.maxLife) impacts.current.splice(i, 1);
            }
            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i]; p.update(); p.draw(ctx);
                let hit = false;
                for (const t of currentTargets) {
                    if (t.isComplex && t.polygon) {
                        if (isInsidePolygon(p.x, p.y, t.polygon)) { hit = true; break; }
                    } else {
                        if (p.x >= t.rect.x && p.x <= t.rect.x + t.rect.w && p.y >= t.rect.y && p.y <= t.rect.y + t.rect.h) { hit = true; break; }
                    }
                }
                if (hit) {
                    // Impact based on remaining energy: (initialSpeed * remainingRatio)
                    // Scale factor 0.4 ensures the visual size matches expected range (2-6 -> 10-30 radius)
                    const remainingRatio = 1 - (p.life / p.maxLife);
                    const impactForce = Math.max(2, p.initialSpeed * remainingRatio * 0.4);
                    impacts.current.push(new Impact(p.x, p.y, p.color, impactForce));
                    particles.current.splice(i, 1); continue;
                }
                if (Math.random() < 0.01 && particles.current.length < 100) {
                    // Split particles inherit CURRENT energy (decayed by age)
                    const remainingRatio = 1 - (p.life / p.maxLife);
                    const currentSpeed = p.initialSpeed * remainingRatio;

                    const splitP = new Particle(p.x, p.y, p.color, currentSpeed);
                    if (p.vx !== 0 && p.vy === 0) { splitP.vx = 0; splitP.vy = Math.random() > 0.5 ? Math.abs(p.vx) : -Math.abs(p.vx); }
                    else if (p.vx === 0 && p.vy !== 0) { splitP.vy = 0; splitP.vx = Math.random() > 0.5 ? Math.abs(p.vy) : -Math.abs(p.vy); }
                    particles.current.push(splitP);
                }
                if (p.life >= p.maxLife) particles.current.splice(i, 1);
            }
            animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('scroll', updateStaticTargets);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleClick);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
};
