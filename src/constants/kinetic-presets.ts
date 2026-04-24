/**
 * Sarak Kinetic Presets (v1.0)
 * 
 * Define a física e a cadência de movimento do sistema.
 */

export interface KineticPreset {
    id: string;
    title: string;
    description: string;
    tokens: {
        animationSpeed: number;
        interfaceElasticity: number;
        cursorPhysics: boolean;
        layeredShadows: boolean;
        contrastCurve: number;
    };
}

export const KINETIC_PRESETS: KineticPreset[] = [
    {
        id: 'instant',
        title: 'Instant Precision',
        description: 'Reação imediata sem latência física. Foco em performance bruta.',
        tokens: {
            animationSpeed: 0.1,
            interfaceElasticity: 0,
            cursorPhysics: false,
            layeredShadows: false,
            contrastCurve: 1.0
        }
    },
    {
        id: 'fluid',
        title: 'Sarak Fluid',
        description: 'O equilíbrio perfeito entre suavidade e resposta tátil.',
        tokens: {
            animationSpeed: 0.4,
            interfaceElasticity: 0.3,
            cursorPhysics: true,
            layeredShadows: true,
            contrastCurve: 1.1
        }
    },
    {
        id: 'organic',
        title: 'Organic Kinetic',
        description: 'Física elástica inspirada em materiais naturais e inércia.',
        tokens: {
            animationSpeed: 0.7,
            interfaceElasticity: 0.8,
            cursorPhysics: true,
            layeredShadows: true,
            contrastCurve: 1.2
        }
    },
    {
        id: 'cinematic',
        title: 'Cinematic Flow',
        description: 'Transições dramáticas e lentas para apresentações de alto impacto.',
        tokens: {
            animationSpeed: 1.2,
            interfaceElasticity: 0.2,
            cursorPhysics: true,
            layeredShadows: true,
            contrastCurve: 1.4
        }
    },
    {
        id: 'aggressive',
        title: 'Hyper-Physical',
        description: 'Movimentos rápidos com alto rebote para interfaces agressivas.',
        tokens: {
            animationSpeed: 0.25,
            interfaceElasticity: 0.9,
            cursorPhysics: true,
            layeredShadows: false,
            contrastCurve: 0.9
        }
    }
];
