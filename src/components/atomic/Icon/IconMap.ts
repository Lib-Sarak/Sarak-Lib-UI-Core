/**
 * Mapa curado nome→componente das três famílias de ícone.
 *
 * A lista de nomes vive em `iconNames.ts` (contrato público, publicado no
 * catálogo); cada família tem seu módulo em `families/`, com imports NOMEADOS
 * e estáticos. O tipo `Record<IconName, ...>` de cada módulo faz o compilador
 * garantir a paridade 1:1:1 entre as famílias — nome sem tripla não compila.
 */
import type React from 'react';
import { LUCIDE_ICONS } from './families/lucideIcons';
import { PHOSPHOR_ICONS } from './families/phosphorIcons';
import { TABLER_ICONS } from './families/tablerIcons';
import { SARAK_ICON_NAMES, type SarakIconName } from './iconNames';

export { SARAK_ICON_NAMES, SARAK_ICONE_DESCONHECIDO, type SarakIconName } from './iconNames';

/** Famílias de ícone suportadas pelo token `iconFamily`. */
export type SarakIconFamily = 'lucide' | 'phosphor' | 'tabler';

export interface SarakIconTriple {
    lucide: React.ElementType;
    phosphor: React.ElementType;
    tabler: React.ElementType;
}

export const SarakIconMap: Record<SarakIconName, SarakIconTriple> = Object.fromEntries(
    SARAK_ICON_NAMES.map((nome) => [
        nome,
        { lucide: LUCIDE_ICONS[nome], phosphor: PHOSPHOR_ICONS[nome], tabler: TABLER_ICONS[nome] },
    ])
) as Record<SarakIconName, SarakIconTriple>;
