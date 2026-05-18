/**
 * Sarak Design Engine - Overlay Presets (v1.0)
 * 
 * Presets data-driven para a subcategoria de Modais & Profundidade.
 * Cada preset define o estado completo de todos os componentes reguláveis da subcategoria.
 */

export interface OverlayPreset {
    id: string;
    name: string;
    description: string;
    design: {
        modalOverlayColor: string;
        modalOverlayBlur: number;
        modalBorderRadius: number;
        tooltipBg: string;
        tooltipRadius: number;
        [key: string]: any;
    };
}

export const OVERLAY_PRESETS: OverlayPreset[] = [
    {
        id: 'stealth-dark',
        name: 'Stealth Dark',
        description: 'Overlay de profundidade escura opaca para foco absoluto.',
        design: {
            modalOverlayColor: 'rgba(5, 5, 8, 0.85)',
            modalOverlayBlur: 16,
            modalBorderRadius: 8,
            tooltipBg: '#09090b',
            tooltipRadius: 4
        }
    },
    {
        id: 'cyber-neon-overlay',
        name: 'Cyber Neon Overlay',
        description: 'Efeito de desfoque extremo com leve matiz neon.',
        design: {
            modalOverlayColor: 'rgba(0, 242, 255, 0.05)',
            modalOverlayBlur: 24,
            modalBorderRadius: 4,
            tooltipBg: '#090d16',
            tooltipRadius: 2
        }
    },
    {
        id: 'glass-frosted-overlay',
        name: 'Frosted Glass Overlay',
        description: 'Efeito clássico de vidro fosco com blur refinado.',
        design: {
            modalOverlayColor: 'rgba(255, 255, 255, 0.03)',
            modalOverlayBlur: 12,
            modalBorderRadius: 24,
            tooltipBg: '#1e293b',
            tooltipRadius: 8
        }
    },
    {
        id: 'abyssal-void',
        name: 'Abyssal Void',
        description: 'Profundidade máxima sem desfoque (100% opaco).',
        design: {
            modalOverlayColor: 'rgba(0, 0, 0, 0.95)',
            modalOverlayBlur: 0,
            modalBorderRadius: 16,
            tooltipBg: '#020203',
            tooltipRadius: 6
        }
    }
];
