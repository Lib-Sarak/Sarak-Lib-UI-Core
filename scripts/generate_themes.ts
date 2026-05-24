import { MASTER_DESIGN_MAP } from '../src/core/Design/master-map';
import * as fs from 'fs';

const baseTokens: Record<string, any> = {};

MASTER_DESIGN_MAP.components.forEach(comp => {
    comp.tokens.forEach(token => {
        baseTokens[token.id] = token.defaultValue;
    });
});

// Sarak Sovereign overrides
const sovereignOverrides = {
    mode: 'dark',
    layoutDensity: 'comfortable',
    navigationStyle: 'sidebar',
    colorPrimary: '#00f2ff',
    colorSecondary: '#7000ff',
    colorSurface: '#0f172a',
    bgBase: '#050505',
    bodySize: '14px',
    fontHeading: "'Inter', sans-serif",
    h1Size: 48,
    radiusTheme: '12px',
    buttonRadius: '8px',
    cardRadius: '16px',
    themeGap: '16px',
    glassBlur: 10,
    glassSaturation: 1.2,
    motionEaseMain: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motionSpeedBase: 300,
    texture: 'none',
    pageTransition: 'fade'
};

// Crystal Glass overrides
const crystalOverrides = {
    mode: 'light',
    layoutDensity: 'spacious',
    navigationStyle: 'topbar',
    colorPrimary: '#0ea5e9',
    colorSecondary: '#8b5cf6',
    colorSurface: 'rgba(255, 255, 255, 0.7)',
    bgBase: '#f8fafc',
    bodySize: '16px',
    fontHeading: "'Outfit', sans-serif",
    h1Size: 56,
    radiusTheme: '24px',
    buttonRadius: '9999px',
    cardRadius: '32px',
    themeGap: '24px',
    glassBlur: 40,
    glassSaturation: 1.5,
    motionEaseMain: 'cubic-bezier(0.25, 1, 0.5, 1)',
    motionSpeedBase: 400,
    texture: 'noise',
    pageTransition: 'scale',
    // Adapting some light mode colors
    textColorMaster: '#0f172a',
    textColorSecondary: 'rgba(15, 23, 42, 0.7)',
    textColorMuted: 'rgba(15, 23, 42, 0.4)',
    cardBackgroundColor: 'rgba(255, 255, 255, 0.6)',
    cardTitleColor: '#0f172a',
    cardBorderColor: 'rgba(0, 0, 0, 0.05)',
    topbarColor: 'rgba(255, 255, 255, 0.8)',
    topbarTitleColor: '#0f172a',
    sidebarColor: 'rgba(255, 255, 255, 0.8)',
    colorBgBody: '#f8fafc',
    colorBgLayer1: '#ffffff',
    colorBgLayer2: '#f1f5f9'
};

const sovereignTokens = { ...baseTokens, ...sovereignOverrides };
const crystalTokens = { ...baseTokens, ...crystalOverrides };

const fileContent = `/**
 * Presets: Temas Globais (Preview 2 Globais)
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

export const GLOBAL_THEMES: ThemePreset[] = [
    {
        id: 'sarak-sovereign',
        name: 'Sarak Sovereign',
        description: 'Padrão industrial: Dark Mode, cores ácidas e de alta performance.',
        design: ${JSON.stringify(sovereignTokens, null, 8).replace(/\n/g, '\n        ')}
    },
    {
        id: 'crystal-glass',
        name: 'Crystal Glass',
        description: 'Clean & Light: Profundidade óptica, suavidade extrema e design translúcido.',
        design: ${JSON.stringify(crystalTokens, null, 8).replace(/\n/g, '\n        ')}
    }
];
`;

fs.writeFileSync('../src/core/Design/presets/themes/index.ts', fileContent, 'utf-8');
console.log('Themes generated successfully.');
