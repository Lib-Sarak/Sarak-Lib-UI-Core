import * as fs from 'fs';
import { MASTER_DESIGN_MAP } from './src/core/Design/master-map';

const defaults: Record<string, any> = {};
MASTER_DESIGN_MAP.components.forEach(comp => {
    comp.tokens.forEach(token => {
        defaults[token.id] = token.defaultValue;
    });
});

const generateTheme = (id: string, name: string, description: string, overrides: Record<string, any>) => {
    const fullDesign = { ...defaults, ...overrides };
    
    const designStr = Object.entries(fullDesign).map(([k, v]) => {
        if (typeof v === 'string') {
            // Fix string escaping for fonts
            if (k.toLowerCase().includes('font') && v.includes("'")) {
                return `        ${k}: "${v}",`;
            }
            return `        ${k}: '${v}',`;
        }
        return `        ${k}: ${v},`;
    }).join('\n');

    return `import { ThemePreset } from './index';

export const ${id}Theme: ThemePreset = {
    id: '${id.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replace('theme', '')}',
    name: '${name}',
    description: '${description}',
    design: {\n${designStr}\n    }
};
`;
};

// 1. Cyberpunk Neon
const cyberpunkOverrides = {
    layoutDensity: 'dense',
    navigationStyle: 'sidebar',
    sidebarWidth: 200,
    sidebarBlur: 0,
    sidebarBgColor: '#050505',
    sidebarBorderRight: '2px solid #39ff14',
    navItemPadding: 8,
    navItemRadius: 0,
    navItemBgHover: '#39ff14',
    navItemColorHover: '#000000',
    navItemActiveBg: '#39ff14',
    navItemActiveColor: '#000000',
    navActiveMarkerColor: '#39ff14',
    
    colorPrimary: '#39ff14',
    colorSecondary: '#ff00ff',
    colorSurface: '#090909',
    
    bodySize: '12px',
    fontHeading: "'JetBrains Mono', monospace",
    headingFont: "'JetBrains Mono', monospace",
    bodyFont: "'JetBrains Mono', monospace",
    monoFont: "'JetBrains Mono', monospace",
    h1Size: 42,
    
    radiusTheme: '0px',
    buttonRadius: '0px',
    inputRadius: '0px',
    cardRadius: '0px',
    cardRadiusTL: 0, cardRadiusTR: 0, cardRadiusBL: 0, cardRadiusBR: 0,
    
    themeGap: '8px',
    glassBlur: 0,
    texture: 'grid',
    
    cardBackgroundColor: '#000000',
    cardBorderWidth: 1,
    cardBorderColor: '#39ff14',
    cardShadowSpread: 10,
    cardGlowColor: 'rgba(57, 255, 20, 0.2)',
    cardGlowIntensity: 0.8,
    cardHeaderBg: '#111111',
    cardFooterBg: '#111111',
    
    tableHeaderBg: '#111111',
    tableBorderColor: '#39ff14',
    tableCellPadding: 8,
    
    buttonHeight: 32,
    btnPrimaryStyle: 'outline',
    buttonBorderWidth: 1,
    buttonBorderColor: '#39ff14',
    
    inputBgColor: '#000000',
    inputBorderColor: '#39ff14',
    inputBorderWidth: 1,
    
    motionEaseMain: 'linear',
    motionSpeedBase: 150,
    pageTransition: 'fade',
};

fs.writeFileSync('./src/core/Design/presets/themes/cyberpunk-neon.ts', generateTheme('cyberpunkNeon', 'Cyberpunk Neon', 'Estética hacker brutal. Verde neon, cantos zerados e fontes monospaced.', cyberpunkOverrides));

