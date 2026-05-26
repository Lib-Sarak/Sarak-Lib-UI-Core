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

import { sarakSovereignTheme } from './sarak-sovereign';
import { crystalGlassTheme } from './crystal-glass';
import { cyberpunkneonTheme } from './cyberpunk-neon';
import { holographicGlassTheme } from './holographic-glass';
import { industrialTerminalTheme } from './industrial-terminal';
import { naturebreezeTheme } from './nature-breeze';
import { neobrutalismTheme } from './neo-brutalism';
import { synthwaveRetroTheme } from './synthwave-retro';
import { nebulaSpaceTheme } from './nebula-space';

export const GLOBAL_THEMES: ThemePreset[] = [
    sarakSovereignTheme,
    crystalGlassTheme,
    cyberpunkneonTheme,
    holographicGlassTheme,
    industrialTerminalTheme,
    naturebreezeTheme,
    neobrutalismTheme,
    synthwaveRetroTheme,
    nebulaSpaceTheme
];
