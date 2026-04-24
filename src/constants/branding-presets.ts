/**
 * Sarak Branding Presets (v1.0)
 * 
 * Define modelos de identidade e posicionamento de marca.
 */

export interface BrandingPreset {
    id: string;
    title: string;
    description: string;
    tokens: {
        systemName: string;
        systemTone: 'corporate' | 'modern' | 'cyber';
        logoPosition: 'left' | 'center';
        logoScale: number;
        logoUrl?: string;
        logoDarkUrl?: string;
    };
}

export const BRANDING_PRESETS: BrandingPreset[] = [
    {
        id: 'sarak-original',
        title: 'Sarak Original',
        description: 'A identidade nativa: agressiva, centralizada e com tom cyberpunk.',
        tokens: {
            systemName: 'Sarak Matrix',
            systemTone: 'cyber',
            logoPosition: 'center',
            logoScale: 1.2
        }
    },
    {
        id: 'minimal-enterprise',
        title: 'Minimal Enterprise',
        description: 'Foco em seriedade e discrição. Layout clássico corporativo à esquerda.',
        tokens: {
            systemName: 'Sarak Enterprise',
            systemTone: 'corporate',
            logoPosition: 'left',
            logoScale: 0.8
        }
    },
    {
        id: 'future-lab',
        title: 'Future Lab',
        description: 'Identidade moderna e espaçosa com foco em inovação e geometria.',
        tokens: {
            systemName: 'Future Lab',
            systemTone: 'modern',
            logoPosition: 'center',
            logoScale: 1.5
        }
    }
];
