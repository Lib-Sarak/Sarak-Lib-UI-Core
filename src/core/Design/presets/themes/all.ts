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
];
