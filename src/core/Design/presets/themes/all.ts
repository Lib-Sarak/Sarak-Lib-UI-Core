/**
 * O catálogo INTEIRO, estático — só para FERRAMENTA (gates, geradores, testes).
 *
 * Fica fora do barril de propósito: importar este módulo de código de produto
 * traz os 14 temas para o boot (a trava `themeBootClosure.test.ts` falha). O
 * produto lista pelo catálogo leve (`catalog.generated.ts`) e carrega sob
 * demanda (`registry.ts`).
 */
import type { SarakThemePreset } from './index';
import { sarakSovereignTheme } from './sarak-sovereign';
import { cyberpunkneonTheme } from './cyberpunk-neon';
import { industrialTerminalTheme } from './industrial-terminal';
import { neobrutalismTheme } from './neo-brutalism';
import { synthwaveRetroTheme } from './synthwave-retro';
import { nebulaSpaceTheme } from './nebula-space';
import { kineticFlowTheme } from './kinetic-flow';
import { cyberRetroWaveTheme } from './cyber-retro-wave';
import { minimalistAiry } from './minimalist-airy';
import { dataTerminal } from './data-terminal';
import { neumorphicMobile } from './neumorphic-mobile';
import { goldenHourTheme } from './golden-hour';
import { auroraVeilTheme } from './aurora-veil';
import { blueprintProtocolTheme } from './blueprint-protocol';
import { editorialInkTheme } from './editorial-ink';
import { organicClayTheme } from './organic-clay';
import { highContrastTheme } from './high-contrast';
import { corporateLedgerTheme } from './corporate-ledger';
import { playfulPastelTheme } from './playful-pastel';
import { sarakSovereignClassicTheme } from './sarak-sovereign-classic';
import { cyberpunkNeonClassicTheme } from './cyberpunk-neon-classic';
import { industrialTerminalClassicTheme } from './industrial-terminal-classic';
import { cyberRetroWave2077ClassicTheme } from './cyber-retro-wave-classic';
import { natureBreezeTheme } from './nature-breeze';
import { neoBrutalismClassicTheme } from './neo-brutalism-classic';
import { dotMatrixElegantTheme } from './dot-matrix-elegant';

export const SARAK_ALL_THEMES: SarakThemePreset[] = [
    sarakSovereignTheme,
    cyberpunkneonTheme,
    industrialTerminalTheme,
    neobrutalismTheme,
    synthwaveRetroTheme,
    nebulaSpaceTheme,
    kineticFlowTheme,
    cyberRetroWaveTheme,
    minimalistAiry,
    dataTerminal,
    neumorphicMobile,
    goldenHourTheme,
    auroraVeilTheme,
    blueprintProtocolTheme,
    editorialInkTheme,
    organicClayTheme,
    highContrastTheme,
    corporateLedgerTheme,
    playfulPastelTheme,
    sarakSovereignClassicTheme,
    cyberpunkNeonClassicTheme,
    industrialTerminalClassicTheme,
    cyberRetroWave2077ClassicTheme,
    natureBreezeTheme,
    neoBrutalismClassicTheme,
    dotMatrixElegantTheme,
];
