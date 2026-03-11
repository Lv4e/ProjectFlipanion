'use client';

import React from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number; // magnetic pull strength (default 0.3)
  as?: 'button' | 'div';
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

/**
 * A button/element that magnetically pulls toward the cursor on hover.
 * Includes subtle scale and glow on hover for premium feel.
 */
export default function MagneticButton({
  children,
  className = '',
  strength = 0.3,
  as: Tag = 'button',
  onClick,
  type = 'button',
  disabled,
}: MagneticButtonProps) {
  const ref = React.useRef<HTMLElement>(null);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      setOffset({ x: dx, y: dy });
    },
    [strength],
  );

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setOffset({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  const isActive = offset.x !== 0 || offset.y !== 0;

  const props = {
    ref: ref as React.Ref<HTMLButtonElement | HTMLDivElement>,
    onMouseMove: handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick,
    className,
    style: {
      transform: `translate(${offset.x}px, ${offset.y}px) scale(${isHovered ? 1.03 : 1})`,
      transition: isActive
        ? 'transform 0.15s cubic-bezier(0.22, 1, 0.36, 1)'
        : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
    } as React.CSSProperties,
    ...(Tag === 'button' ? { type, disabled } : {}),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Tag {...(props as any)}>{children}</Tag>;
}
