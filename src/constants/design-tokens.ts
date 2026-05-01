/**
 * Sarak Atomic Design Tokens (v5.5 - Sovereign)
 * 
 * Este arquivo contém o DNA visual do ecossistema Sarak, desacoplado do sarak-lib-shared.
 * Migrado para garantir autonomia total da UI.
 */



export const SCALES = {
    PP: { id: 'pp', factor: '0.7', label: 'PP' },
    P: { id: 'p', factor: '0.85', label: 'P' },
    M: { id: 'm', factor: '1.0', label: 'M' },
    G: { id: 'g', factor: '1.25', label: 'G' },
    GG: { id: 'gg', factor: '1.5', label: 'GG' },
};

export const DENSITY = {
    COMPACT: { id: 'compact', gap: '0.5rem', pad: '0.75rem', fontSizeBase: '11px', radius: '8px', label: 'Compact' },
    STANDARD: { id: 'standard', gap: '1.25rem', pad: '1.5rem', fontSizeBase: '13px', radius: '12px', label: 'Standard' },
    COMFORTABLE: { id: 'comfortable', gap: '2rem', pad: '2rem', fontSizeBase: '15px', radius: '20px', label: 'Comfortable' }
};

export const PRIMARY_COLORS = [
    { name: 'Emerald', value: '#10b981' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Mint', value: '#6ee7b7' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Royal', value: '#2563eb' },
    { name: 'Sky', value: '#60a5fa' },
    { name: 'Turquoise', value: '#2dd4bf' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Gold', value: '#eab308' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Crimson', value: '#ef4444' },
    { name: 'Fuchsia', value: '#d946ef' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Lavender', value: '#8b5cf6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Dark Teal', value: '#0d9488' },
    { name: 'Lime', value: '#84cc16' },
    { name: 'Violet', value: '#7c3aed' },
    { name: 'Magenta', value: '#ec4899' }
];

export const COLOR_PALETTES = [
    {
        id: 'cyberpunk',
        name: 'Cyber Neon',
        colors: { 
            primary: '#f43f5e',   // Rose Neon
            secondary: '#7000ff', // Deep Purple
            accent: '#06b6d4',    // Cyan Spark
            surface: '#0f172a',   // Slate Dark
            success: '#10b981',
            warning: '#facc15',
            error: '#ef4444'
        }
    },
    {
        id: 'nature',
        name: 'Bio Nature',
        colors: { 
            primary: '#10b981',   // Emerald
            secondary: '#365314', // Moss Green
            accent: '#fde047',    // Sun Yellow
            surface: '#064e3b',   // Deep Forest
            success: '#34d399',
            warning: '#fbbf24',
            error: '#ef4444'
        }
    },
    {
        id: 'ocean',
        name: 'Deep Ocean',
        colors: { 
            primary: '#0ea5e9',   // Ocean Blue
            secondary: '#1e3a8a', // Midnight Blue
            accent: '#2dd4bf',    // Turquoise
            surface: '#081431',   // Abyssal
            success: '#10b981',
            warning: '#f59e0b',
            error: '#f43f5e'
        }
    },
    {
        id: 'royal',
        name: 'Royal Majesty',
        colors: { 
            primary: '#8b5cf6',   // Purple
            secondary: '#4c1d95', // Indigo Dark
            accent: '#fbbf24',    // Gold
            surface: '#1e1b4b',   // Royal Night
            success: '#14b8a6',
            warning: '#eab308',
            error: '#be123c'
        }
    },
    {
        id: 'sunset',
        name: 'Warm Sunset',
        colors: { 
            primary: '#f97316',   // Orange
            secondary: '#7c2d12', // Burnt Sienna
            accent: '#fcd34d',    // Amber
            surface: '#2d0a05',   // Twilight
            success: '#84cc16',
            warning: '#f59e0b',
            error: '#e11d48'
        }
    },
    {
        id: 'monochrome',
        name: 'Dark Matter',
        colors: { 
            primary: '#94a3b8',   // Slate
            secondary: '#1e293b', // Deep Slate
            accent: '#f1f5f9',    // Ghost White
            surface: '#020617',   // Void
            success: '#10b981',
            warning: '#eab308',
            error: '#ef4444'
        }
    },
    {
        id: 'industrial-night',
        name: 'Industrial Night (v10)',
        colors: { 
            primary: '#00f2ff',   // Sarak Neon
            secondary: '#7000ff', // Purple Tech
            accent: '#ff0055',    // Red Alert
            surface: '#0a0a0c',   // Deep Carbon
            body: '#020203',      // Absolute Void
            success: '#00ff88',
            warning: '#ffcc00',
            error: '#ff3344'
        }
    }
];

export const NAVIGATION_STYLES = {
    SIDEBAR: 'sidebar',
    TOPBAR: 'topbar',
    FLOATING: 'floating',
    MINIMAL: 'minimal'
};

export const LANGUAGES = [
    { id: 'pt', label: 'PT', name: 'Português', flag: '🇧🇷', sigla: 'PT' },
    { id: 'en', label: 'EN', name: 'English', flag: '🇺🇸', sigla: 'EN' },
    { id: 'es', label: 'ES', name: 'Español', flag: '🇪🇸', sigla: 'ES' },
    { id: 'fr', label: 'FR', name: 'Français', flag: '🇫🇷', sigla: 'FR' },
    { id: 'de', label: 'DE', name: 'Deutsch', flag: '🇩🇪', sigla: 'DE' },
    { id: 'it', label: 'IT', name: 'Italiano', flag: '🇮🇹', sigla: 'IT' },
];

export const ALL_LANGUAGES = LANGUAGES;

export const THEME_FONTS = [
    { id: 'satoshi', name: 'Satoshi Pro', value: "'Satoshi', sans-serif", category: 'sans', weights: [300, 400, 500, 700, 900] },
    { id: 'cabinet', name: 'Cabinet Grotesk', value: "'Cabinet Grotesk', sans-serif", category: 'sans', weights: [400, 700, 800, 900] },
    { id: 'inter', name: 'Inter Dynamic', value: "'Inter', sans-serif", category: 'sans', weights: [300, 400, 500, 600, 700] },
    { id: 'outfit', name: 'Outfit Tech', value: "'Outfit', sans-serif", category: 'sans', weights: [300, 400, 600, 800] },
    { id: 'sentient', name: 'Sentient Serif', value: "'Sentient', serif", category: 'serif', weights: [400, 500, 700] },
    { id: 'clash', name: 'Clash Display', value: "'Clash Display', sans-serif", category: 'display', weights: [500, 600, 700] },
    { id: 'jetbrains', name: 'JetBrains Mono', value: "'JetBrains Mono', monospace", category: 'mono', weights: [400, 500, 700] },
    { id: 'space-mono', name: 'Space Mono', value: "'Space Mono', monospace", category: 'mono', weights: [400, 700] },
    { id: 'playfair', name: 'Playfair Classic', value: "'Playfair Display', serif", category: 'serif', weights: [400, 700, 900] },
    { id: 'fraunces', name: 'Fraunces Vintage', value: "'Fraunces', serif", category: 'serif', weights: [400, 700, 900] },
    { id: 'bricolage', name: 'Bricolage Grotesque', value: "'Bricolage Grotesque', sans-serif", category: 'display', weights: [400, 700, 800] },
    { id: 'public-sans', name: 'Public Corporate', value: "'Public Sans', sans-serif", category: 'sans', weights: [400, 500, 700] },
    { id: 'space-grotesk', name: 'Space Tech', value: "'Space Grotesk', sans-serif", category: 'display', weights: [300, 500, 700] }
];

export const TEXTURE_LIBRARY = [
    // 1. Base / Vazio
    { id: 'none', name: 'None', className: 'texture-none' },

    // 2. Geometria & Linhas
    { id: 'grid', name: 'Grid Tech', className: 'texture-grid' },
    { id: 'squares', name: 'Geometry Squares', className: 'texture-squares' },
    { id: 'honeycomb', name: 'Hex Honeycomb', className: 'texture-honeycomb' },
    { id: 'isometric', name: '3D Isometric', className: 'texture-isometric' },
    { id: 'stripes', name: 'Diagonal Stripes', className: 'texture-stripes' },
    { id: 'pinstripes', name: 'Vertical Pinstripes', className: 'texture-pinstripes' },
    { id: 'crosshatch', name: 'Diagonal Crosshatch', className: 'texture-crosshatch' },
    { id: 'blueprint', name: 'Engineering', className: 'texture-blueprint' },

    // 3. Pontilhados & Partículas
    { id: 'dots', name: 'Dots Clean', className: 'texture-dots' },
    { id: 'micro-dots', name: 'Micro Dots', className: 'texture-micro-dots' },
    { id: 'stars', name: 'Star Field', className: 'texture-stars' },
    { id: 'noise', name: 'Grain Noise', className: 'texture-noise' },

    // 4. Industrial & Tech
    { id: 'circuit', name: 'Circuit Tech', className: 'texture-circuit' },
    { id: 'radar', name: 'Sonar / Radar', className: 'texture-radar' },
    { id: 'carbon', name: 'Carbon Fiber', className: 'texture-carbon' },
    { id: 'brushed', name: 'Brushed Metal', className: 'texture-brushed' },

    // 5. Materiais Orgânicos & Clássicos
    { id: 'silk', name: 'Silk Flow', className: 'texture-silk' },
    { id: 'frosted', name: 'Frosted Glass', className: 'texture-frosted' },
    { id: 'prestige', name: 'Prestige Pattern', className: 'texture-prestige' },
    { id: 'paper', name: 'Vintage Paper', className: 'texture-paper' },

    // 6. Gradientes & Atmosferas (Aurora)
    { id: 'mesh', name: 'Mesh Gradient', className: 'texture-mesh' },
    { id: 'aurora', name: 'Aurora Deep', className: 'texture-aurora' },
    { id: 'aurora-classic', name: 'Aurora Classic', className: 'texture-aurora-classic' }
];

export const THEME_EFFECTS = {
    page: {
        none: { name: 'None', page: { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 } } },
        fade: { name: 'Smooth Fade', page: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.4 } } },
        slideUp: { name: 'Slide Up', page: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -30 }, transition: { duration: 0.5 } } },
        slideLeft: { name: 'Slide Left', page: { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -50 }, transition: { duration: 0.5 } } },
        scale: { name: 'Zoom Bounce', page: { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.05 }, transition: { duration: 0.4 } } },
        blur: { name: 'Atmospheric', page: { initial: { opacity: 0, filter: 'blur(10px)' }, animate: { opacity: 1, filter: 'blur(0px)' }, exit: { opacity: 0, filter: 'blur(10px)' }, transition: { duration: 0.6 } } },
        perspective: { name: '3D Perspective', page: { initial: { opacity: 0, rotateX: 20, scale: 0.9, y: 20 }, animate: { opacity: 1, rotateX: 0, scale: 1, y: 0 }, exit: { opacity: 0, rotateX: -20, scale: 1.1, y: -20 }, transition: { duration: 0.7 } } },
        flip: { name: '3D Flip', page: { initial: { opacity: 0, rotateY: 90 }, animate: { opacity: 1, rotateY: 0 }, exit: { opacity: 0, rotateY: -90 }, transition: { duration: 0.6 } } },
        slideDown: { name: 'Slide Down', page: { initial: { opacity: 0, y: -50 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 50 }, transition: { duration: 0.5 } } },
        elastic: { name: 'Elastic Tech', page: { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.5 }, transition: { type: 'spring', damping: 12, stiffness: 100 } } }
    },
    hover: {
        none: {},
        lift: { whileHover: { y: -5, scale: 1.02 }, whileTap: { scale: 0.98 } },
        glow: { whileHover: { boxShadow: "0 0 25px var(--primary-color)", scale: 1.05 } },
        glass: { whileHover: { backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" } },
        outline: { whileHover: { outline: "2px solid var(--primary-color)", outlineOffset: "4px" } }
    }
};

export const DASHBOARD_TEMPLATES = [
    { id: 'executive', name: 'Executive Summary', description: 'Visão limpa e estratégica' },
    { id: 'monitoring', name: 'Real-time Monitoring', description: 'Alta densidade de telemetria' },
    { id: 'analytics', name: 'Deep Analytics', description: 'Análise massiva de dados' },
    { id: 'technical', name: 'System Telemetry', description: 'Estilo Industrial / OS' },
    { id: 'minimal', name: 'Minimalist View', description: 'Foco total no dado bruto' }
];

export const CHART_PRESETS = [
    { id: 'standard', name: 'Standard Sarak', description: 'Equilibrado e limpo' },
    { id: 'glow', name: 'Neon Glow', description: 'Efeito vibrante e moderno' },
    { id: 'tech', name: 'Industrial Tech', description: 'Angular e denso' },
    { id: 'minimal', name: 'Ultra Minimal', description: 'Sem adornos' }
];



