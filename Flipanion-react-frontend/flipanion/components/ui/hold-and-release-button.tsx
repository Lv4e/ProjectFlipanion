"use client";

import * as React from "react"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";
import { useState } from "react";

interface ButtonHoldAndReleaseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    holdDuration?: number;
    onHoldComplete?: () => void;
    holdLabel?: string;
    releaseLabel?: string;
}

function ButtonHoldAndRelease({
    className,
    holdDuration = 3000,
    onHoldComplete,
    holdLabel = "Abmelden",
    releaseLabel = "Loslassen",
    ...props
}: ButtonHoldAndReleaseProps) {
    const [isHolding, setIsHolding] = useState(false);
    const controls = useAnimation();

    async function handleHoldStart() {
        setIsHolding(true);
        controls.set({ width: "0%" });
        await controls.start({
            width: "100%",
            transition: {
                duration: holdDuration / 1000,
                ease: "linear",
            },
        });
        // Hold completed
        onHoldComplete?.();
    }

    function handleHoldEnd() {
        setIsHolding(false);
        controls.stop();
        controls.start({
            width: "0%",
            transition: { duration: 0.1 },
        });
    }

    return (
        <Button
            className={cn(
                "min-w-40 relative overflow-hidden touch-none cursor-pointer",
                "bg-rose-950/60 dark:bg-rose-950/60",
                "hover:bg-rose-900/70 dark:hover:bg-rose-900/70",
                "text-rose-300 dark:text-rose-300",
                "border border-rose-800/50 dark:border-rose-800/50",
                className
            )}
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            onTouchCancel={handleHoldEnd}
            {...props}
        >
            <motion.div
                initial={{ width: "0%" }}
                animate={controls}
                className={cn(
                    "absolute left-0 top-0 h-full",
                    "bg-rose-500/20",
                    "dark:bg-rose-500/20"
                )}
            />
            <span className="relative z-10 w-full flex items-center justify-center gap-2">
                {!isHolding ? holdLabel : releaseLabel}
            </span>
        </Button>
    );
}

export { ButtonHoldAndRelease }
