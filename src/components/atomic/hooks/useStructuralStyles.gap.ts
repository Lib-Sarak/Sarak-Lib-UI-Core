import { resolveToken } from '../../../core/Design/resolveToken';
import type { ResponsiveValue } from '../../../core/Design/types';

/**
 * Valor aceito como medida de `gap`. Inclui `ResponsiveValue<number>` porque os
 * tokens de espaçamento do Design Engine são **responsivos** (`isResponsive`), e o
 * `fallback` recebe o valor cru de `design.layoutGap`/`globalSectionGap` — que pode
 * chegar como objeto por breakpoint, não só como escalar.
 */
export type GapValue = string | number | ResponsiveValue<number>;

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
    override: string | undefined,
    fallback: GapValue,
    atom: string,
): GapValue =>
    override == null ? fallback : (resolveToken(override, { atom, prop: 'gap' }) ?? fallback);
