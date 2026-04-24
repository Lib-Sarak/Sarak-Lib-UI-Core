/**
 * Sarak Visuals Presets (v1.0)
 * 
 * Define atmosferas, materiais e paletas cromáticas.
 */

export interface VisualsPreset {
    id: string;
    title: string;
    description: string;
    tokens: {
        primaryColor: string;
        surfaceMaterial: 'glass' | 'acrylic' | 'matte' | 'brushed';
        texture: string;
        textureOpacity: number;
        atmosphereNoiseOpacity: number;
        successColor?: string;
        warningColor?: string;
        errorColor?: string;
    };
}

export const VISUALS_PRESETS: VisualsPreset[] = [
    {
        id: 'cyber-neon',
        title: 'Cyber Neon',
        description: 'Foco em cores vibrantes sobre texturas técnicas de alta opacidade.',
        tokens: {
            primaryColor: '#0ea5e9',
            surfaceMaterial: 'acrylic',
            texture: 'circuit',
            textureOpacity: 0.15,
            atmosphereNoiseOpacity: 0.05
        }
    },
    {
        id: 'stealth-black',
        title: 'Stealth Black',
        description: 'Minimalismo escuro com materiais foscos e ruído atmosférico sutil.',
        tokens: {
            primaryColor: '#6366f1',
            surfaceMaterial: 'matte',
            texture: 'noise',
            textureOpacity: 0.05,
            atmosphereNoiseOpacity: 0.08
        }
    },
    {
        id: 'glass-ethereal',
        title: 'Glass Ethereal',
        description: 'Transparência máxima com cores pastéis e texturas de seda.',
        tokens: {
            primaryColor: '#ec4899',
            surfaceMaterial: 'glass',
            texture: 'silk',
            textureOpacity: 0.1,
            atmosphereNoiseOpacity: 0.02
        }
    },
    {
        id: 'industrial-grid',
        title: 'Industrial Grid',
        description: 'Estética de engenharia com grid persistente e material de metal escovado.',
        tokens: {
            primaryColor: '#f59e0b',
            surfaceMaterial: 'brushed',
            texture: 'grid',
            textureOpacity: 0.12,
            atmosphereNoiseOpacity: 0.04
        }
    }
];
