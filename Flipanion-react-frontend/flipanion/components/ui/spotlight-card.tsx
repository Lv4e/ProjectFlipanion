"use client";

import React, { useCallback, useRef, useState, ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
}

const glowColorMap = {
  blue: { hue: 220 },
  purple: { hue: 280 },
  green: { hue: 120 },
  red: { hue: 340 },
  orange: { hue: 30 },
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96',
};

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  glowColor = 'blue',
  size = 'md',
  width,
  height,
  customSize = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const { hue } = glowColorMap[glowColor];

  const getSizeClasses = () => {
    if (customSize) return '';
    return sizeMap[size];
  };

  const inlineWidth = width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined;
  const inlineHeight = height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined;

  const borderSize = 2;
  const spotlightSize = 250;

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        touchAction: 'none',
        borderRadius: 14,
        width: inlineWidth,
        height: inlineHeight,
      }}
      className={`
        ${getSizeClasses()}
        ${!customSize ? '' : ''}
        group/glow
        ${className}
      `}
    >
      {/* Card background */}
      <div
        className="absolute inset-0 rounded-[inherit] transition-colors duration-200"
        style={{
          backgroundColor: 'hsl(0 0% 8% / 0.9)',
          border: `${borderSize}px solid hsl(0 0% 15% / 0.5)`,
          borderRadius: 'inherit',
        }}
      />

      {/* Border glow — only visible on hover */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          inset: -borderSize,
          border: `${borderSize}px solid transparent`,
          borderRadius: 'inherit',
          backgroundImage: `radial-gradient(
            ${spotlightSize}px ${spotlightSize}px at ${mousePos.x + borderSize}px ${mousePos.y + borderSize}px,
            hsl(${hue} 100% 60% / 0.8),
            transparent 100%
          )`,
          backgroundOrigin: 'border-box',
          backgroundClip: 'border-box',
          mask: 'linear-gradient(#0000, #0000), linear-gradient(#fff, #fff)',
          maskClip: 'padding-box, border-box',
          maskComposite: 'exclude',
          WebkitMask: 'linear-gradient(#0000, #0000) padding-box, linear-gradient(#fff, #fff) border-box',
          WebkitMaskComposite: 'xor',
        } as React.CSSProperties}
      />

      {/* Outer blur glow — only visible on hover */}
      <div
        className="absolute rounded-[inherit] pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.5 : 0,
          inset: -8,
          borderRadius: 'inherit',
          backgroundImage: `radial-gradient(
            ${spotlightSize * 0.8}px ${spotlightSize * 0.8}px at ${mousePos.x + 8}px ${mousePos.y + 8}px,
            hsl(${hue} 100% 50% / 0.35),
            transparent 100%
          )`,
          filter: 'blur(12px)',
        }}
      />

      {/* Subtle background glow on hover */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          borderRadius: 'inherit',
          backgroundImage: `radial-gradient(
            ${spotlightSize * 1.2}px ${spotlightSize * 1.2}px at ${mousePos.x}px ${mousePos.y}px,
            hsl(${hue} 100% 70% / 0.04),
            transparent
          )`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full rounded-[inherit]">
        {children}
      </div>
    </div>
  );
};

export { GlowCard };
