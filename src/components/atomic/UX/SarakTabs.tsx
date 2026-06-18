import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SarakTabItem {
    id: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export interface SarakTabsProps {
    tabs: SarakTabItem[];
    activeTab: string;
    onChange: (tabId: string) => void;
    /** Estilo de exibição das abas */
    variant?: 'pills' | 'underlined' | 'enclosed';
    /** Preencher a largura toda? */
    fullWidth?: boolean;
    className?: string;
    listClassName?: string;
}

export const SarakTabs: React.FC<SarakTabsProps> = ({
    tabs,
    activeTab,
    onChange,
    variant = 'underlined',
    fullWidth = false,
    className,
    listClassName,
}) => {
    return (
        <div className={twMerge("w-full flex flex-col", className)}>
            <div 
                className={twMerge(
                    "flex items-center",
                    variant === 'underlined' && "border-b border-[var(--theme-border)] gap-6",
                    variant === 'pills' && "gap-2 p-1 bg-black/10 rounded-xl",
                    variant === 'enclosed' && "gap-1",
                    listClassName
                )}
                role="tablist"
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const isDisabled = tab.disabled;

                    return (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={isActive}
                            aria-disabled={isDisabled}
                            disabled={isDisabled}
                            onClick={() => !isDisabled && onChange(tab.id)}
                            className={clsx(
                                "relative flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-bold transition-colors",
                                fullWidth ? "flex-1" : "",
                                isDisabled && "opacity-50 cursor-not-allowed",
                                // Variants
                                variant === 'underlined' && [
                                    "hover:text-[var(--theme-text)]",
                                    isActive ? "text-[var(--theme-primary)]" : "text-[var(--theme-muted)]"
                                ],
                                variant === 'pills' && [
                                    "rounded-lg z-10",
                                    isActive ? "text-white" : "text-[var(--theme-muted)] hover:text-[var(--theme-text)]"
                                ],
                                variant === 'enclosed' && [
                                    "rounded-t-lg border-t border-x border-transparent",
                                    isActive 
                                        ? "bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text)] z-10" 
                                        : "bg-black/10 text-[var(--theme-muted)] hover:text-[var(--theme-text)] hover:bg-black/20"
                                ]
                            )}
                        >
                            {/* Active Indicator for Pills */}
                            {variant === 'pills' && isActive && (
                                <motion.div
                                    layoutId="sarak-tabs-pill"
                                    className="absolute inset-0 bg-[var(--theme-primary)] rounded-lg -z-10 shadow-md"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}

                            {tab.icon && (
                                <span className={clsx(
                                    "transition-colors", 
                                    isActive && variant === 'underlined' && "text-[var(--theme-primary)]"
                                )}>
                                    {tab.icon}
                                </span>
                            )}
                            
                            <span>{tab.label}</span>

                            {/* Active Indicator for Underlined */}
                            {variant === 'underlined' && isActive && (
                                <motion.div
                                    layoutId="sarak-tabs-underline"
                                    className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--theme-primary)]"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
