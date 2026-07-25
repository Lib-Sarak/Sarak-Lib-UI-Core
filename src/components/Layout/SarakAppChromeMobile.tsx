import React, { useEffect, useState } from 'react';
import { SarakShellNav, type ShellNavItem } from '../atomic/Navigation/SarakShellNav';
import { SarakIcon } from '../atomic/Icon/SarakIcon';
import { useFocusTrap } from '../atomic/Modals/hooks/useFocusTrap';

/**
 * SarakAppChromeMobile — colapso do cromo no celular (Spec 40.3 — L1).
 *
 * No smartphone a navegação NÃO pode comer a tela: em vez da sidebar fixa (240px) ou da
 * topbar que rola, o cromo vira uma **barra compacta** com a marca + um **toggle
 * (hambúrguer)**; a navegação vive atrás dele num **drawer** off-canvas que abre sobre um
 * scrim e o conteúdo ocupa a coluna única full-width. É a árvore de decisão da lib resolvida
 * deterministicamente para o padrão convencional (drawer atrás de hambúrguer) — genérico
 * (serve qualquer quantidade de itens e qualquer `navigationStyle`) e acessível.
 *
 * Acessibilidade: o toggle expõe `aria-expanded`/`aria-controls`/rótulo; o drawer usa
 * `useFocusTrap` (prende o Tab, fecha no ESC e devolve o foco ao toggle); selecionar um item
 * ou clicar no scrim fecha. Zero hardcode: cores/medidas por tokens `--sarak-*` (fallback).
 */
export interface SarakAppChromeMobileProps {
    children: React.ReactNode;
    brand?: React.ReactNode;
    nav: ShellNavItem[];
    activeRoute?: string;
    onNavigate?: (route: string) => void;
    topbarActions?: React.ReactNode;
    className?: string;
    rootStyle: React.CSSProperties;
}

const DRAWER_ID = 'sarak-chrome-drawer';

export const SarakAppChromeMobile: React.FC<SarakAppChromeMobileProps> = ({
    children,
    brand,
    nav,
    activeRoute,
    onNavigate,
    topbarActions,
    className = '',
    rootStyle,
}) => {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    const { containerRef, handleTrap } = useFocusTrap(open, close);

    // Trava o scroll do corpo enquanto o drawer está aberto (não vaza rolagem por baixo).
    useEffect(() => {
        if (!open) return undefined;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previous; };
    }, [open]);

    const handleSelect = (route: string) => {
        close();
        onNavigate?.(route);
    };

    return (
        <div className={`flex flex-col w-full min-h-0 ${className}`} style={rootStyle}>
            <header
                className="flex items-center gap-2 px-4 shrink-0 border-b"
                style={{
                    height: 'var(--sarak-topbar-height, 64px)',
                    background: 'var(--sarak-topbar-bg, var(--theme-sidebar-bg, transparent))',
                    borderColor: 'var(--border-color, var(--theme-border, rgba(255,255,255,0.1)))',
                }}
            >
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls={DRAWER_ID}
                    aria-label={open ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
                    className="flex items-center justify-center shrink-0 rounded-[var(--sarak-card-radius,8px)] cursor-pointer text-[var(--sarak-text-main,var(--color-theme-title,inherit))] hover:bg-[var(--sarak-card-bg,rgba(255,255,255,0.06))] transition-sarak"
                    style={{ width: 'var(--sarak-topbar-height, 44px)', height: 'var(--sarak-topbar-height, 44px)' }}
                >
                    <SarakIcon name={open ? 'X' : 'Menu'} size={22} />
                </button>
                {brand}
                {topbarActions && <div className="flex items-center gap-2 shrink-0 ml-auto">{topbarActions}</div>}
            </header>

            {open && (
                <React.Fragment>
                    <button
                        type="button"
                        aria-label="Fechar menu de navegação"
                        onClick={close}
                        className="fixed inset-0 z-40 border-0 cursor-default"
                        style={{ background: 'var(--sarak-overlay-bg, rgba(0,0,0,0.5))' }}
                    />
                    <aside
                        id={DRAWER_ID}
                        ref={containerRef}
                        onKeyDown={handleTrap}
                        className="fixed inset-y-0 left-0 z-50 flex flex-col shrink-0 border-r overflow-y-auto max-w-[85vw]"
                        style={{
                            width: 'var(--sarak-sidebar-width, 240px)',
                            background: 'var(--sarak-sidebar-bg, var(--theme-sidebar-bg, var(--bg-body, #0f172a)))',
                            borderColor: 'var(--border-color, var(--theme-border, rgba(255,255,255,0.1)))',
                        }}
                    >
                        {brand && <div className="px-2 py-3">{brand}</div>}
                        <SarakShellNav items={nav} activeRoute={activeRoute} onNavigate={handleSelect} orientation="vertical" className="flex-1" />
                    </aside>
                </React.Fragment>
            )}

            <main className="flex-1 min-w-0 min-h-0 overflow-auto" style={{ color: 'var(--text-main, var(--color-theme-title, inherit))' }}>
                {children}
            </main>
        </div>
    );
};

export default SarakAppChromeMobile;
