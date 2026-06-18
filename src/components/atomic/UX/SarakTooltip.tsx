import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export interface SarakTooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    className?: string;
    /** Se true, desativa o tooltip */
    disabled?: boolean;
}

export const SarakTooltip: React.FC<SarakTooltipProps> = ({
    children,
    content,
    position = 'top',
    delay = 300,
    className,
    disabled = false
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const show = () => {
        if (disabled) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
    };

    const hide = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const positionStyles = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
    };

    const arrowStyles = {
        top: "bottom-[-4px] left-1/2 -translate-x-1/2 border-t-[var(--theme-surface)] border-x-transparent border-b-transparent",
        bottom: "top-[-4px] left-1/2 -translate-x-1/2 border-b-[var(--theme-surface)] border-x-transparent border-t-transparent",
        left: "right-[-4px] top-1/2 -translate-y-1/2 border-l-[var(--theme-surface)] border-y-transparent border-r-transparent",
        right: "left-[-4px] top-1/2 -translate-y-1/2 border-r-[var(--theme-surface)] border-y-transparent border-l-transparent",
    };

    const initialAnimation = {
        top: { opacity: 0, y: 5 },
        bottom: { opacity: 0, y: -5 },
        left: { opacity: 0, x: 5 },
        right: { opacity: 0, x: -5 },
    };

    return (
        <div 
            className="relative inline-flex"
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
        >
            {children}

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={initialAnimation[position]}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={initialAnimation[position]}
                        transition={{ duration: 0.15 }}
                        className={twMerge(
                            "absolute z-50 px-2.5 py-1.5 text-xs font-bold whitespace-nowrap",
                            "bg-[var(--theme-surface)] text-[var(--theme-text)]",
                            "border border-[var(--theme-border)] shadow-lg rounded-md pointer-events-none",
                            positionStyles[position],
                            className
                        )}
                        role="tooltip"
                    >
                        {content}
                        
                        {/* Seta do tooltip */}
                        <div 
                            className={twMerge(
                                "absolute w-0 h-0 border-[5px]",
                                arrowStyles[position]
                            )}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
