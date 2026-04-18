/**
 * Sarak Atomic Design Tokens (v5.5 - Sovereign)
 * 
 * Este arquivo contém o DNA visual do ecossistema Sarak, desacoplado do sarak-lib-shared.
 * Migrado para garantir autonomia total da UI.
 */

export const LAYOUTS = {
    GLASS: { id: 'glass', name: 'Glass Master', class: 'layout-glass', animation: 'perspective', emoji: 'none' },
    CYBERPUNK: { id: 'cyberpunk', name: 'Cyberpunk Neon', class: 'layout-cyberpunk', animation: 'standard', emoji: 'cyber' },
    PRESTIGE: { id: 'prestige', name: 'Prestige Lux', class: 'layout-prestige', animation: 'blur', emoji: 'minimal' },
    ORGANIC: { id: 'organic', name: 'Organic Essence', class: 'layout-organic', animation: 'blur', emoji: 'minimal' },
    ATMOSPHERIC: { id: 'atmospheric', name: 'Atmospheric Deep', class: 'layout-atmospheric', animation: 'perspective', emoji: 'cosmic' },
};

export const SCALES = {
    P1: { id: 'p1', factor: '0.8', label: 'XS' },
    P: { id: 'p', factor: '0.9', label: 'S' },
    M: { id: 'm', factor: '1.0', label: 'M' },
    G: { id: 'g', factor: '1.2', label: 'L' },
    G1: { id: 'g1', factor: '1.4', label: 'XL' },
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
    { id: 'satoshi', name: 'Satoshi Premium', value: "'Satoshi', sans-serif", category: 'sans', weights: [300, 400, 500, 700, 900] },
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
    { id: 'none', name: 'None', className: 'texture-none' },
    { id: 'grid', name: 'Grid Tech', className: 'texture-grid' },
    { id: 'dots', name: 'Dots Clean', className: 'texture-dots' },
    { id: 'noise', name: 'Grain Noise', className: 'texture-noise' },
    { id: 'mesh', name: 'Mesh Gradient', className: 'texture-mesh' },
    { id: 'waves', name: 'Waves Soft', className: 'texture-waves' },
    { id: 'squares', name: 'Geometry Squares', className: 'texture-squares' },
    { id: 'stripes', name: 'Diagonal Stripes', className: 'texture-stripes' },
    { id: 'topo', name: 'Topography', className: 'texture-topo' },
    { id: 'diamond', name: 'Diamond Pattern', className: 'texture-diamond' },
    { id: 'prestige', name: 'Prestige Pattern', className: 'texture-prestige' },
    { id: 'carbon', name: 'Carbon Fiber', className: 'texture-carbon' },
    { id: 'brushed', name: 'Brushed Metal', className: 'texture-brushed' },
    { id: 'frosted', name: 'Frosted Glass', className: 'texture-frosted' },
    { id: 'circuit', name: 'Circuit Tech', className: 'texture-circuit' },
    { id: 'paper', name: 'Vintage Paper', className: 'texture-paper' },
    { id: 'scanlines', name: 'CRT Scanlines', className: 'texture-scanlines' },
    { id: 'hexagon', name: 'Hex Shield', className: 'texture-hexagon' }
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

export const BASE_PRESETS: any = {
    glass: { '--nav-style': 'sidebar', '--sidebar-width': '260px', '--layout-density': 'standard', '--font-heading': "'Outfit', sans-serif", '--font-main': "'Inter', sans-serif", '--radius-theme': '12px', '--surface-material': 'glass', '--bg-texture': 'dots', '--theme-primary': '#3b82f6', '--mode': 'dark' },
    cyberpunk: { '--nav-style': 'sidebar', '--sidebar-width': '240px', '--layout-density': 'compact', '--font-heading': "'Syncopate', sans-serif", '--font-main': "'Space Mono', monospace", '--radius-theme': '0px', '--surface-material': 'acrylic', '--bg-texture': 'circuit', '--theme-primary': '#00ff41', '--mode': 'dark' },
    prestige: { '--nav-style': 'topbar', '--sidebar-width': '280px', '--layout-density': 'comfortable', '--font-heading': "'Sentient', serif", '--font-main': "'Inter', sans-serif", '--radius-theme': '24px', '--surface-material': 'brushed', '--bg-texture': 'silk', '--theme-primary': '#a855f7', '--mode': 'dark' },
    organic: { '--nav-style': 'sidebar', '--sidebar-width': '260px', '--layout-density': 'standard', '--font-heading': "'Cormorant Garamond', serif", '--font-main': "'Plus Jakarta Sans', sans-serif", '--radius-theme': '40px', '--surface-material': 'matte', '--bg-texture': 'dots', '--theme-primary': '#10b981', '--mode': 'light' },
    atmospheric: { '--nav-style': 'sidebar', '--sidebar-width': '300px', '--layout-density': 'comfortable', '--font-heading': "'Satoshi', sans-serif", '--font-main': "'Inter', sans-serif", '--radius-theme': '32px', '--surface-material': 'acrylic', '--bg-texture': 'aurora', '--theme-primary': '#f472b6', '--mode': 'dark' }
};
