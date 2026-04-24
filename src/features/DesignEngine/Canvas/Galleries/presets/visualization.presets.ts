export const VISUALIZATION_PRESETS = [
    {
        id: 'engine-high-fid',
        title: 'High Fidelity Engine',
        description: 'PBR & Sombras Dinâmicas',
        tokens: { engineQuality: 'high', engineEffects: 'bloom,ssr' }
    },
    {
        id: 'map-cyber-dark',
        title: 'Cyber Dark Map',
        description: 'Estilo Neon & Vetorial',
        tokens: { mapStyle: 'cyber-dark', mapShowBuildings: true }
    },
    {
        id: 'voxel-viz',
        title: 'Voxel Analytics',
        description: 'Renderização Volumétrica',
        tokens: { engineType: 'voxel', engineGrid: true }
    }
];
