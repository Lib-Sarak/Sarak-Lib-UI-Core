import React, { useEffect, useState } from 'react';
import { SarakShellNav, type ShellNavItem } from '../atomic/Navigation/SarakShellNav';
import { SarakIcon } from '../atomic/Icon/SarakIcon';
import { useFocusTrap } from '../atomic/Modals/hooks/useFocusTrap';
import { SarakIconButton } from '../atomic/Buttons/SarakIconButton';
import { SarakScrim } from '../atomic/Buttons/SarakScrim';
import { ChromeFrame } from './chrome/ChromeFrame';
import { ChromeSidebarSlot, ChromeTopbarSlot } from './chrome/ChromeSlots';

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
 * Slots no celular (Spec 48 — L2): `banner`/`footer` seguem faixas full-width (mesma
 * moldura do desktop, só mais estreitas); `sidebarHeader`/`sidebarFooter` migram para o
 * **drawer** (é onde a sidebar existe aqui); `topbarStart`/`topbarEnd` compactam na barra
 * (`min-w-0`, sem empurrar o hambúrguer); `decoration` fica atrás, `aria-hidden` e sem
 * captura de foco/toque. Nada estoura a largura da tela.
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
    /** Slot `topbarEnd` (alias legado `topbarActions`) — fim da barra compacta. */
    topbarActions?: React.ReactNode;
    /** Slot `topbarStart` — início da barra compacta, logo após a marca. */
    topbarStart?: React.ReactNode;
    /** Slot `sidebarHeader` — migra para o topo do drawer (a sidebar do celular). */
    sidebarHeader?: React.ReactNode;
    /** Slot `sidebarFooter` — migra para o rodapé do drawer. */
    sidebarFooter?: React.ReactNode;
    /** Slot `banner` — faixa full-width no topo. */
    banner?: React.ReactNode;
    /** Slot `footer` — faixa full-width na base. */
    footer?: React.ReactNode;
    /** Slot `decoration` — camada decorativa atrás do cromo (aria-hidden, sem foco/toque). */
    decoration?: React.ReactNode;
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
    topbarStart,
    sidebarHeader,
    sidebarFooter,
    banner,
    footer,
    decoration,
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
        <ChromeFrame decoration={decoration} banner={banner} footer={footer} className={className} rootStyle={rootStyle}>
            <header
                className="relative flex items-center gap-2 px-4 shrink-0 border-b"
                style={{
                    height: 'var(--sarak-topbar-height, 64px)',
                    background: 'var(--sarak-topbar-bg, var(--theme-sidebar-bg, transparent))',
                    borderColor: 'var(--border-color, var(--theme-border, rgba(255,255,255,0.1)))',
                }}
            >
                <SarakIconButton
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls={DRAWER_ID}
                    aria-label={open ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
                    className="shrink-0 rounded-[var(--sarak-card-radius,8px)] cursor-pointer text-[var(--sarak-text-main,var(--color-theme-title,inherit))] hover:bg-[var(--sarak-card-bg,rgba(255,255,255,0.06))]"
                    style={{ width: 'var(--sarak-topbar-height, 44px)', height: 'var(--sarak-topbar-height, 44px)' }}
                    icon={<SarakIcon name={open ? 'X' : 'Menu'} size={22} />}
                />
                {brand}
                <ChromeTopbarSlot region="start" className="overflow-hidden">{topbarStart}</ChromeTopbarSlot>
                {topbarActions && <div data-sarak-slot="topbarEnd" className="flex items-center gap-2 shrink-0 ml-auto">{topbarActions}</div>}
            </header>

            {open && (
                <React.Fragment>
                    <SarakScrim onClose={close} ariaLabel="Fechar menu de navegação" />
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
                        <ChromeSidebarSlot region="header">{sidebarHeader}</ChromeSidebarSlot>
                        <SarakShellNav items={nav} activeRoute={activeRoute} onNavigate={handleSelect} orientation="vertical" className="flex-1" />
                        <ChromeSidebarSlot region="footer">{sidebarFooter}</ChromeSidebarSlot>
                    </aside>
                </React.Fragment>
            )}

            <main className="relative flex-1 min-w-0 min-h-0 overflow-auto" style={{ color: 'var(--text-main, var(--color-theme-title, inherit))' }}>
                {children}
            </main>
        </ChromeFrame>
    );
};

export default SarakAppChromeMobile;
