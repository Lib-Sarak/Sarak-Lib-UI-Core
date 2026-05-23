import { sarakSovereignTheme } from './sarak-sovereign';
import { cyberpunkneonTheme } from './cyberpunk-neon';
import { neobrutalismTheme } from './neo-brutalism';
import { naturebreezeTheme } from './nature-breeze';
import { synthwaveRetroTheme } from './synthwave-retro';
import { holographicGlassTheme } from './holographic-glass';
import { industrialTerminalTheme } from './industrial-terminal';

export interface ThemePreset {
    id: string;
    name: string;
    description: string;
    design: Record<string, any>;
}

export const GLOBAL_THEMES: ThemePreset[] = [
    sarakSovereignTheme,
    cyberpunkneonTheme,
    neobrutalismTheme,
    naturebreezeTheme,
    synthwaveRetroTheme,
    holographicGlassTheme,
    industrialTerminalTheme
];