// 2. Neo Brutalism
const brutalismOverrides = {
    layoutDensity: 'spacious',
    navigationStyle: 'topbar',
    topbarHeight: 80,
    topbarBlur: 0,
    topbarBgColor: '#ffd700',
    topbarBorderBottom: '4px solid #000000',
    navItemPadding: 16,
    navItemRadius: 0,
    navItemBgHover: '#000000',
    navItemColorHover: '#ffffff',
    navItemActiveBg: '#000000',
    navItemActiveColor: '#ffffff',
    navActiveMarkerColor: '#000000',
    
    colorPrimary: '#ff3366',
    colorSecondary: '#ffd700',
    colorSurface: '#ffffff',
    
    bodySize: '16px',
    fontHeading: "'Space Grotesk', sans-serif",
    headingFont: "'Space Grotesk', sans-serif",
    bodyFont: "'Space Grotesk', sans-serif",
    h1Size: 64,
    
    radiusTheme: '0px',
    buttonRadius: '0px',
    inputRadius: '0px',
    cardRadius: '0px',
    cardRadiusTL: 0, cardRadiusTR: 0, cardRadiusBL: 0, cardRadiusBR: 0,
    
    themeGap: '32px',
    glassBlur: 0,
    texture: 'none',
    
    cardBackgroundColor: '#ffffff',
    cardBorderWidth: 4,
    cardBorderColor: '#000000',
    shadowColorMode: 'neutral',
    cardShadowSpread: 0,
    cardHoverTranslate: -8,
    cardHoverGlowIncrease: 0,
    cardHeaderBg: '#ffd700',
    
    tableHeaderBg: '#ffd700',
    tableBorderColor: '#000000',
    tableCellPadding: 16,
    
    buttonHeight: 56,
    btnPrimaryStyle: 'solid',
    buttonBorderWidth: 4,
    buttonBorderColor: '#000000',
    
    inputBgColor: '#ffffff',
    inputBorderColor: '#000000',
    inputBorderWidth: 4,
    
    motionEaseMain: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    motionSpeedBase: 200,
    pageTransition: 'slide',
};

fs.writeFileSync('./src/core/Design/presets/themes/neo-brutalism.ts', generateTheme('neoBrutalism', 'Neo Brutalism', 'Contraste agressivo, bordas espessas pretas e layout achatado em cores primárias.', brutalismOverrides));

// 3. Nature Breeze
const natureOverrides = {
    layoutDensity: 'comfortable',
    navigationStyle: 'sidebar',
    sidebarWidth: 300,
    sidebarBlur: 20,
    sidebarBgColor: 'rgba(253, 251, 247, 0.7)',
    sidebarBorderRight: '1px solid rgba(16, 185, 129, 0.2)',
    navItemPadding: 12,
    navItemRadius: 9999,
    navItemBgHover: 'rgba(16, 185, 129, 0.1)',
    navItemColorHover: '#10b981',
    navItemActiveBg: '#10b981',
    navItemActiveColor: '#ffffff',
    navActiveMarkerColor: '#10b981',
    
    colorPrimary: '#10b981',
    colorSecondary: '#f59e0b',
    colorSurface: '#fdfbf7',
    
    bodySize: '15px',
    fontHeading: "'Lora', serif",
    headingFont: "'Lora', serif",
    bodyFont: "'Inter', sans-serif",
    h1Size: 48,
    
    radiusTheme: '24px',
    buttonRadius: '9999px',
    inputRadius: '16px',
    cardRadius: '32px',
    cardRadiusTL: 32, cardRadiusTR: 32, cardRadiusBL: 32, cardRadiusBR: 32,
    
    themeGap: '24px',
    glassBlur: 24,
    glassSaturation: 1.2,
    texture: 'none',
    
    cardBackgroundColor: 'rgba(255, 255, 255, 0.6)',
    cardBorderWidth: 1,
    cardBorderColor: 'rgba(16, 185, 129, 0.1)',
    cardShadowSpread: 40,
    cardGlowColor: 'rgba(16, 185, 129, 0.05)',
    cardGlowIntensity: 0.2,
    cardHeaderBg: 'transparent',
    cardFooterBg: 'transparent',
    
    tableHeaderBg: 'rgba(16, 185, 129, 0.05)',
    tableBorderColor: 'rgba(16, 185, 129, 0.1)',
    tableCellPadding: 14,
    
    buttonHeight: 48,
    btnPrimaryStyle: 'solid',
    buttonBorderWidth: 0,
    
    inputBgColor: 'rgba(255, 255, 255, 0.8)',
    inputBorderColor: 'rgba(16, 185, 129, 0.2)',
    inputBorderWidth: 1,
    
    motionEaseMain: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motionSpeedBase: 500,
    pageTransition: 'fade',
};

fs.writeFileSync('./src/core/Design/presets/themes/nature-breeze.ts', generateTheme('natureBreeze', 'Nature Breeze', 'Organico, muito vidro, sombras esparsas e cores florestais.', natureOverrides));

console.log('3 crazy distinct themes regenerated successfully!');
