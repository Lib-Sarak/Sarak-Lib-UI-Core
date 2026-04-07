/**
 * Sarak Elite v5.4 - Theme System Constants
 * 
 * Este arquivo contém as definições fundamentais portadas para garantir que
 * a UI-Core seja 100% autônoma e independente da Shared para renderização visual.
 */

export const LAYOUTS = {
    // --- COLEÇÃO PREMIUM 2024 (20+ TEMAS) ---
    BRUTALIST: { id: 'brutalist', name: 'Brutalist Raw', class: 'layout-main', animation: 'none', emoji: 'cyber' },
    ORGANIC: { id: 'organic', name: 'Organic Nature', class: 'layout-prestige', animation: 'blur', emoji: 'minimal' },
    CYBERPUNK_PREMIUM: { id: 'cyberpunk_v1', name: 'Cyberpunk Neon', class: 'layout-cyberpunk', animation: 'standard', emoji: 'cyber' },
    EDITORIAL_PREMIUM: { id: 'editorial_v1', name: 'Editorial Luxury', class: 'layout-editorial', animation: 'blur', emoji: 'none' },
    PLAYFUL: { id: 'playful', name: 'Playful Fun', class: 'layout-corporate', animation: 'elastic', emoji: 'gamer' },
    NEUMORPHIC: { id: 'neumorphic', name: 'Neumorphic Soft', class: 'layout-corporate', animation: 'fade', emoji: 'minimal' },
    TERMINAL_PREMIUM: { id: 'terminal_v1', name: 'Terminal Hack', class: 'layout-terminal', animation: 'slideUp', emoji: 'cyber' },
    ETHEREAL: { id: 'ethereal', name: 'Ethereal Mist', class: 'layout-ethereal', animation: 'perspective', emoji: 'cosmic' },
    INDUSTRIAL: { id: 'industrial', name: 'Industrial Hard', class: 'layout-main', animation: 'none', emoji: 'cyber' },
    RETRO: { id: 'retro', name: 'Retro 80s', class: 'layout-corporate', animation: 'fade', emoji: 'none' },
    MAINFRAME: { id: 'mainframe', name: 'Mainframe CLI', class: 'layout-mainframe', animation: 'none', emoji: 'cyber' },
    MODERN_ORGANIC: { id: 'modern_organic', name: 'Modern Organic', class: 'layout-glass', animation: 'perspective', emoji: 'minimal' },
    EDITORIAL_V2: { id: 'editorial_v2', name: 'Editorial V2', class: 'layout-prestige', animation: 'blur', emoji: 'none' },
    BRUTAL: { id: 'brutal', name: 'Brutal Neo', class: 'layout-main', animation: 'none', emoji: 'cyber' },
    CYBERPUNK_V2: { id: 'cyberpunk_v2', name: 'Cyberpunk V2', class: 'layout-cyberpunk', animation: 'standard', emoji: 'cyber' },
    COMPACT_LAYOUT: { id: 'compact_layout', name: 'Compact Dash', class: 'layout-corporate', animation: 'fade', emoji: 'none' },
    ELEVATED: { id: 'elevated', name: 'Elevated Float', class: 'layout-corporate', animation: 'slideUp', emoji: 'minimal' },
    HELVETICA: { id: 'helvetica', name: 'Helvetica Swiss', class: 'layout-corporate', animation: 'fade', emoji: 'none' },
    NEBULA: { id: 'nebula', name: 'Nebula Frosted', class: 'layout-glass', animation: 'perspective', emoji: 'cosmic' },
    BLUEPRINT: { id: 'blueprint', name: 'Blueprint Tech', class: 'layout-main', animation: 'none', emoji: 'cyber' },

    // --- TEMAS BÁSICOS ---
    GLASS: { id: 'glass', name: 'Modern Glass', class: 'layout-glass', animation: 'perspective', emoji: 'none' },
    CORPORATE: { id: 'corporate', name: 'Solid Corporate', class: 'layout-corporate', animation: 'fade', emoji: 'none' },
    MINIMAL: { id: 'minimal', name: 'Minimal Clean', class: 'layout-minimal', animation: 'slideUp', emoji: 'minimal' },
    TECHNICAL: { id: 'technical', name: 'Technical Analytics', class: 'layout-technical', animation: 'none', emoji: 'cyber' },
    PRESTIGE: { id: 'prestige', name: 'Prestige Editorial', class: 'layout-prestige', animation: 'blur', emoji: 'minimal' },
    ATMOSPHERIC: { id: 'atmospheric', name: 'Deep Atmospheric', class: 'layout-atmospheric', animation: 'perspective', emoji: 'cosmic' },
    ZEN_PARCHMENT: { id: 'zen_parchment', name: 'Zen Parchment', class: 'layout-zen_parchment', animation: 'blur', emoji: 'minimal' },
    FINANCE_PRO: { id: 'finance_pro', name: 'Finance Pro', class: 'layout-finance_pro', animation: 'slideDown', emoji: 'finance' },
    GAMER_ELITE: { id: 'gamer_elite', name: 'Gamer Elite', class: 'layout-gamer_elite', animation: 'standard', emoji: 'gamer' },
    TERMINAL_RETRO: { id: 'terminal_retro', name: 'Terminal Retro', class: 'layout-terminal', animation: 'slideUp', emoji: 'cyber' },
    FORMAL_EXECUTIVO: { id: 'formal_executivo', name: 'Formal Executivo', class: 'layout-corporate', animation: 'fade', emoji: 'none' },
    APPLE_MACOS: { id: 'apple_macos', name: 'Apple macOS', class: 'layout-glass', animation: 'perspective', emoji: 'none' },
};

export const SCALES = {
    P1: { id: 'p1', factor: '0.8', label: 'XS' },
    P: { id: 'p', factor: '0.9', label: 'S' },
    M: { id: 'm', factor: '1.0', label: 'M' },
    G: { id: 'g', factor: '1.2', label: 'L' },
    G1: { id: 'g1', factor: '1.4', label: 'XL' },
};

export const DENSITY = {
    COMPACT: { id: 'compact', gap: '0.75rem', pad: '0.75rem', radius: '8px', label: 'Compact' },
    STANDARD: { id: 'standard', gap: '1.5rem', pad: '1.5rem', radius: '12px', label: 'Standard' },
    COMFORTABLE: { id: 'comfortable', gap: '2rem', pad: '2rem', radius: '20px', label: 'Comfortable' }
};

export const PRIMARY_COLORS = [
    { name: 'Emerald', value: '#10b981' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Mint', value: '#6ee7b7' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Royal', value: '#2563eb' },
    { name: 'Sky', value: '#60a5fa' },
    { name: 'Turquoise', value: '#2dd4bf' },
    // Row 2
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Gold', value: '#eab308' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Crimson', value: '#ef4444' },
    { name: 'Fuchsia', value: '#d946ef' },
    { name: 'Purple', value: '#a855f7' },
    // Row 3
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Lavender', value: '#8b5cf6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Dark Teal', value: '#0d9488' },
    { name: 'Lime', value: '#84cc16' },
    { name: 'Violet', value: '#7c3aed' },
    { name: 'Magenta', value: '#ec4899' }
];
