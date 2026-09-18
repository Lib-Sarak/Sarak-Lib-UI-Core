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
import type { SarakDesignState } from '../../../Provider/types';

/**
 * União conhecida dos ids de preset (fonte única; espelha `GLOBAL_THEMES`).
 * Adicionar um tema = adicionar seu id aqui e importá-lo abaixo. Consumida pela
 * diretiva `theme` (Spec 42) como o ramo "preset nomeado".
 */
export const THEME_PRESET_IDS = [
    'sarak-sovereign',
    'cyberpunk-neon',
    'industrial-terminal',
    'neo-brutalism',
    'synthwave-retro',
    'nebula-space',
    'kinetic-flow',
    'cyber-retro-wave',
    'minimalist-airy',
    'data-terminal',
    'neumorphic-mobile',
] as const;

export type ThemePresetId = (typeof THEME_PRESET_IDS)[number];

export interface ThemePreset {
    id: ThemePresetId;
    name: string;
    description: string;
    design: Record<string, unknown>;
    /**
     * Bloco PARCIAL, autorado, com os tokens que mudam para o modo OPOSTO ao
     * nativo (`design.mode`) — plan-26. OPCIONAL no tipo de propósito: torná-lo
     * obrigatório quebraria os 18 temas legados e todo tema de consumidor
     * (R33). `resolveThemeForMode` (abaixo) é quem decide o que aplicar; o
     * gate de contraste (`auditor_contraste`) é quem EXIGE presença, com uma
     * lista de isenção que nasce com exatamente os 18 legados.
     */
    contraparte?: Partial<SarakDesignState>;
}

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

export const GLOBAL_THEMES: ThemePreset[] = [
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
];
