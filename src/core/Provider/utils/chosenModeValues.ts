import { sarakGetAllDesignTokens, sarakGetDefaultDesignState } from '../../Design/master-map';
import { PALETTE_CALCULATED_KEYS } from '../../Design/palette/resolve';
import type { SarakDesignState } from '../types';

type TokenRecord = Record<string, unknown>;
type ThemeSides = { design?: TokenRecord; contraparte?: TokenRecord } | undefined;

let colorTokenIds: ReadonlySet<string> | undefined;
const isColorToken = (id: string): boolean => {
    colorTokenIds ??= new Set(sarakGetAllDesignTokens().filter((token) => token.type === 'color').map((token) => token.id));
    return colorTokenIds.has(id);
};

const sameValue = (a: unknown, b: unknown): boolean => a === b || JSON.stringify(a) === JSON.stringify(b);

/**
 * Os tokens que a troca de modo não pode devolver ao par do tema: os que o usuário escolheu. A contraparte troca o que carrega
 * modo (opacidade, sombra), e o valor escolhido para um deles vale nos dois modos — é o do usuário, não o do tema. "Escolhido" é
 * o valor do design que difere do que o tema declara para o modo atual (ou, sem declaração, do padrão do schema). Cor fica de
 * fora: a cor de papel é da paleta, e a customização de cor que a troca substitui é avisada ao usuário.
 */
export const chosenModeValueKeys = (design: SarakDesignState, theme: ThemeSides): Set<string> => {
    const counterpart = theme?.contraparte;
    if (!counterpart) return new Set();
    const record = design as unknown as TokenRecord;
    const nativeMode = theme?.design?.mode === 'light' ? 'light' : 'dark';
    const declared = (record.mode === 'light' ? 'light' : 'dark') === nativeMode ? theme?.design : counterpart;
    const defaults = sarakGetDefaultDesignState() as unknown as TokenRecord;
    return new Set(Object.keys(counterpart).filter((key) => (
        key !== 'mode' && !PALETTE_CALCULATED_KEYS.has(key) && !isColorToken(key)
        && record[key] !== undefined && !sameValue(record[key], declared?.[key] ?? defaults[key])
    )));
};
