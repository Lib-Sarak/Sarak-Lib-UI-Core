/**
 * Presets: Temas Globais
 * 
 * Configurações que alteram a aplicação inteira de uma vez.
 * Formato esperado: { id: string; name: string; description: string; design: Record<string, any> }
 */

export interface ThemePreset {
    id: string;
    name: string;
    description: string;
    design: Record<string, any>;
}

export * from './stellar-nebula';
export * from './crystal-glass';
export * from './holographic-glass';

// Novos Temas de Extremo Layout (Data-Driven)
export * from './minimalist-airy';
export * from './data-terminal';
export * from './neumorphic-mobile';
export * from './industrial-dashboard';
export * from './asymmetric-editorial';

import { sarakSovereignTheme } from './sarak-sovereign';
import { crystalGlassTheme } from './crystal-glass';
import { cyberpunkneonTheme } from './cyberpunk-neon';
import { holographicGlassTheme } from './holographic-glass';
import { industrialTerminalTheme } from './industrial-terminal';
import { naturebreezeTheme } from './nature-breeze';
import { neobrutalismTheme } from './neo-brutalism';
import { synthwaveRetroTheme } from './synthwave-retro';
import { nebulaSpaceTheme } from './nebula-space';
import { dotMatrixElegantTheme } from './dot-matrix-elegant';
import { stellarNebulaTheme } from './stellar-nebula';
import { kineticFlowTheme } from './kinetic-flow';
import { cyberRetroWaveTheme } from './cyber-retro-wave';
import { minimalistAiry } from './minimalist-airy';
import { dataTerminal } from './data-terminal';
import { neumorphicMobile } from './neumorphic-mobile';
import { industrialDashboard } from './industrial-dashboard';
import { asymmetricEditorial } from './asymmetric-editorial';

export const GLOBAL_THEMES: ThemePreset[] = [
    sarakSovereignTheme,
    crystalGlassTheme,
    cyberpunkneonTheme,
    holographicGlassTheme,
    industrialTerminalTheme,
    naturebreezeTheme,
    neobrutalismTheme,
    synthwaveRetroTheme,
    nebulaSpaceTheme,
    dotMatrixElegantTheme,
    stellarNebulaTheme,
    kineticFlowTheme,
    cyberRetroWaveTheme,
    minimalistAiry,
    dataTerminal,
    neumorphicMobile,
    industrialDashboard,
    asymmetricEditorial
];
