import { composeThemeDesign } from '../../../core/Design/presets/themes/compose';
import { resolveThemeForMode, type ModeResolvableTheme } from '../../../core/Design/presets/themes/color-engine';
import { PALETTE_CALCULATED_KEYS, applyKeptPalette } from '../../../core/Design/palette/resolve';
import type { SarakDesignState } from '../../../core/Provider/types';

type DesignRecord = Record<string, unknown>;

interface KeepPaletteContext {
    /** O tema do rascunho; sem ele, desligar só abaixa o interruptor. */
    theme: ModeResolvableTheme | undefined;
    hostConfig?: DesignRecord;
}

/** O `colorPalette` e toda cor que a paleta calcula: o que o "manter minha paleta" decide entre o tema e a escolha. */
const paletteSlice = (design: DesignRecord): DesignRecord =>
    Object.fromEntries(['colorPalette', ...PALETTE_CALCULATED_KEYS].filter((id) => design[id] !== undefined).map((id) => [id, design[id]]));

/**
 * O rascunho depois de ligar ou desligar "manter minha paleta" (`previous` é o estado do rascunho, `null` quando ele ainda
 * segue o design aplicado; `fallback` é o que o painel mostra nesse caso). Ligar põe a paleta vigente por cima das cores que
 * o tema declara, para a tela mostrar já o que a troca de tema vai manter. Desligar devolve ao rascunho a paleta e as cores
 * do tema atual; o resto do rascunho (estrutura, ajustes que não são de cor) não muda. Já no estado pedido: `previous`.
 */
export const toggleKeepPalette = (
    previous: SarakDesignState | null,
    fallback: SarakDesignState,
    on: boolean,
    { theme, hostConfig }: KeepPaletteContext,
): SarakDesignState | null => {
    const design = (previous || fallback) as unknown as DesignRecord;
    if (Boolean(design.keepPalette) === on) return previous;
    if (on) return applyKeptPalette({ ...design, keepPalette: true }, design.colorPalette) as unknown as SarakDesignState;
    const off = { ...design, keepPalette: false };
    if (!theme) return off as unknown as SarakDesignState;
    const mode = design.mode === 'light' ? 'light' : 'dark';
    const themed = composeThemeDesign(resolveThemeForMode(theme, mode) as DesignRecord, off, hostConfig) as unknown as DesignRecord;
    return { ...off, ...paletteSlice(themed) } as unknown as SarakDesignState;
};
