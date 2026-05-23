import * as fs from 'fs';
import { MASTER_DESIGN_MAP } from './src/core/Design/master-map';

const baseDesign: Record<string, any> = {};
MASTER_DESIGN_MAP.components.forEach(comp => {
    comp.tokens.forEach(token => {
        baseDesign[token.id] = token.defaultValue;
    });
});

const generateTheme = (name: string, description: string, overrides: Record<string, any>) => {
    const finalDesign = { ...baseDesign, ...overrides };
    
    // Generate the TS file content
    const content = `import { ThemePreset } from '../index';

export const ${name.replace(/ /g, '').toLowerCase()}Theme: ThemePreset = {
    id: '${name.toLowerCase().replace(/ /g, '-')}',
    name: '${name}',
    description: '${description}',
    design: ${JSON.stringify(finalDesign, null, 8).replace(/"([^"]+)":/g, '$1:')}
};
`;
    
    fs.writeFileSync(`./src/core/Design/presets/themes/${name.toLowerCase().replace(/ /g, '-')}.ts`, content);
};

// 1. CYBERPUNK NEON
generateTheme('Cyberpunk Neon', 'Brutal hacker aesthetic. Neon green, zeroed corners, monospaced fonts and grid textures.', {
    navigationStyle: 'sidebar',
    bgBaseColor: '#050505',
    surfaceColor: '#0a0a0a',
    primaryColor: '#00ff41', // Matrix green
    secondaryColor: '#ff00ff', // Cyber magenta
    accentColor: '#00ffff', // Cyan
    textColorMaster: '#00ff41',
    headingFont: '"JetBrains Mono", monospace',
    bodyFont: '"JetBrains Mono", monospace',
    cardBorderRadius: 0,
    btnBorderRadius: 0,
    inputBorderRadius: 0,
    cardGeometricCut: 16,
    cardBorderWidth: 1,
    cardBorderColor: '#00ff41',
    cardBackgroundColor: 'rgba(0, 255, 65, 0.02)',
    cardShadowSpread: 10,
    cardGlowColor: 'rgba(0, 255, 65, 0.2)',
    cardGlowIntensity: 1,
    cardTextureType: 'grid',
    cardTextureOpacity: 0.1,
    glassBlur: 0,
    btnStyleType: 'outline',
    btnPrimaryText: '#00ff41',
    btnPrimaryBg: 'transparent'
});

// 2. NEO BRUTALISM
generateTheme('Neo Brutalism', 'Aggressive contrast, thick black borders, solid shadows, flat geometry.', {
    navigationStyle: 'topbar',
    bgBaseColor: '#f0f0f0',
    surfaceColor: '#ffffff',
    primaryColor: '#ff0000', // Pure Red
    secondaryColor: '#ffff00', // Pure Yellow
    accentColor: '#0000ff', // Pure Blue
    textColorMaster: '#000000',
    headingFont: '"Space Grotesk", sans-serif',
    bodyFont: '"Inter", sans-serif',
    cardBorderRadius: 4,
    btnBorderRadius: 4,
    inputBorderRadius: 4,
    cardGeometricCut: 0,
    cardBorderWidth: 4,
    cardBorderColor: '#000000',
    cardBackgroundColor: '#ffffff',
    cardShadowSpread: 0,
    shadowIntensity: 1,
    cardShadow: '8px 8px 0px #000000', // Custom brutalist shadow override
    cardTextureType: 'none',
    glassBlur: 0,
    btnStyleType: 'solid',
    btnPrimaryBg: '#ff0000',
    btnPrimaryText: '#ffffff'
});

// 3. NATURE BREEZE
generateTheme('Nature Breeze', 'Organic, lots of glass, sparse shadows, massive rounded corners.', {
    navigationStyle: 'sidebar',
    bgBaseColor: '#f4fbf7',
    surfaceColor: '#e8f5e9',
    primaryColor: '#2e7d32', // Emerald Green
    secondaryColor: '#fbc02d', // Sun yellow
    accentColor: '#00695c',
    textColorMaster: '#1b5e20',
    headingFont: '"Lora", serif',
    bodyFont: '"Inter", sans-serif',
    cardBorderRadius: 32,
    btnBorderRadius: 999,
    inputBorderRadius: 32,
    cardGeometricCut: 0,
    cardBorderWidth: 0,
    cardBorderColor: 'transparent',
    cardBackgroundColor: 'rgba(255, 255, 255, 0.4)',
    cardShadowSpread: 40,
    cardShadow: '0 30px 60px -10px rgba(46, 125, 50, 0.15)', // Soft organic shadow
    cardTextureType: 'noise',
    cardTextureOpacity: 0.05,
    glassBlur: 24,
    glassOpacity: 0.5,
    btnStyleType: 'solid',
    btnPrimaryBg: '#2e7d32',
    btnPrimaryText: '#ffffff'
});

console.log('3 massive distinct themes regenerated!');
