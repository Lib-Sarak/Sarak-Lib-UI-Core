import React from 'react';
import { motion } from 'framer-motion';
import { SarakMenuItem } from '../../../components/atomic/Navigation/SarakMenuItem';
import { IconRenderer } from './IconRenderer';
import { DiscoveredModule } from '../../../core/Discovery/types';
import { useLibraryText } from '../../i18n/useLibraryText';

export interface SidebarNavModuleItemProps {
    mod: DiscoveredModule;
    isActive: boolean;
    effectiveIsNavHidden: boolean;
    onSelect: (id: string) => void;
    t: ReturnType<typeof useLibraryText>;
}

/**
 * Companion de `SidebarNav.tsx` (00-mapa-do-modulo §5.2) — extraído para o teto
 * de 250 linhas do Clean Code (R9). Uma linha da sidebar, com o estado offline e
 * o marcador do item ativo (`navActiveMarkerColor`/`Glow`, Spec 05 §2.4).
 */
export const SidebarNavModuleItem: React.FC<SidebarNavModuleItemProps> = ({
    mod, isActive, effectiveIsNavHidden, onSelect, t,
}) => {
    const isOffline = mod.status === 'offline';

    return (
        <SarakMenuItem
            onClick={() => !isOffline && onSelect(mod.id)}
            disabled={isOffline}
            active={isActive}
            collapsed={effectiveIsNavHidden}
            title={isOffline ? t('sidebarOfflineModuleTitle', { error: mod.error || t('sidebarOfflineDefaultError') }) : mod.label}
            icon={<IconRenderer name={mod.icon} className={isActive ? 'text-[var(--sarak-nav-active-color,#00f2ff)]' : 'text-[var(--theme-muted)]'} />}
            label={mod.label}
            // Sem `text-*` aqui: o `tone` do próprio SarakMenuItem já pinta o
            // ativo com `--sarak-nav-active-color` — repetir venceria por R35.
            className={`relative group font-tab ${
                isActive ? 'bg-[var(--sarak-sidebar-active-color,rgba(var(--theme-primary-rgb),0.1))] shadow-[inset_0_0_20px_rgba(var(--theme-primary-rgb),0.05)]' : ''
            } ${isOffline ? 'border border-dashed border-[var(--theme-border)]' : ''}`}
        >
            {isOffline && !effectiveIsNavHidden && (
                <span className="shrink-0 text-3xs text-[var(--theme-error)] font-bold uppercase tracking-wider">{t('sidebarOfflineBadge')}</span>
            )}
            {isActive && (
                <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-4 rounded-full"
                    style={{
                        background: 'var(--sarak-nav-marker-color, #00f2ff)',
                        boxShadow: '0 0 calc(var(--sarak-nav-marker-glow, 10) * 1px) var(--sarak-nav-marker-color, #00f2ff)', // sarak-allow-hardcode: 1px converte slider unitless
                    }}
                />
            )}
            {isOffline && <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--theme-error)] animate-pulse shadow-[0_0_5px_var(--theme-error)]" />}
        </SarakMenuItem>
    );
};

export default SidebarNavModuleItem;
