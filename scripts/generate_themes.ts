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

// Nebula Space overrides (Utilizando os novos componentes de 100% granularidade)
const nebulaOverrides = {
    mode: 'dark',
    layoutDensity: 'compact',
    navigationStyle: 'topbar',
    searchPositionTopbar: 'center', // Novo componente
    searchPositionSidebar: 'hidden', // Novo componente
    colorPrimary: '#ff007f',
    colorSecondary: '#00e5ff',
    colorSurface: 'rgba(10, 10, 20, 0.4)',
    bgBase: '#020205',
    globalBackgroundImageUrl: 'url("https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920&auto=format&fit=crop")', // Nova capacidade
    globalBackgroundBlur: 4, // Nova capacidade
    globalBackgroundBlendMode: 'screen', // Nova capacidade
    globalBackgroundOpacity: 0.25, // Nova capacidade
    pageTransitionType: 'zoom', // Nova animação
    cardHoverStyle: '3d-tilt', // Novo hover
    imageCardHoverZoom: 1.15, // Nova granularidade
    imageCardOverlayOpacity: 0.7, // Nova granularidade
    inputFocusBorderColor: '#ff007f', // Nova granularidade
    inputBorderColor: 'rgba(255, 0, 127, 0.2)', // Nova granularidade
    iconFamily: 'phosphor', // Escolha de pacote
    iconWeight: 'duotone',
    bodySize: '13px',
    fontHeading: "'Outfit', sans-serif",
    h1Size: 42,
    radiusTheme: '16px',
    buttonRadius: '12px',
    cardRadius: '24px',
    themeGap: '12px',
    glassBlur: 20,
    glassSaturation: 1.8,
    motionEaseMain: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    motionSpeedBase: 500,
    texture: 'grid',
    textColorMaster: '#ffffff',
    textColorSecondary: 'rgba(255, 255, 255, 0.8)',
    textColorMuted: 'rgba(255, 255, 255, 0.5)',
    cardBackgroundColor: 'rgba(20, 20, 40, 0.2)',
    cardTitleColor: '#ff007f',
    cardBorderColor: 'rgba(0, 229, 255, 0.2)',
    topbarColor: 'rgba(5, 5, 10, 0.5)',
    topbarTitleColor: '#00e5ff',
    sidebarColor: 'rgba(5, 5, 10, 0.5)'
};

const sovereignTokens = { ...baseTokens, ...sovereignOverrides };
const crystalTokens = { ...baseTokens, ...crystalOverrides };
const nebulaTokens = { ...baseTokens, ...nebulaOverrides };

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
    },
    {
        id: 'nebula-space',
        name: 'Nebula Space',
        description: 'Imersivo & Cyberpunk: Imagem de fundo, transições de Zoom e Ícones Duotone com alto desfoque de vidro e componentes centralizados.',
        design: ${JSON.stringify(nebulaTokens, null, 8).replace(/\n/g, '\n        ')}
    }
];
`;

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.resolve(__dirname, '../src/core/Design/presets/themes/index.ts');

fs.writeFileSync(outputPath, fileContent, 'utf-8');
console.log('Themes generated successfully at', outputPath);
