/**
 * Sarak Branding Presets (v12.0)
 * 
 * Define modelos de identidade e posicionamento de marca.
 */

export interface BrandingPreset {
    id: string;
    name: string;
    description: string;
    design: {
        systemName: string;
        systemTone: 'corporate' | 'modern' | 'cyber';
        navigationStyle?: 'sidebar' | 'topbar';
        logoScale: number;
        logoUrl?: string;
        logoDarkUrl?: string;
    };
}

export const BRANDING_PRESETS: BrandingPreset[] = [
    {
        id: 'sarak-original',
        name: 'Sarak Original',
        description: 'A identidade nativa: agressiva e com tom cyberpunk.',
        design: {
            systemName: 'Sarak Matrix',
            systemTone: 'cyber',
            logoScale: 1.2
        }
    },
    {
        id: 'minimal-enterprise',
        name: 'Minimal Enterprise',
        description: 'Foco em seriedade e discrição. Layout clássico corporativo.',
        design: {
            systemName: 'Sarak Enterprise',
            systemTone: 'corporate',
            logoScale: 0.8
        }
    },
    {
        id: 'future-lab',
        name: 'Future Lab',
        description: 'Identidade moderna e espaçosa com foco em inovação.',
        design: {
            systemName: 'Future Lab',
            systemTone: 'modern',
            logoScale: 1.5
        }
    }
];
