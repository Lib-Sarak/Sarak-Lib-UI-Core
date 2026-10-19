/**
 * A fronteira lazy dos temas embarcados: um `import()` por tema.
 *
 * Este módulo NÃO importa `all.ts` nem nenhum tema por `import` estático — é o
 * que mantém cada tema fora do fecho estático do entry. O tema padrão não tem
 * loader: já está no boot (`boot.ts`).
 */
import type { SarakThemePreset, SarakThemePresetId, SARAK_DEFAULT_THEME_ID } from './index';

type LazyThemeId = Exclude<SarakThemePresetId, typeof SARAK_DEFAULT_THEME_ID>;

export const SARAK_THEME_LOADERS: Record<LazyThemeId, () => Promise<SarakThemePreset>> = {
    'cyberpunk-neon': () => import('./cyberpunk-neon').then((m) => m.cyberpunkneonTheme),
    'industrial-terminal': () => import('./industrial-terminal').then((m) => m.industrialTerminalTheme),
    'neo-brutalism': () => import('./neo-brutalism').then((m) => m.neobrutalismTheme),
    'synthwave-retro': () => import('./synthwave-retro').then((m) => m.synthwaveRetroTheme),
    'nebula-space': () => import('./nebula-space').then((m) => m.nebulaSpaceTheme),
    'kinetic-flow': () => import('./kinetic-flow').then((m) => m.kineticFlowTheme),
    'cyber-retro-wave': () => import('./cyber-retro-wave').then((m) => m.cyberRetroWaveTheme),
    'minimalist-airy': () => import('./minimalist-airy').then((m) => m.minimalistAiry),
    'data-terminal': () => import('./data-terminal').then((m) => m.dataTerminal),
    'neumorphic-mobile': () => import('./neumorphic-mobile').then((m) => m.neumorphicMobile),
    'golden-hour': () => import('./golden-hour').then((m) => m.goldenHourTheme),
    'aurora-veil': () => import('./aurora-veil').then((m) => m.auroraVeilTheme),
    'blueprint-protocol': () => import('./blueprint-protocol').then((m) => m.blueprintProtocolTheme),
    'editorial-ink': () => import('./editorial-ink').then((m) => m.editorialInkTheme),
    'organic-clay': () => import('./organic-clay').then((m) => m.organicClayTheme),
    'high-contrast': () => import('./high-contrast').then((m) => m.highContrastTheme),
    'corporate-ledger': () => import('./corporate-ledger').then((m) => m.corporateLedgerTheme),
    'playful-pastel': () => import('./playful-pastel').then((m) => m.playfulPastelTheme),
};
