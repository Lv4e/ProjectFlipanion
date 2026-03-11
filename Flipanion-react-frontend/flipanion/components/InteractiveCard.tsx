'use client';

import React from 'react';

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number; // tilt intensity (default 10)
  glowIntensity?: number; // glow following cursor (default 0.08)
}

/**
 * A card that tilts slightly toward the cursor on hover
 * and shows a radial glow + animated gradient border.
 */
export default function InteractiveCard({
  children,
  className = '',
  intensity = 10,
  glowIntensity = 0.08,
}: InteractiveCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [style, setStyle] = React.useState<React.CSSProperties>({});
  const [borderStyle, setBorderStyle] = React.useState<React.CSSProperties>({});
  const rafRef = React.useRef<number>(0);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width; // 0..1
        const y = (e.clientY - rect.top) / rect.height;
        const rotateX = (0.5 - y) * intensity;
        const rotateY = (x - 0.5) * intensity;

        setStyle({
          transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.015)`,
          background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, color-mix(in srgb, var(--primary) ${glowIntensity * 100}%, transparent) 0%, transparent 55%), color-mix(in srgb, var(--surface) 68%, transparent)`,
        });

        setBorderStyle({
          opacity: 1,
          background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, color-mix(in srgb, var(--primary) 35%, transparent), transparent 70%)`,
        });
      });
    },
    [intensity, glowIntensity],
  );

  const handleMouseLeave = React.useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setStyle({
      transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)',
      background: 'color-mix(in srgb, var(--surface) 68%, transparent)',
    });
    setBorderStyle({ opacity: 0 });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
      style={{
        ...style,
        transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
        willChange: 'transform',
      }}
    >
      {/* Animated border overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          padding: '1px',
          pointerEvents: 'none',
          opacity: (borderStyle.opacity as number) || 0,
          background: (borderStyle.background as string) || 'transparent',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          transition: 'opacity 0.5s ease',
          zIndex: 1,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
