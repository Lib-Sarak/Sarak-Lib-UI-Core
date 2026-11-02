import { resolveToken } from '../../../core/Design/resolveToken';
import type { SarakLayoutGap } from '../../../core/Design/resolveToken';
import type { SarakResponsiveValue } from '../../../core/Design/types';

/**
 * Valor aceito como medida de `gap`. Inclui `ResponsiveValue<number>` porque os
 * tokens de espaçamento do Design Engine são **responsivos** (`isResponsive`), e o
 * `fallback` recebe o valor cru de `design.layoutGap`/`globalSectionGap` — que pode
 * chegar como objeto por breakpoint, não só como escalar.
 */
export type GapValue = string | number | SarakResponsiveValue<number>;

/**
 * Resolve a medida de `gap` vinda de prop (token semântico ou CSS já válido) para
 * CSS aplicável, caindo no default do Design Engine quando ausente/inválida.
 *
 * Extraído de `useStructuralStyles` (Spec 16) para manter o hook enxuto: é a ponte
 * entre a prop crua do manifesto e o resolutor oficial de tokens.
 *
 * O `fallback` é **repassado sem tocar** quando não há `override` — por isso o tipo
 * dele acompanha o do token, em vez de estreitar para `string | number` e obrigar o
 * chamador a mentir com um cast (era o `TS2345` de `useStructuralStyles.ts:30,71,94`).
 */
export const resolveGap = (
    override: SarakLayoutGap | undefined,
    fallback: GapValue,
    atom: string,
): GapValue =>
    override == null ? fallback : (resolveToken(override, { atom, prop: 'gap' }) ?? fallback);

/**
 * Espaço por eixo (`rowGap`/`columnGap`), que vence o `gap` no eixo dele. Devolve só as chaves
 * pedidas: uma chave `undefined` depois de `gap` faz o React limpar a propriedade longa e zera o
 * eixo em vez de deixá-lo herdar o `gap`.
 */
export const resolveAxisGaps = (
    rowGap: SarakLayoutGap | undefined,
    columnGap: SarakLayoutGap | undefined,
    atom: string,
): { rowGap?: GapValue; columnGap?: GapValue } => {
    const axes: { rowGap?: GapValue; columnGap?: GapValue } = {};
    const row = rowGap == null ? undefined : resolveToken(rowGap, { atom, prop: 'rowGap' });
    const column = columnGap == null ? undefined : resolveToken(columnGap, { atom, prop: 'columnGap' });
    if (row != null) axes.rowGap = row;
    if (column != null) axes.columnGap = column;
    return axes;
};
