'use client';

import React from 'react';

const SEGMENT_COUNT = 34;
const SEGMENT_SPACING = 12;
const HEAD_FOLLOW_EASING = 0.16;
const TAIL_DAMPING = 0.22;

interface DragonSegment {
  x: number;
  y: number;
  angle: number;
}

export default function CursorTrail() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const mouseRef = React.useRef({ x: -300, y: -300 });
  const headRef = React.useRef({ x: -300, y: -300, angle: 0 });
  const segmentsRef = React.useRef<DragonSegment[]>([]);
  const rafRef = React.useRef<number>(0);
  const timeRef = React.useRef(0);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('ontouchstart' in window && navigator.maxTouchPoints > 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const initializeDragon = () => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      headRef.current = { x: centerX, y: centerY, angle: 0 };
      mouseRef.current = { x: centerX, y: centerY };

      segmentsRef.current = Array.from({ length: SEGMENT_COUNT }, (_, i) => ({
        x: centerX - i * SEGMENT_SPACING,
        y: centerY,
        angle: 0,
      }));
    };
    initializeDragon();

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

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const drawDragon = (now: number) => {
      timeRef.current = now * 0.001;
      const t = timeRef.current;
      const { innerWidth: w, innerHeight: h } = window;
      ctx.clearRect(0, 0, w, h);

      const head = headRef.current;
      const segments = segmentsRef.current;

      const toMouseX = mouseRef.current.x - head.x;
      const toMouseY = mouseRef.current.y - head.y;
      head.x += toMouseX * HEAD_FOLLOW_EASING;
      head.y += toMouseY * HEAD_FOLLOW_EASING;
      head.angle = Math.atan2(toMouseY, toMouseX);

      segments[0].x += (head.x - segments[0].x) * 0.65;
      segments[0].y += (head.y - segments[0].y) * 0.65;
      segments[0].angle = head.angle;

      for (let i = 1; i < segments.length; i++) {
        const prev = segments[i - 1];
        const seg = segments[i];
        const dx = prev.x - seg.x;
        const dy = prev.y - seg.y;
        const angle = Math.atan2(dy, dx);

        const tx = prev.x - Math.cos(angle) * SEGMENT_SPACING;
        const ty = prev.y - Math.sin(angle) * SEGMENT_SPACING;

        seg.x += (tx - seg.x) * TAIL_DAMPING;
        seg.y += (ty - seg.y) * TAIL_DAMPING;
        seg.angle = angle;
      }

      for (let i = segments.length - 1; i > 0; i--) {
        const seg = segments[i];
        const widthFactor = 1 - i / segments.length;
        const radius = 1 + widthFactor * 4;
        const alpha = 0.05 + widthFactor * 0.28;

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, radius, 0, Math.PI * 2);
        ctx.fill();

        if (i < segments.length - 1) {
          const next = segments[i + 1];
          ctx.strokeStyle = `rgba(180, 180, 180, ${alpha * 0.7})`;
          ctx.lineWidth = Math.max(0.8, radius * 0.5);
          ctx.beginPath();
          ctx.moveTo(seg.x, seg.y);
          ctx.lineTo(next.x, next.y);
          ctx.stroke();
        }
      }

      for (let i = 2; i < 16; i++) {
        const seg = segments[i];
        const spread = 8 + i * 2.1;
        const wingSway = Math.sin(t * 8 - i * 0.55) * (0.2 + i * 0.03);

        const leftAngle = seg.angle - 1.7 + wingSway;
        const rightAngle = seg.angle + 1.7 - wingSway;

        const lx = seg.x + Math.cos(leftAngle) * spread;
        const ly = seg.y + Math.sin(leftAngle) * spread;
        const rx = seg.x + Math.cos(rightAngle) * spread;
        const ry = seg.y + Math.sin(rightAngle) * spread;

        const wingAlpha = 0.06 + (1 - i / 16) * 0.4;
        ctx.strokeStyle = `rgba(90, 90, 90, ${wingAlpha})`;
        ctx.lineWidth = Math.max(0.9, 2.6 - i * 0.08);

        ctx.beginPath();
        ctx.moveTo(seg.x, seg.y);
        ctx.quadraticCurveTo(
          seg.x + Math.cos(seg.angle - 0.8) * (spread * 0.45),
          seg.y + Math.sin(seg.angle - 0.8) * (spread * 0.45),
          lx,
          ly,
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(seg.x, seg.y);
        ctx.quadraticCurveTo(
          seg.x + Math.cos(seg.angle + 0.8) * (spread * 0.45),
          seg.y + Math.sin(seg.angle + 0.8) * (spread * 0.45),
          rx,
          ry,
        );
        ctx.stroke();
      }

      const headX = segments[0].x;
      const headY = segments[0].y;
      const headAngle = segments[0].angle;

      ctx.save();
      ctx.translate(headX, headY);
      ctx.rotate(headAngle);

      ctx.fillStyle = 'rgba(10, 10, 10, 0.96)';
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.quadraticCurveTo(5, -8, -8, -7);
      ctx.quadraticCurveTo(-11, 0, -8, 7);
      ctx.quadraticCurveTo(5, 8, 16, 0);
      ctx.fill();

      ctx.fillStyle = 'rgba(240, 240, 240, 0.88)';
      ctx.beginPath();
      ctx.ellipse(4, -2.8, 1.8, 1.3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.moveTo(7.5, 0);
      ctx.lineTo(16, -2.2);
      ctx.lineTo(16, 2.2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      rafRef.current = requestAnimationFrame(drawDragon);
    };

    rafRef.current = requestAnimationFrame(drawDragon);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
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
