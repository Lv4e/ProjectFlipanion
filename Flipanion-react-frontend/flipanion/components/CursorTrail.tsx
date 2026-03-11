'use client';

import React from 'react';

// ─── Glowing Particle Cursor Trail ───
// Soft luminous particles follow the cursor with physics-based movement.
// Particles emit with slight random velocity, fade and shrink over time.

const MAX_PARTICLES = 50;
const PARTICLE_LIFE = 55; // frames (~0.9s at 60fps)
const SPAWN_RATE = 2; // particles per frame while moving
const SPEED_THRESHOLD = 1.5;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface FollowerState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  scale: number;
  targetScale: number;
  isHovering: boolean;
}

export default function CursorTrail() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const particlesRef = React.useRef<Particle[]>([]);
  const mouseRef = React.useRef({ x: -200, y: -200 });
  const prevMouseRef = React.useRef({ x: -200, y: -200 });
  const speedRef = React.useRef(0);
  const rafRef = React.useRef<number>(0);
  const followerRef = React.useRef<FollowerState>({
    x: -200, y: -200,
    targetX: -200, targetY: -200,
    scale: 1, targetScale: 1,
    isHovering: false,
  });
  const primaryColorRef = React.useRef({ r: 100, g: 148, b: 237 });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('ontouchstart' in window && navigator.maxTouchPoints > 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Read primary color
    const readColor = () => {
      const style = getComputedStyle(document.documentElement);
      const hex = style.getPropertyValue('--primary').trim();
      if (hex.startsWith('#')) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        if (!isNaN(r)) primaryColorRef.current = { r, g, b };
      }
    };
    readColor();
    const observer = new MutationObserver(readColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Canvas resize
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Mouse tracking
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      followerRef.current.targetX = e.clientX;
      followerRef.current.targetY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Interactive element detection
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest('a, button, [role="button"], input, select, textarea, label[for], [data-interactive]');
      followerRef.current.isHovering = !!interactive;
      followerRef.current.targetScale = interactive ? 2.5 : 1;
    };
    document.addEventListener('mouseover', onMouseOver, { passive: true });

    const particles = particlesRef.current;

    // ── Animation loop ──
    const animate = () => {
      const { innerWidth: w, innerHeight: h } = window;
      ctx.clearRect(0, 0, w, h);

      // Calculate speed
      const dx = mouseRef.current.x - prevMouseRef.current.x;
      const dy = mouseRef.current.y - prevMouseRef.current.y;
      const currentSpeed = Math.sqrt(dx * dx + dy * dy);
      speedRef.current += (currentSpeed - speedRef.current) * 0.15;
      prevMouseRef.current.x = mouseRef.current.x;
      prevMouseRef.current.y = mouseRef.current.y;

      const speed = speedRef.current;
      const { r, g, b } = primaryColorRef.current;

      // ── Spawn particles when moving ──
      if (speed > SPEED_THRESHOLD) {
        const count = Math.min(Math.floor(speed * 0.15), SPAWN_RATE);
        for (let i = 0; i < count; i++) {
          if (particles.length >= MAX_PARTICLES) {
            // Recycle oldest
            const oldest = particles.shift()!;
            oldest.x = mouseRef.current.x + (Math.random() - 0.5) * 4;
            oldest.y = mouseRef.current.y + (Math.random() - 0.5) * 4;
            oldest.vx = (Math.random() - 0.5) * 0.6;
            oldest.vy = (Math.random() - 0.5) * 0.6 - 0.2;
            oldest.life = 0;
            oldest.maxLife = PARTICLE_LIFE + Math.random() * 15;
            oldest.size = 1.5 + Math.random() * 2;
            particles.push(oldest);
          } else {
            particles.push({
              x: mouseRef.current.x + (Math.random() - 0.5) * 4,
              y: mouseRef.current.y + (Math.random() - 0.5) * 4,
              vx: (Math.random() - 0.5) * 0.6,
              vy: (Math.random() - 0.5) * 0.6 - 0.2,
              life: 0,
              maxLife: PARTICLE_LIFE + Math.random() * 15,
              size: 1.5 + Math.random() * 2,
            });
          }
        }
      }

      // ── Update and draw particles ──
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        const t = p.life / p.maxLife; // 0..1 progress
        const alpha = (1 - t * t) * 0.35; // quadratic fade
        const size = p.size * (1 - t * 0.6); // shrink

        if (alpha < 0.01) continue;

        // Outer glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
        grad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${alpha * 0.15})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core bright center
        ctx.fillStyle = `rgba(${Math.min(r + 60, 255)}, ${Math.min(g + 60, 255)}, ${Math.min(b + 40, 255)}, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Follower dot ──
      const f = followerRef.current;
      f.x += (f.targetX - f.x) * 0.12;
      f.y += (f.targetY - f.y) * 0.12;
      f.scale += (f.targetScale - f.scale) * 0.1;

      const dotSize = 3.5 * f.scale;
      const dotAlpha = f.isHovering ? 0.12 : 0.25;

      // Ring on hover
      if (f.scale > 1.15) {
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(f.scale - 1) * 0.15})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(f.x, f.y, dotSize * 2.2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Dot glow
      const dotGrad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, dotSize * 2);
      dotGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${dotAlpha * 0.4})`);
      dotGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = dotGrad;
      ctx.beginPath();
      ctx.arc(f.x, f.y, dotSize * 2, 0, Math.PI * 2);
      ctx.fill();

      // Dot core
      ctx.fillStyle = `rgba(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 30, 255)}, ${dotAlpha})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, dotSize, 0, Math.PI * 2);
      ctx.fill();

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    />
  );
}
