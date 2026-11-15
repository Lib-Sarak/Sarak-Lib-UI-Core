import React from 'react';
import type { SarakThemeCatalogEntry } from '../../../../core/Design/presets/themes';
import { usePeekHandlers, type PeekHandler, type PeekTokens } from './peek';

interface PresetCardPendingProps {
    entry: SarakThemeCatalogEntry;
    currentMode: string;
    /** Chamado ao escolher: carrega o tema e só então o aplica — o atual fica na tela até lá. */
    onChoose: () => void;
    /** O que compor quando o tema chegar: a espiada carrega o tema e só mostra se o mouse ou o foco ainda estiver aqui. */
    peekTokens?: () => PeekTokens;
    onPeek?: PeekHandler;
}

const noTokens = (): null => null;

/**
 * O cartão de um tema ainda NÃO carregado: desenhado só com o catálogo leve
 * (nome, descrição, amostra de cor do modo pedido). Vira `PresetCard` quando o
 * `design` chega; escolhido antes disso, carrega o tema e aplica.
 */
export const PresetCardPending: React.FC<PresetCardPendingProps> = ({ entry, currentMode, onChoose, peekTokens, onPeek }) => {
    const peek = usePeekHandlers(onPeek, peekTokens ?? noTokens);
    const swatch = entry.mode === currentMode ? entry.swatch : entry.swatchOpposite;
    return (
        <button
            type="button"
            onClick={onChoose}
            {...peek}
            data-theme-id={entry.id}
            aria-busy="true"
            className="group relative flex flex-col text-left rounded-2xl border border-theme-border overflow-hidden sarak-card hover:border-theme-primary/50 focus:outline-none"
        >
            <div className="h-48 w-full flex items-end gap-2 p-4" style={{ backgroundColor: swatch.colorBgBody }}>
                <span className="h-4 w-12 rounded-full" style={{ backgroundColor: swatch.primaryColor }} />
                <span className="h-2 w-16 rounded-full" style={{ backgroundColor: swatch.textColorMaster, opacity: 0.5 }} />
            </div>
            <div className="p-4 flex flex-col gap-1">
                <span className="text-xs font-black uppercase tracking-widest text-theme-text">{entry.name}</span>
                <span className="text-[var(--sarak-type-scale3xs,11px)] text-theme-muted line-clamp-2">{entry.description}</span>
            </div>
        </button>
    );
};
