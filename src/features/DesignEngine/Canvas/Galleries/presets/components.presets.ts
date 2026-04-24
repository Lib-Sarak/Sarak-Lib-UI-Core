export const COMPONENT_PRESETS = [
    {
        id: 'solid-surface',
        title: 'Solid Surface',
        description: 'Fundo Preenchido',
        tokens: { borderType: 'none', surfaceMaterial: 'solid' }
    },
    {
        id: 'glass-border',
        title: 'Glass Border',
        description: 'Borda Translúcida',
        tokens: { borderType: 'glass', surfaceMaterial: 'glass' }
    },
    {
        id: 'neon-glow',
        title: 'Neon Glow',
        description: 'Borda com Brilho',
        tokens: { borderType: 'neon', surfaceMaterial: 'none' }
    }
];
