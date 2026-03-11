'use client';

import React from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  id?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomDropdown({
  id,
  options,
  value,
  onChange,
  placeholder = 'Auswählen ...',
}: CustomDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape, keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((prev) => !prev);
    } else if (e.key === 'ArrowDown' && open) {
      e.preventDefault();
      const currentIdx = options.findIndex((o) => o.value === value);
      const nextIdx = Math.min(currentIdx + 1, options.length - 1);
      onChange(options[nextIdx].value);
    } else if (e.key === 'ArrowUp' && open) {
      e.preventDefault();
      const currentIdx = options.findIndex((o) => o.value === value);
      const prevIdx = Math.max(currentIdx - 1, 0);
      onChange(options[prevIdx].value);
    }
  };

  return (
    <div ref={containerRef} className="relative" id={id}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`w-full px-4 py-2.5 bg-[var(--background)] border rounded-lg text-left flex items-center justify-between gap-2 transition-all duration-300 outline-none cursor-pointer ${
          open
            ? 'border-[var(--border-strong)] ring-1 ring-[var(--border-strong)]'
            : 'border-[var(--border)] hover:border-[var(--border-strong)]'
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selectedOption ? 'text-[var(--foreground)]' : 'text-[var(--text-subtle)]'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1.5 w-full max-h-56 overflow-auto rounded-lg border border-[var(--border-strong)] bg-[var(--surface-raised)] shadow-lg backdrop-blur-xl py-1"
          style={{
            animation: 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors duration-150 flex items-center justify-between ${
                  isSelected
                    ? 'text-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]'
                    : 'text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
