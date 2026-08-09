import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SarakButton } from '../Buttons/SarakButton';

/** `border-radius` por variante (equivalente ao `rounded-*` que cada uma usava). Zero
 *  hardcode (R2): `--sarak-button-radius` é token real, mesmo default (8px = 0.5rem). */
const TAB_RADIUS: Record<SarakTabsProps['variant'] & string, string> = {
    underlined: '0px',
    pills: 'var(--sarak-button-radius, 8px)',
    enclosed: 'var(--sarak-button-radius, 8px) var(--sarak-button-radius, 8px) 0 0',
};

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
    // Navegação por teclado (Spec 41, Regra 3 — WAI-ARIA tabs): setas movem para a aba
    // habilitada anterior/próxima; Home/End vão para a primeira/última. Pula desabilitadas.
    const moveTo = (start: number, step: number): void => {
        const total = tabs.length;
        let idx = start;
        for (let i = 0; i < total; i++) {
            idx = (idx + step + total) % total;
            if (tabs[idx] && !tabs[idx].disabled) {
                onChange(tabs[idx].id);
                return;
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number): void => {
        if (e.key === 'ArrowRight') { e.preventDefault(); moveTo(index, 1); return; }
        if (e.key === 'ArrowLeft') { e.preventDefault(); moveTo(index, -1); return; }
        if (e.key === 'Home') { e.preventDefault(); moveTo(-1, 1); return; }
        if (e.key === 'End') { e.preventDefault(); moveTo(tabs.length, -1); }
    };

    return (
        <div className={twMerge("w-full flex", className)} style={{ flexDirection: 'column' }}>
            <div
                className={twMerge(
                    "flex items-center",
                    variant === 'underlined' && "border-b border-[var(--theme-border)]",
                    variant === 'pills' && "bg-black/10 rounded-xl",
                    listClassName
                )}
                style={
                    variant === 'underlined' ? { gap: 'calc(var(--sarak-layout-gap-md, 16px) * 1.5)' }
                    : variant === 'pills' ? { gap: 'var(--sarak-layout-gap-sm, 8px)', padding: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)' }
                    : variant === 'enclosed' ? { gap: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)' }
                    : undefined
                }
                role="tablist"
            >
                {tabs.map((tab, index) => {
                    const isActive = activeTab === tab.id;
                    const isDisabled = tab.disabled;

                    // Composição atômica (R10 — Spec 18/lote 10): `SarakButton` tolera montar
                    // sem Provider. `textTransform`/`fontWeight`/`letterSpacing`/`borderRadius`
                    // vão por `style` (vence a classe do átomo) para neutralizar o `font-black
                    // uppercase tracking-widest` e o `rounded-btn` que o átomo aplica por
                    // padrão. Os dois indicadores (`motion.div`, absolutos) viajam em
                    // `leftIcon`/`rightIcon` — mesma posição de irmão que tinham no `<button>`
                    // original; o rótulo vai em `children`, único filho de texto do átomo.
                    return (
                        <SarakButton
                            key={tab.id}
                            role="tab"
                            aria-selected={isActive}
                            aria-disabled={isDisabled}
                            disabled={isDisabled}
                            tabIndex={isActive ? 0 : -1}
                            variant="ghost"
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onClick={() => !isDisabled && onChange(tab.id)}
                            style={{
                                gap: 'var(--sarak-layout-gap-sm, 8px)',
                                paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.625)',
                                paddingInline: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)',
                                borderRadius: TAB_RADIUS[variant],
                                textTransform: 'none',
                                fontWeight: 700,
                                letterSpacing: 'normal',
                            }}
                            className={clsx(
                                "relative text-sm transition-colors",
                                fullWidth ? "flex-1" : "",
                                isDisabled && "opacity-50 cursor-not-allowed",
                                // Variants
                                variant === 'underlined' && [
                                    "hover:text-[var(--color-theme-title,#ffffff)]",
                                    isActive ? "text-[var(--theme-primary)]" : "text-[var(--theme-muted)]"
                                ],
                                variant === 'pills' && [
                                    "z-10",
                                    isActive ? "text-white" : "text-[var(--theme-muted)] hover:text-[var(--color-theme-title,#ffffff)]"
                                ],
                                variant === 'enclosed' && [
                                    "border-t border-x border-transparent",
                                    isActive
                                        ? "bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--color-theme-title,#ffffff)] z-10"
                                        : "bg-black/10 text-[var(--theme-muted)] hover:text-[var(--color-theme-title,#ffffff)] hover:bg-black/20"
                                ]
                            )}
                            leftIcon={
                                <>
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
                                </>
                            }
                            rightIcon={
                                variant === 'underlined' && isActive ? (
                                    <motion.div
                                        layoutId="sarak-tabs-underline"
                                        className="absolute bottom-[length:calc(var(--sarak-border-width,1px)*-1)] left-0 right-0 h-[length:var(--sarak-border-width,2px)] bg-[var(--theme-primary)]"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                ) : undefined
                            }
                        >
                            {tab.label}
                        </SarakButton>
                    );
                })}
            </div>
        </div>
    );
};
