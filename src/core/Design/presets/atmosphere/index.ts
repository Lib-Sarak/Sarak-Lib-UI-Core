export const TEXTURE_LIBRARY = [
    { id: 'none', label: 'Nenhuma' },
    { id: 'grid', label: 'Grid Técnico' },
    { id: 'dots', label: 'Pontos (Dotted)' },
    { id: 'noise', label: 'Ruído Analógico' },
    { id: 'grain', label: 'Grão Fotográfico' },
    { id: 'mesh', label: 'Mesh Orgânico' },
    { id: 'waves', label: 'Ondas Senoidais' },
    { id: 'squares', label: 'Quadrados Industriais' },
    { id: 'stripes', label: 'Listras Militares' },
    { id: 'topo', label: 'Topografia' },
    { id: 'diamond', label: 'Diamante' },
    { id: 'prestige', label: 'Prestige' },
    { id: 'carbon', label: 'Fibra de Carbono' },
    { id: 'brushed', label: 'Metal Escovado' },
    { id: 'frosted', label: 'Vidro Fosco (Frosted)' },
    { id: 'circuit', label: 'Circuitos (Classic)' },
    { id: 'paper', label: 'Papel Craft' },
    { id: 'scanlines', label: 'Scanlines (CRT)' },
    { id: 'hexagon', label: 'Hexagonais (Céptico)' },
    { id: 'silk', label: 'Seda Líquida' },
    { id: 'blueprint', label: 'Blueprint (Cianótipo)' },
    { id: 'aurora', label: 'Aurora Boreal' },
    { id: 'stars', label: 'Campo Estelar' },
    { id: 'honeycomb', label: 'Favo de Mel' },
    { id: 'isometric', label: 'Projeção Isométrica' },
    { id: 'radar', label: 'Radar Tático' },
    { id: 'crosshatch', label: 'Crosshatch' },
    { id: 'micro-dots', label: 'Micro-Pontos' },
    { id: 'pinstripes', label: 'Pinstripes' },
    { id: 'constellation', label: 'Constelação' },
    { id: 'circuit-pro', label: 'Circuitos (Pro)' },
    { id: 'carbon-tech', label: 'Carbon Tech' },
    { id: 'topo-deep', label: 'Topografia Profunda' },
    { id: 'prism-mesh', label: 'Prism Mesh' },
    { id: 'cyber-binary', label: 'Código Binário' },
    { id: 'blueprint-pro', label: 'Blueprint Pro' },
    { id: 'wave-pulse', label: 'Pulso de Onda' },
    { id: 'wood', label: 'Madeira (Organic)' },
    { id: 'stucco', label: 'Stucco (Parede)' },
    { id: 'fluid', label: 'Fluido Dinâmico' },
    { id: 'nebula', label: 'Nebulosa' }
];

export interface AtmospherePreset {
    id: string;
    label: string;
    design: {
        texture: string;
    };
}

export const ATMOSPHERE_PRESETS: AtmospherePreset[] = TEXTURE_LIBRARY.map(texture => ({
    id: texture.id,
    label: texture.label,
    design: {
        texture: texture.id
    }
}));

