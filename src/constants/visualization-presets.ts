/**
 * Sarak Visualization & 3D Presets (v1.0)
 * 
 * Define a estética de renderização de malhas e superfícies abstratas.
 */

export interface VisualizationPreset {
    id: string;
    title: string;
    description: string;
    tokens: {
        vizMode: 'mesh' | 'solid' | 'heatmap';
        wireframeIntensity: number;
        pointDensity: number;
        colorMapping: 'monochrome' | 'spectrum' | 'dual-tone';
        showAxis: boolean;
        rotateSpeed: number;
    };
}

export const VISUALIZATION_PRESETS: VisualizationPreset[] = [
    {
        id: 'topographic-cyber',
        title: 'Topographic Cyber',
        description: 'Malhas verdes de alta densidade inspiradas em radares militares.',
        tokens: {
            vizMode: 'mesh',
            wireframeIntensity: 0.8,
            pointDensity: 0.5,
            colorMapping: 'monochrome',
            showAxis: true,
            rotateSpeed: 1.0
        }
    },
    {
        id: 'abstract-heatmap',
        title: 'Abstract Heatmap',
        description: 'Superfícies orgânicas com mapeamento de calor espectral.',
        tokens: {
            vizMode: 'heatmap',
            wireframeIntensity: 0.2,
            pointDensity: 0.8,
            colorMapping: 'spectrum',
            showAxis: false,
            rotateSpeed: 0.5
        }
    },
    {
        id: 'monochrome-matrix',
        title: 'Monochrome Matrix',
        description: 'Design minimalista em tons de cinza com foco em wireframes sutis.',
        tokens: {
            vizMode: 'solid',
            wireframeIntensity: 0.4,
            pointDensity: 0.3,
            colorMapping: 'dual-tone',
            showAxis: false,
            rotateSpeed: 0.2
        }
    }
];
