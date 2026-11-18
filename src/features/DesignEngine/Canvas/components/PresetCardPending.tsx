import React from 'react';
import type { SarakThemeCatalogEntry } from '../../../../core/Design/presets/themes';
import { OptionTile } from './OptionTile';
import { THEME_FRAME } from './PresetCard';
import type { PeekHandler, PeekTokens } from './peek';

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
 * A opção de um tema ainda NÃO carregado: desenhada só com o catálogo leve (nome, descrição, amostra de cor do modo pedido),
 * no mesmo tamanho da miniatura real. Vira `PresetCard` quando o `design` chega; escolhida antes disso, carrega o tema e aplica.
 */
export const PresetCardPending: React.FC<PresetCardPendingProps> = ({ entry, currentMode, onChoose, peekTokens, onPeek }) => {
    const swatch = entry.mode === currentMode ? entry.swatch : entry.swatchOpposite;
    return (
        <OptionTile
            name={entry.name}
            description={entry.description}
            onApply={onChoose}
            peekTokens={peekTokens ?? noTokens}
            onPeek={onPeek}
            frameWidth={THEME_FRAME.width}
            frameHeight={THEME_FRAME.height}
            buttonProps={{ 'data-theme-id': entry.id, 'aria-busy': 'true' }}
        >
            <div data-testid="theme-swatch" className="flex h-full w-full items-end gap-5 p-10" style={{ backgroundColor: swatch.colorBgBody }}>
                <span className="h-16 w-48 rounded-full" style={{ backgroundColor: swatch.primaryColor }} />
                <span className="h-8 w-64 rounded-full" style={{ backgroundColor: swatch.textColorMaster, opacity: 0.5 }} />
            </div>
        </OptionTile>
    );
};
