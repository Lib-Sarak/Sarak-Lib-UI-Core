/**
 * Presets: Atmosfera & Texturas Ambientais (v1.0)
 * 
 * Presets data-driven com chaves mapeando para AtmosphereSchema.tokens[].id
 * Cada preset define uma combinação completa de tokens atmosféricos.
 */

export interface AtmospherePreset {
    id: string;
    name: string;
    description: string;
    design: Record<string, any>;
}

export const ATMOSPHERE_PRESETS: AtmospherePreset[] = [
    {
        id: 'none',
        name: 'None',
        description: 'Atmosfera limpa sem texturas',
        design: {
            texture: 'none',
            textureOpacity: 0,
            bgNoiseDensity: 0,
            bgNoiseAnimation: 0,
            vignetteOpacity: 0
        }
    },
    {
        id: 'dots',
        name: 'Micro Dots',
        description: 'Padrão pontilhado industrial sutil',
        design: {
            texture: 'dots',
            textureOpacity: 0.08,
            bgNoiseDensity: 0.02,
            bgNoiseAnimation: 0,
            vignetteOpacity: 0.2
        }
    },
    {
        id: 'circuit',
        name: 'Circuit Board',
        description: 'Textura de placa de circuito eletrônico',
        design: {
            texture: 'circuit',
            textureOpacity: 0.1,
            bgNoiseDensity: 0.03,
            bgNoiseAnimation: 0,
            vignetteOpacity: 0.25
        }
    },
    {
        id: 'silk',
        name: 'Silk Flow',
        description: 'Fluxo de seda líquida orgânico',
        design: {
            texture: 'silk',
            textureOpacity: 0.12,
            bgNoiseDensity: 0.01,
            bgNoiseAnimation: 2,
            vignetteOpacity: 0.3
        }
    },
    {
        id: 'grid',
        name: 'Industrial Grid',
        description: 'Grade técnica precisa para interfaces industriais',
        design: {
            texture: 'grid',
            textureOpacity: 0.06,
            bgNoiseDensity: 0.04,
            bgNoiseAnimation: 0,
            vignetteOpacity: 0.15
        }
    },
    {
        id: 'noise',
        name: 'Analog Noise',
        description: 'Ruído analógico denso para ambientes escuros',
        design: {
            texture: 'noise',
            textureOpacity: 0.15,
            bgNoiseDensity: 0.08,
            bgNoiseAnimation: 1,
            vignetteOpacity: 0.35
        }
    },
    {
        id: 'aurora',
        name: 'Aurora Boreal',
        description: 'Atmosfera etérea com gradientes luminosos',
        design: {
            texture: 'aurora',
            textureOpacity: 0.18,
            bgNoiseDensity: 0.02,
            bgNoiseAnimation: 3,
            vignetteOpacity: 0.4,
            bgGradientMode: 'radial'
        }
    },
    {
        id: 'carbon',
        name: 'Carbon Fiber',
        description: 'Fibra de carbono de alta performance',
        design: {
            texture: 'carbon',
            textureOpacity: 0.1,
            bgNoiseDensity: 0.05,
            bgNoiseAnimation: 0,
            vignetteOpacity: 0.2,
            bgGradientMode: 'none'
        }
    }
];
