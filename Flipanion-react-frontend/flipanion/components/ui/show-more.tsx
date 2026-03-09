"use client";

import React from "react";

interface ShowMoreProps {
  expanded: boolean;
  onClick: () => void;
  className?: string;
}

export const ShowMore = ({ expanded = false, onClick, className = "" }: ShowMoreProps) => {
  return (
    <div className={`w-full flex items-center justify-center min-h-[30px] ${className}`}>
      <div className="rounded-[99px] bg-[var(--background)]">
        <button
          type="button"
          className="h-8 px-4 text-sm rounded-[100px] text-[var(--foreground)] font-sans bg-[var(--surface)] font-medium border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors duration-150 cursor-pointer"
          onClick={onClick}
        >
          <span className="text-nowrap inline-block">
            <div className="flex items-center">
              {expanded ? "Weniger anzeigen" : "Mehr anzeigen"}
              <span className={`inline-flex ml-1.5 duration-200${expanded ? " rotate-180" : ""}`}>
                <svg
                  height="16"
                  strokeLinejoin="round"
                  viewBox="0 0 16 16"
                  width="16"
                  className="fill-current"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.0607 6.74999L11.5303 7.28032L8.7071 10.1035C8.31657 10.4941 7.68341 10.4941 7.29288 10.1035L4.46966 7.28032L3.93933 6.74999L4.99999 5.68933L5.53032 6.21966L7.99999 8.68933L10.4697 6.21966L11 5.68933L12.0607 6.74999Z"
                  />
                </svg>
              </span>
            </div>
          </span>
        </button>
      </div>
    </div>
  );
};
