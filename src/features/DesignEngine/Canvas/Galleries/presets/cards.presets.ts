export const CARD_PRESETS = [
    {
        id: 'glass',
        title: 'Glassmorphism',
        description: 'Translúcido & Suave',
        tokens: { glassOpacity: 0.7, glassBlur: 20, borderRadius: 24, borderWidth: 1, shadowIntensity: 0.4, isGeometricCut: false }
    },
    {
        id: 'brutalist',
        title: 'Neo-Brutalismo',
        description: 'Bordas Fortes & Sem Blur',
        tokens: { glassOpacity: 1, glassBlur: 0, borderRadius: 0, borderWidth: 3, shadowIntensity: 1, isGeometricCut: true }
    },
    {
        id: 'neon',
        title: 'Cyber Neon',
        description: 'Glow Intenso & Arredondado',
        tokens: { glassOpacity: 0.1, glassBlur: 40, borderRadius: 50, borderWidth: 1, shadowIntensity: 0.8, isGeometricCut: false }
    },
    {
        id: 'elevated',
        title: 'Elevated Modern',
        description: 'Sombra Profunda & Raio Médio',
        tokens: { glassOpacity: 1, glassBlur: 0, borderRadius: 16, borderWidth: 0, shadowIntensity: 0.6, isGeometricCut: false }
    },
    {
        id: 'minimal',
        title: 'Minimal Slate',
        description: 'Clean & Geométrico',
        tokens: { glassOpacity: 0.05, glassBlur: 0, borderRadius: 8, borderWidth: 1, shadowIntensity: 0.1, isGeometricCut: false }
    },
    {
        id: 'chanfered',
        title: 'Industrial Cut',
        description: 'Cortes em Ângulo',
        tokens: { glassOpacity: 0.8, glassBlur: 10, borderRadius: 0, borderWidth: 1, shadowIntensity: 0.5, isGeometricCut: true }
    }
];
