/**
 * Presets: Temas Globais
 *
 * Configurações que alteram a aplicação inteira de uma vez.
 * Formato: { id: ThemePresetId; name: string; description: string; design: Record<string, unknown> }
 *
 * `design` é `Record<string, unknown>` (Zero `any` — §0.6) e NÃO o `SarakThemePayload`
 * estrito: os presets legados carregam valores que divergiram do domínio fechado do
 * payload (ex.: `logoMinimalUrl`, `cardVariant: "solid"`), reconciliação pendente com a
 * paridade 1:1:1:1:1 (ver `Provider/types.ts`). A blindagem estrita vive na diretiva
 * `theme` (Spec 42), que autores de manifesto consomem via `Partial<SarakThemePayload>`.
 */

/**
 * União conhecida dos ids de preset (fonte única; espelha `GLOBAL_THEMES`).
 * Adicionar um tema = adicionar seu id aqui e importá-lo abaixo. Consumida pela
 * diretiva `theme` (Spec 42) como o ramo "preset nomeado".
 */
export const THEME_PRESET_IDS = [
    'sarak-sovereign',
    'crystal-glass',
    'cyberpunk-neon',
    'holographic-glass',
    'industrial-terminal',
    'nature-breeze',
    'neo-brutalism',
    'synthwave-retro',
    'nebula-space',
    'dot-matrix-elegant',
    'stellar-nebula',
    'kinetic-flow',
    'cyber-retro-wave',
    'minimalist-airy',
    'data-terminal',
    'neumorphic-mobile',
    'industrial-dashboard',
    'asymmetric-editorial',
] as const;

export type ThemePresetId = (typeof THEME_PRESET_IDS)[number];

export interface ThemePreset {
    id: ThemePresetId;
    name: string;
    description: string;
    design: Record<string, unknown>;
}

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
