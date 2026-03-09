"use client"

import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Custom hook for click outside detection
function useClickAway(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler()
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handler])
}

// Types
export interface DropdownItem {
  id: string
  label: string
  icon?: React.ElementType
  color?: string
}

interface FluidDropdownProps {
  items: DropdownItem[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

// Icon wrapper with animation
const IconWrapper = ({
  icon: Icon,
  isHovered,
  color,
}: { icon: React.ElementType; isHovered: boolean; color: string }) => {
  const IconComp = Icon as React.FC<React.SVGProps<SVGSVGElement>>;
  return (
    <motion.div
      className="w-4 h-4 mr-2 relative"
      initial={false}
      animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
    >
      <IconComp className="w-4 h-4" />
      {isHovered && (
        <motion.div
          className="absolute inset-0"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <IconComp className="w-4 h-4" strokeWidth={2} />
        </motion.div>
      )}
    </motion.div>
  )
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren" as const,
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
}

export function FluidDropdown({
  items,
  value,
  onChange,
  placeholder = "Select...",
  className,
}: FluidDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  useClickAway(dropdownRef, () => setIsOpen(false))

  const selectedItem = items.find((item) => item.id === value)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  const activeId = hoveredId || value
  const activeIndex = items.findIndex((c) => c.id === activeId)

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("w-full relative", className)} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full inline-flex items-center justify-between rounded-xl text-sm font-medium transition-all duration-200 ease-in-out",
            "px-4 py-2.5 h-[42px]",
            "bg-[var(--background)] border border-[var(--border)]",
            "text-[var(--text-muted)]",
            "hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]",
            "focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400",
            "cursor-pointer",
            isOpen && "bg-[var(--surface-hover)] text-[var(--foreground)] border-rose-400/50",
          )}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className="flex items-center">
            {selectedItem?.icon && (
              <IconWrapper
                icon={selectedItem.icon}
                isHovered={false}
                color={selectedItem.color || "#fb7185"}
              />
            )}
            {selectedItem?.label || placeholder}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center w-5 h-5 ml-2"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{
                opacity: 1,
                y: 0,
                height: "auto",
                transition: {
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 1,
                },
              }}
              exit={{
                opacity: 0,
                y: -4,
                height: 0,
                transition: {
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 1,
                },
              }}
              className="absolute left-0 right-0 top-full mt-2 z-[999]"
              onKeyDown={handleKeyDown}
            >
              <motion.div
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-1 shadow-lg shadow-black/20"
                initial={{ borderRadius: 12 }}
                style={{ transformOrigin: "top" }}
              >
                <motion.div
                  className="py-1 relative"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Animated highlight */}
                  {activeIndex >= 0 && (
                    <motion.div
                      layoutId="fluid-dropdown-highlight"
                      className="absolute inset-x-1 bg-[var(--surface-hover)] rounded-lg"
                      animate={{
                        y: activeIndex * 36 + 4,
                        height: 36,
                      }}
                      transition={{
                        type: "spring",
                        bounce: 0.15,
                        duration: 0.4,
                      }}
                    />
                  )}

                  {items.map((item) => (
                    <motion.button
                      key={item.id}
                      onClick={() => {
                        onChange(item.id)
                        setIsOpen(false)
                      }}
                      onHoverStart={() => setHoveredId(item.id)}
                      onHoverEnd={() => setHoveredId(null)}
                      className={cn(
                        "relative flex w-full items-center px-3 py-2 text-sm rounded-lg",
                        "transition-colors duration-150",
                        "focus:outline-none cursor-pointer",
                        value === item.id || hoveredId === item.id
                          ? "text-[var(--foreground)]"
                          : "text-[var(--text-muted)]",
                      )}
                      whileTap={{ scale: 0.98 }}
                      variants={itemVariants}
                    >
                      {item.icon && (
                        <IconWrapper
                          icon={item.icon}
                          isHovered={hoveredId === item.id}
                          color={item.color || "#fb7185"}
                        />
                      )}
                      {item.label}
                      {value === item.id && (
                        <motion.div
                          className="ml-auto"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
