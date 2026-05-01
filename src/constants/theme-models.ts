/**
 * Sarak Global Theme Models (v8.5 - Quantum Library)
 * 
 * Biblioteca de DNA Visual Soberano. Cada tema é um preset de 
 * componentes com materiais, texturas e geometrias exclusivas.
 */

export const LAYOUTS = {
    CLASSIC: { id: 'classic', name: 'Industrial Classic', class: 'layout-classic', animation: 'blur', emoji: 'formal' },
    FORMAL: { id: 'formal', name: 'Executive Gold', class: 'layout-formal', animation: 'standard', emoji: 'prestige' },
    FUTURIST: { id: 'futurist', name: 'Quantum Glass', class: 'layout-futurist', animation: 'perspective', emoji: 'cyber' },
    BRUTALIST: { id: 'brutalist', name: 'Neon Brutalism', class: 'layout-brutalist', animation: 'none', emoji: 'raw' },
    TERMINAL: { id: 'terminal', name: 'Command Terminal', class: 'layout-terminal', animation: 'standard', emoji: 'hacker' },
    ORGANIC: { id: 'organic', name: 'Bio Organic', class: 'layout-organic', animation: 'blur', emoji: 'friendly' },
    RETRO: { id: 'retro', name: 'Synthwave 84', class: 'layout-retro', animation: 'standard', emoji: 'retro' },
    MINIMAL: { id: 'minimal', name: 'Zen Minimalist', class: 'layout-minimal', animation: 'blur', emoji: 'clean' },
    ROYAL: { id: 'royal', name: 'Prestige Royal', class: 'layout-royal', animation: 'blur', emoji: 'luxury' },
    HAZARD: { id: 'hazard', name: 'Industrial Hazard', class: 'layout-hazard', animation: 'perspective', emoji: 'critical' },
};

export const BASE_PRESETS: any = {
    classic: { 
        headingFont: "'Cormorant Garamond', serif", bodyFont: "'Inter', sans-serif", 
        borderRadius: 0, borderWidth: 1, borderStyle: 'solid', borderType: 'solid',
        surfaceMaterial: 'matte', cardTexture: 'grid', textureOpacity: 0.15,
        primaryColor: '#475569', cardPadding: 32, layoutGap: 24,
        systemTone: 'formal', shadowIntensity: 0.1, isGeometricCut: false,
        colorPalette: 'ocean'
    },
    formal: { 
        headingFont: "'Outfit', sans-serif", bodyFont: "'Inter', sans-serif", 
        borderRadius: 16, borderWidth: 1, borderStyle: 'solid', borderType: 'beveled',
        surfaceMaterial: 'brushed', cardTexture: 'silk', textureOpacity: 0.1,
        primaryColor: '#fbbf24', cardPadding: 40, layoutGap: 32,
        systemTone: 'formal', shadowIntensity: 0.6, layeredShadows: 1.5,
        colorPalette: 'royal'
    },
    futurist: { 
        headingFont: "'Syncopate', sans-serif", bodyFont: "'Space Mono', monospace", 
        borderRadius: 30, borderWidth: 1, borderStyle: 'solid', borderType: 'neon',
        surfaceMaterial: 'glass', cardTexture: 'circuit', textureOpacity: 0.3,
        primaryColor: '#06b6d4', cardPadding: 24, layoutGap: 16,
        systemTone: 'cyber', glassmorphism: 0.9, glassBlur: 24, glassOpacity: 0.1,
        colorPalette: 'cyberpunk'
    },
    brutalist: { 
        headingFont: "'Archivo Black', sans-serif", bodyFont: "'Inter', sans-serif", 
        borderRadius: 0, borderWidth: 6, borderStyle: 'solid', borderType: 'solid',
        surfaceMaterial: 'flat', cardTexture: 'none', 
        primaryColor: '#fde047', cardPadding: 48, layoutGap: 0,
        systemTone: 'raw', shadowIntensity: 0, isGeometricCut: true, contrastCurve: 1.6
    },
    terminal: { 
        headingFont: "'JetBrains Mono', monospace", bodyFont: "'JetBrains Mono', monospace", 
        borderRadius: 4, borderWidth: 1, borderStyle: 'dashed', borderType: 'inlet',
        surfaceMaterial: 'matte', cardTexture: 'carbon', textureOpacity: 0.4,
        primaryColor: '#22c55e', cardPadding: 20, layoutGap: 12,
        systemTone: 'cyber', shadowIntensity: 0.3, animationSpeed: 0.1
    },
    organic: { 
        headingFont: "'Plus Jakarta Sans', sans-serif", bodyFont: "'Plus Jakarta Sans', sans-serif", 
        borderRadius: 80, borderWidth: 0, borderType: 'none',
        surfaceMaterial: 'soft', cardTexture: 'grain', textureOpacity: 0.2,
        primaryColor: '#10b981', cardPadding: 48, layoutGap: 40,
        systemTone: 'friendly', shadowIntensity: 0.3, interfaceElasticity: 0.1,
        colorPalette: 'nature'
    },
    retro: { 
        headingFont: "'Righteous', cursive", bodyFont: "'Inter', sans-serif", 
        borderRadius: 12, borderWidth: 2, borderStyle: 'solid', borderType: 'neon',
        surfaceMaterial: 'acrylic', cardTexture: 'aurora', textureOpacity: 0.5,
        primaryColor: '#ec4899', cardPadding: 28, layoutGap: 24,
        systemTone: 'cyber', shadowIntensity: 1.0, animationSpeed: 1.2,
        colorPalette: 'sunset'
    },
    minimal: { 
        headingFont: "'Inter', sans-serif", bodyFont: "'Inter', sans-serif", 
        borderRadius: 24, borderWidth: 0, borderType: 'none',
        surfaceMaterial: 'matte', cardTexture: 'none', 
        primaryColor: '#cbd5e1', cardPadding: 80, layoutGap: 64,
        systemTone: 'formal', shadowIntensity: 0.05, shadowOrientation: 'center'
    },
    royal: { 
        headingFont: "'Playfair Display', serif", bodyFont: "'Inter', sans-serif", 
        borderRadius: 32, borderWidth: 1, borderStyle: 'solid', borderType: 'beveled',
        surfaceMaterial: 'brushed', cardTexture: 'silk', textureOpacity: 0.2,
        primaryColor: '#9f1239', cardPadding: 48, layoutGap: 32,
        systemTone: 'formal', shadowIntensity: 0.9, layeredShadows: 2.5,
        colorPalette: 'royal'
    },
    hazard: { 
        headingFont: "'Barlow Condensed', sans-serif", bodyFont: "'Barlow Condensed', sans-serif", 
        borderRadius: 0, borderWidth: 3, borderStyle: 'solid', borderType: 'solid',
        surfaceMaterial: 'matte', cardTexture: 'warning-stripes', textureOpacity: 0.3,
        primaryColor: '#eab308', cardPadding: 16, layoutGap: 4,
        systemTone: 'critical', isGeometricCut: true, animationSpeed: 0.2
    }
};
