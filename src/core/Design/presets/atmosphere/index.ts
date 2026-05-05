export const TEXTURE_LIBRARY = [
    { id: 'none', name: 'Nenhuma' },
    { id: 'dots', name: 'Industrial Dots' },
    { id: 'grid', name: 'Engineering Grid' },
    { id: 'noise', name: 'Atmospheric Noise' },
    { id: 'silk', name: 'Premium Silk' },
    { id: 'circuit', name: 'Quantum Circuit' },
    { id: 'squares', name: 'Geometry Squares' },
    { id: 'honeycomb', name: 'Hex Honeycomb' },
    { id: 'isometric', name: '3D Isometric' },
    { id: 'stripes', name: 'Diagonal Stripes' },
    { id: 'pinstripes', name: 'Vertical Pinstripes' },
    { id: 'crosshatch', name: 'Diagonal Crosshatch' },
    { id: 'blueprint', name: 'Engineering Blueprint' },
    { id: 'micro-dots', name: 'Micro Dots' },
    { id: 'stars', name: 'Star Field' },
    { id: 'constellation', name: 'Constellation' },
    { id: 'circuit-pro', name: 'Circuit Pro' },
    { id: 'radar', name: 'Sonar / Radar' },
    { id: 'carbon', name: 'Carbon Fiber' },
    { id: 'carbon-tech', name: 'Carbon Tech' },
    { id: 'brushed', name: 'Brushed Metal' },
    { id: 'frosted', name: 'Frosted Glass' },
    { id: 'prestige', name: 'Prestige Pattern' },
    { id: 'paper', name: 'Vintage Paper' },
    { id: 'mesh', name: 'Mesh Gradient' },
    { id: 'aurora', name: 'Aurora Deep' },
    { id: 'aurora-classic', name: 'Aurora Classic' },
    { id: 'topo-deep', name: 'Topo Deep' },
    { id: 'prism-mesh', name: 'Prism Mesh' },
    { id: 'cyber-binary', name: 'Cyber Binary' },
    { id: 'blueprint-pro', name: 'Blueprint Pro' },
    { id: 'wave-pulse', name: 'Wave Pulse' },
    { id: 'wood', name: 'Exotic Timber' },
    { id: 'stucco', name: 'Plaster Relief' },
    { id: 'fluid', name: 'Liquid Flow' },
    { id: 'nebula', name: 'Deep Nebula' }
];

export interface AtmospherePreset {
    id: string;
    name: string;
    design: {
        texture: string;
    };
}

export const ATMOSPHERE_PRESETS: AtmospherePreset[] = TEXTURE_LIBRARY.map(texture => ({
    id: texture.id,
    name: texture.name,
    design: {
        texture: texture.id
    }
}));

