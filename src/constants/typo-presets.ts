/**
 * Sarak Typography Presets (v1.0)
 * 
 * Define personalidades tipográficas para o ecossistema Sarak.
 */

export interface TypoPreset {
    id: string;
    name: string;
    description: string;
    tokens: {
        headingFont: string;
        bodyFont: string;
        subtitleFont: string;
        tabFont: string;
        headingWeight: string;
        headingLetterSpacing: number;
        scaleRatio: number;
        useTabularNums: boolean;
        fontScale?: string;
    };
}

export const TYPO_PRESETS: TypoPreset[] = [
    {
        id: 'modern-standard',
        name: 'Modern Standard',
        description: 'A combinação clássica Inter para máxima legibilidade e neutralidade.',
        tokens: {
            headingFont: 'Inter',
            bodyFont: 'Inter',
            subtitleFont: 'Inter',
            tabFont: 'Inter',
            headingWeight: '900',
            headingLetterSpacing: -0.02,
            scaleRatio: 1.15,
            useTabularNums: true
        }
    },
    {
        id: 'industrial-mono',
        name: 'Industrial Mono',
        description: 'Foco em interfaces técnicas e centros de comando com toques mono-espaçados.',
        tokens: {
            headingFont: 'Roboto Mono',
            bodyFont: 'Inter',
            subtitleFont: 'Roboto Mono',
            tabFont: 'Roboto Mono',
            headingWeight: '700',
            headingLetterSpacing: 0.1,
            scaleRatio: 1.0,
            useTabularNums: true
        }
    },
    {
        id: 'cyber-brutalist',
        name: 'Cyber Brutalist',
        description: 'Design agressivo usando Syne para títulos imponentes e largos.',
        tokens: {
            headingFont: 'Syne',
            bodyFont: 'Outfit',
            subtitleFont: 'Syne',
            tabFont: 'Outfit',
            headingWeight: '900',
            headingLetterSpacing: -0.05,
            scaleRatio: 1.4,
            useTabularNums: false
        }
    },
    {
        id: 'elegant-outfit',
        name: 'Elegant Outfit',
        description: 'Suavidade e geometria refinada com fontes arredondadas e amigáveis.',
        tokens: {
            headingFont: 'Outfit',
            bodyFont: 'Outfit',
            subtitleFont: 'Outfit',
            tabFont: 'Outfit',
            headingWeight: '600',
            headingLetterSpacing: 0,
            scaleRatio: 1.1,
            useTabularNums: true
        }
    },
    {
        id: 'editorial-impact',
        name: 'Editorial Impact',
        description: 'Contraste alto para dashboards que precisam de forte hierarquia visual.',
        tokens: {
            headingFont: 'Poppins',
            bodyFont: 'Inter',
            subtitleFont: 'Poppins',
            tabFont: 'Inter',
            headingWeight: '900',
            headingLetterSpacing: -0.03,
            scaleRatio: 1.3,
            useTabularNums: true
        }
    }
];
