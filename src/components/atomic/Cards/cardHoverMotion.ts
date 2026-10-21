import type { TargetAndTransition } from 'framer-motion';
import type { SarakThemePayload } from '../../../core/Provider/types';

/** Subida padrão do `lift` quando o tema não declara `cardHoverTranslate`. */
const DEFAULT_LIFT_Y = -4;
/** Escala que acompanha a subida do `lift`, e a do `expand`. */
const LIFT_SCALE = 1.01;
const EXPAND_SCALE = 1.02;

/**
 * Movimento de hover dos cartões que se movem por framer-motion (`SarakTitleCard`,
 * `SarakImageCard`), a partir do estilo `cardHoverStyle` do tema:
 * `lift` sobe `cardHoverTranslate` px, `expand` cresce um pouco e `glow-only` não move.
 * Os demais cartões leem o mesmo estilo por CSS (`_cards.css`).
 */
export const resolveCardHoverMotion = (design: SarakThemePayload | undefined): TargetAndTransition => {
    const style = design?.cardHoverStyle ?? 'lift';
    if (style === 'lift') return { y: Number(design?.cardHoverTranslate ?? DEFAULT_LIFT_Y), scale: LIFT_SCALE };
    if (style === 'expand') return { scale: EXPAND_SCALE };
    return {};
};
