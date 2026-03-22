export const BASE_PRESETS = {
    // --- COLEÇÃO PREMIUM 2024 (20 TEMAS) ---

    // 1. Brutalist
    brutalist: {
        '--radius-theme': '0px', '--font-main': "'Space Grotesk', sans-serif", '--font-heading': "'Anton', sans-serif",
        '--theme-padding': '2rem', '--theme-gap': '2rem', '--glass-blur': '0px', '--glass-opacity': '1',
        '--font-weight-heading': '400', '--letter-spacing-heading': '0.02em', '--border-width': '4px',
        '--shadow-intensity': '1', '--card-style': 'solid', '--bg-texture': 'dots'
    },
    // 2. Organic
    organic: {
        '--radius-theme': '40px', '--font-main': "'Lora', serif", '--font-heading': "'Cormorant Garamond', serif",
        '--theme-padding': '2.5rem', '--theme-gap': '2rem', '--glass-blur': '8px', '--glass-opacity': '0.9',
        '--font-weight-heading': '600', '--letter-spacing-heading': '-0.01em', '--border-width': '0px',
        '--shadow-intensity': '0.08', '--card-style': 'soft', '--bg-texture': 'paper',
        '--bg-body': '#f8f9f5', '--bg-card': '#ffffff'
    },
    // 3. Cyberpunk Premium
    cyberpunk_v1: {
        '--radius-theme': '0px', '--font-main': "'Rajdhani', sans-serif", '--font-heading': "'Orbitron', sans-serif",
        '--theme-padding': '1.5rem', '--theme-gap': '1.5rem', '--glass-blur': '4px', '--glass-opacity': '0.85',
        '--font-weight-heading': '800', '--letter-spacing-heading': '0.1em', '--border-width': '1px',
        '--shadow-intensity': '0.6', '--card-style': 'glass', '--bg-texture': 'scanlines'
    },
    // 4. Editorial Luxury
    editorial_v1: {
        '--radius-theme': '0px', '--font-main': "'Helvetica Neue', sans-serif", '--font-heading': "'Playfair Display', serif",
        '--theme-padding': '3rem', '--theme-gap': '2.5rem', '--glass-blur': '0px', '--glass-opacity': '1',
        '--font-weight-heading': '900', '--letter-spacing-heading': '-0.04em', '--border-width': '1px',
        '--shadow-intensity': '0', '--card-style': 'solid', '--bg-texture': 'none'
    },
    // 5. Playful
    playful: {
        '--radius-theme': '24px', '--font-main': "'Quicksand', sans-serif", '--font-heading': "'Fredoka One', cursive",
        '--theme-padding': '1.5rem', '--theme-gap': '1.5rem', '--glass-blur': '0px', '--glass-opacity': '1',
        '--font-weight-heading': '400', '--letter-spacing-heading': '0.02em', '--border-width': '3px',
        '--shadow-intensity': '0.15', '--card-style': 'solid', '--bg-texture': 'confetti'
    },
    // 6. Neumorphic
    neumorphic: {
        '--radius-theme': '20px', '--font-main': "'Nunito', sans-serif", '--font-heading': "'Nunito', sans-serif",
        '--theme-padding': '2rem', '--theme-gap': '1.5rem', '--glass-blur': '0px', '--glass-opacity': '1',
        '--font-weight-heading': '700', '--letter-spacing-heading': '0', '--border-width': '0px',
        '--shadow-intensity': '0.2', '--card-style': 'soft', '--bg-texture': 'none'
    },
    // 7. Terminal Premium
    terminal_v1: {
        '--radius-theme': '0px', '--font-main': "'Fira Code', monospace", '--font-heading': "'Fira Code', monospace",
        '--theme-padding': '1.25rem', '--theme-gap': '1rem', '--glass-blur': '0px', '--glass-opacity': '1',
        '--font-weight-heading': '500', '--letter-spacing-heading': '0', '--border-width': '1px',
        '--shadow-intensity': '0', '--card-style': 'solid', '--bg-texture': 'scanlines'
    },
    // 8. Ethereal
    ethereal: {
        '--radius-theme': '100px', '--font-main': "'Inter', sans-serif", '--font-heading': "'Cinzel', serif",
        '--theme-padding': '2rem', '--theme-gap': '3rem', '--glass-blur': '60px', '--glass-opacity': '0.15',
        '--font-weight-heading': '300', '--letter-spacing-heading': '0.1em', '--border-width': '1px',
        '--shadow-intensity': '0.05', '--card-style': 'glass', '--bg-texture': 'aurora'
    },
    // 9. Industrial
    industrial: {
        '--radius-theme': '2px', '--font-main': "'Roboto Mono', monospace", '--font-heading': "'Oswald', sans-serif",
        '--theme-padding': '1rem', '--theme-gap': '0.75rem', '--glass-blur': '0px', '--glass-opacity': '1',
        '--font-weight-heading': '700', '--letter-spacing-heading': '0.05em', '--border-width': '2px',
        '--shadow-intensity': '0.3', '--card-style': 'solid', '--bg-texture': 'grid'
    },
    // 10. Retro
    retro: {
        '--radius-theme': '8px', '--font-main': "'Courier New', monospace", '--font-heading': "'Times New Roman', serif",
        '--theme-padding': '1.25rem', '--theme-gap': '1.25rem', '--glass-blur': '0px', '--glass-opacity': '1',
        '--font-weight-heading': '700', '--letter-spacing-heading': '0', '--border-width': '2px',
        '--shadow-intensity': '0.4', '--card-style': 'solid', '--bg-texture': 'noise'
    },
    // 11. Mainframe
    mainframe: {
        '--radius-theme': '2px', '--font-main': "'JetBrains Mono', monospace", '--font-heading': "'Share Tech Mono', monospace",
        '--theme-padding': '0.75rem', '--theme-gap': '0.5rem', '--glass-blur': '8px', '--glass-opacity': '0.8',
        '--font-weight-heading': '400', '--letter-spacing-heading': '0.1em', '--border-width': '2px',
        '--shadow-intensity': '0', '--card-style': 'glass', '--bg-texture': 'scanlines',
        '--bg-body': '#000000', '--bg-card': '#050814'
    },
    // 12. Modern Organic
    modern_organic: {
        '--radius-theme': '40px', '--font-main': "'Plus Jakarta Sans', sans-serif", '--font-heading': "'Plus Jakarta Sans', sans-serif",
        '--theme-padding': '2.5rem', '--theme-gap': '1.5rem', '--glass-blur': '10px', '--glass-opacity': '0.5',
        '--font-weight-heading': '700', '--letter-spacing-heading': '-0.04em', '--border-width': '0px',
        '--shadow-intensity': '0.12', '--card-style': 'glass', '--bg-texture': 'grain'
    },
    // 13. Editorial V2
    editorial_v2: {
        '--radius-theme': '0px', '--font-main': "'Lora', serif", '--font-heading': "'Playfair Display', serif",
        '--theme-padding': '3.5rem', '--theme-gap': '3rem', '--glass-blur': '0px', '--glass-opacity': '1',
        '--font-weight-heading': '500', '--letter-spacing-heading': '0', '--border-width': '1px',
        '--shadow-intensity': '0.03', '--card-style': 'solid', '--bg-texture': 'paper'
    },
    // 14. Brutal Neo
    brutal: {
        '--radius-theme': '0px', '--font-main': "'Archivo Black', sans-serif", '--font-heading': "'Archivo Black', sans-serif",
        '--theme-padding': '1.5rem', '--theme-gap': '1.5rem', '--glass-blur': '0px', '--glass-opacity': '1',
        '--font-weight-heading': '900', '--letter-spacing-heading': '-0.01em', '--border-width': '3px',
        '--shadow-intensity': '1', '--card-style': 'solid', '--bg-texture': 'none'
    },
    // 15. Cyberpunk V2
    cyberpunk_v2: {
        '--radius-theme': '8px', '--font-main': "'Space Grotesk', sans-serif", '--font-heading': "'Syncopate', sans-serif",
        '--theme-padding': '1.25rem', '--theme-gap': '1.25rem', '--glass-blur': '5px', '--glass-opacity': '0.8',
        '--font-weight-heading': '700', '--letter-spacing-heading': '0.2em', '--border-width': '1px',
        '--shadow-intensity': '0.4', '--card-style': 'glass', '--bg-texture': 'grid'
    },
    // 16. Compact Dash
    compact: {
        '--radius-theme': '4px', '--font-main': "'Inter', sans-serif", '--font-heading': "'Inter', sans-serif",
        '--theme-padding': '0.5rem', '--theme-gap': '0.5rem', '--glass-blur': '0px', '--glass-opacity': '1',
        '--font-weight-heading': '600', '--letter-spacing-heading': '-0.01em', '--border-width': '1px',
        '--shadow-intensity': '0.05', '--card-style': 'solid', '--bg-texture': 'none'
    },
    // 17. Elevated Float
    elevated: {
        '--radius-theme': '16px', '--font-main': "'Figtree', sans-serif", '--font-heading': "'Figtree', sans-serif",
        '--theme-padding': '2rem', '--theme-gap': '2rem', '--glass-blur': '0px', '--glass-opacity': '1',
        '--font-weight-heading': '700', '--letter-spacing-heading': '-0.02em', '--border-width': '0px',
        '--shadow-intensity': '0.25', '--card-style': 'solid', '--bg-texture': 'soft-gradient'
    },
    // 18. Helvetica Swiss
    helvetica: {
        '--radius-theme': '0px', '--font-main': "'Inter', sans-serif", '--font-heading': "'Inter', sans-serif",
        '--theme-padding': '1.5rem', '--theme-gap': '1rem', '--glass-blur': '0px', '--glass-opacity': '1',
        '--font-weight-heading': '800', '--letter-spacing-heading': '-0.05em', '--border-width': '1px',
        '--shadow-intensity': '0.1', '--card-style': 'solid', '--bg-texture': 'dots'
    },
    // 19. Nebula Frosted
    nebula: {
        '--radius-theme': '20px', '--font-main': "'Urbanist', sans-serif", '--font-heading': "'Urbanist', sans-serif",
        '--theme-padding': '1.75rem', '--theme-gap': '1.5rem', '--glass-blur': '25px', '--glass-opacity': '0.2',
        '--font-weight-heading': '800', '--letter-spacing-heading': '0.02em', '--border-width': '1px',
        '--shadow-intensity': '0.2', '--card-style': 'glass', '--bg-texture': 'mesh-color'
    },
    // 20. Blueprint Tech
    blueprint: {
        '--radius-theme': '0px', '--font-main': "'Roboto Mono', monospace", '--font-heading': "'Barlow Condensed', sans-serif",
        '--theme-padding': '1.25rem', '--theme-gap': '1.25rem', '--glass-blur': '0px', '--glass-opacity': '1',
        '--font-weight-heading': '600', '--letter-spacing-heading': '0.05em', '--border-width': '1px',
        '--shadow-intensity': '0.15', '--card-style': 'solid', '--bg-texture': 'blueprint-grid'
    },

    // --- TEMAS ORIGINAIS ---
    glass: {
        '--radius-theme': '12px', '--font-main': "'Inter', sans-serif", '--font-heading': "'Outfit', sans-serif",
        '--theme-padding': '1.5rem', '--theme-gap': '1.5rem', '--glass-blur': '12px', '--glass-opacity': '0.7',
        '--font-weight-heading': '800', '--letter-spacing-heading': '-0.02em', '--border-width': '1px',
        '--shadow-intensity': '0.15', '--card-style': 'glass', '--bg-texture': 'noise'
    },
    corporate: {
        '--radius-theme': '4px', '--font-main': "'Inter', sans-serif", '--font-heading': "'Inter', sans-serif",
        '--theme-padding': '1.25rem', '--theme-gap': '1rem', '--glass-blur': '0px', '--glass-opacity': '1',
        '--font-weight-heading': '700', '--letter-spacing-heading': '0', '--border-width': '1px',
        '--shadow-intensity': '0.05', '--card-style': 'solid', '--bg-texture': 'dots'
    },
    minimal: {
        '--radius-theme': '0px', '--font-main': "'Inter', sans-serif", '--font-heading': "'Inter', sans-serif",
        '--theme-padding': '2rem', '--theme-gap': '2rem', '--glass-blur': '0px', '--glass-opacity': '1',
        '--font-weight-heading': '400', '--letter-spacing-heading': '0.05em', '--border-width': '0px',
        '--shadow-intensity': '0', '--card-style': 'solid', '--bg-texture': 'none'
    },
    technical: {
        '--radius-theme': '0px', '--font-main': "'JetBrains Mono', monospace", '--font-heading': "'JetBrains Mono', monospace",
        '--theme-padding': '1rem', '--theme-gap': '1rem', '--glass-blur': '0px', '--glass-opacity': '1',
        '--font-weight-heading': '700', '--letter-spacing-heading': '-0.01em', '--border-width': '1px',
        '--shadow-intensity': '0.2', '--card-style': 'solid', '--bg-texture': 'grid'
    },
    prestige: {
        '--radius-theme': '24px', '--font-main': "'Inter', sans-serif", '--font-heading': "'Sentient', serif",
        '--theme-padding': '2.5rem', '--theme-gap': '2rem', '--glass-blur': '20px', '--glass-opacity': '0.4',
        '--font-weight-heading': '400', '--letter-spacing-heading': '-0.03em', '--border-width': '1px',
        '--shadow-intensity': '0.08', '--card-style': 'glass', '--bg-texture': 'prestige'
    },
    atmospheric: {
        '--radius-theme': '32px', '--font-main': "'Inter', sans-serif", '--font-heading': "'Satoshi', sans-serif",
        '--theme-padding': '3rem', '--theme-gap': '2.5rem', '--glass-blur': '40px', '--glass-opacity': '0.3',
        '--font-weight-heading': '900', '--letter-spacing-heading': '-0.05em', '--border-width': '1px',
        '--shadow-intensity': '0.3', '--card-style': 'glass', '--bg-texture': 'mesh'
    },
    // NEW MASTER THEMES (V7.0)
    neon_circuit: {
        '--radius-theme': '4px', '--font-main': "'Space Mono', monospace", '--font-heading': "'Space Grotesk', sans-serif",
        '--theme-padding': '1.5rem', '--theme-gap': '1rem', '--glass-blur': '8px', '--glass-opacity': '0.6',
        '--font-weight-heading': '900', '--letter-spacing-heading': '-0.05em', '--text-transform-heading': 'uppercase',
        '--border-width': '2px', '--shadow-intensity': '0.4', '--card-style': 'glass', '--bg-texture': 'circuit'
    },
    ai_neural: {
        '--radius-theme': '12px', '--font-main': "'Bricolage Grotesque', sans-serif", '--font-heading': "'Bricolage Grotesque', sans-serif",
        '--theme-padding': '2rem', '--theme-gap': '2rem', '--glass-blur': '20px', '--glass-opacity': '0.3',
        '--font-weight-heading': '700', '--letter-spacing-heading': '-0.04em', '--text-transform-heading': 'none',
        '--border-width': '1px', '--shadow-intensity': '0.2', '--card-style': 'glass', '--bg-texture': 'hexagon'
    },
    editorial: {
        '--radius-theme': '40px', '--font-main': "'Inter', sans-serif", '--font-heading': "'Sentient', serif",
        '--theme-padding': '3rem', '--theme-gap': '3rem', '--glass-blur': '12px', '--glass-opacity': '0.8',
        '--font-weight-heading': '400', '--letter-spacing-heading': '-0.03em', '--text-transform-heading': 'none',
        '--border-width': '1px', '--shadow-intensity': '0.1', '--card-style': 'glass', '--bg-texture': 'prestige'
    },
    // REQUESTED THEMES (V2 HIGH FIDELITY)
    main: {
        '--radius-theme': '0px', '--font-main': "'JetBrains Mono', monospace", '--font-heading': "'JetBrains Mono', monospace",
        '--theme-padding': '1rem', '--theme-gap': '1.5rem', '--glass-blur': '0px', '--glass-opacity': '1',
        '--font-weight-heading': '700', '--letter-spacing-heading': '-0.01em', '--border-width': '1.5px',
        '--shadow-intensity': '0.3', '--card-style': 'solid', '--bg-texture': 'grid',
        '--theme-body': '#000000', '--theme-card': '#080808', '--theme-sidebar': '#050505'
    },
    cyberpunk: {
        '--radius-theme': '0px', '--font-main': "'Space Mono', monospace", '--font-heading': "'Space Grotesk', sans-serif",
        '--theme-padding': '1.5rem', '--theme-gap': '1.25rem', '--glass-blur': '12px', '--glass-opacity': '0.4',
        '--font-weight-heading': '900', '--letter-spacing-heading': '0.1em', '--text-transform-heading': 'uppercase',
        '--border-width': '3px', '--shadow-intensity': '0.8', '--card-style': 'glass', '--bg-texture': 'circuit'
    }
};
