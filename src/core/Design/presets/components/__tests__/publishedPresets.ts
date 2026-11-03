/**
 * Os ids de preset que já saíram numa release: nenhum pode mudar nem sumir (tema e atalho salvos guardam o id). Só
 * entram aqui os escritos à mão; os derivados de lista (texturas, estilos de botão, fontes) seguem a lista do schema.
 */
export const PUBLISHED_PRESET_IDS: readonly string[] = [
    'card-glass-minimal', 'card-claymorphism', 'card-retro-os', 'card-cyberpunk-neon', 'card-holographic-hud', 'card-industrial-brutalist',
    'card-geometric-cut', 'card-asymmetric-accent', 'card-carbon-tech', 'card-organic-craft', 'card-floating-lift', 'card-scanline-crt',
    'btn-industrial-matte', 'btn-neon-pulse', 'btn-frosted-glass', 'btn-hollow-borderline', 'btn-cyberpunk-wireframe', 'btn-neumorphism-soft',
    'btn-sharp-tag', 'btn-neon-slow-breathe', 'btn-frosted-deep-pill', 'btn-bouncy', 'btn-ghost-ink', 'btn-full-block',
    'input-floating-pill', 'input-terminal-dotted', 'input-industrial-inset', 'input-classic-underline', 'input-frosted-glass', 'input-high-contrast',
    'input-neumorphic-press', 'input-cyberpunk-glow-line', 'input-paper-craft', 'input-dense-compact', 'input-spacious-airy', 'input-alert-ring',
    'bg-none', 'bg-kinetic-flow', 'bg-stellar-nebula', 'bg-cyber-grid-img', 'bg-dark-cinematic',
];

/** Presets publicados que escrevem cor à mão. Só encolhe: preset novo de estrutura não entra aqui. */
export const LEGACY_COLOR_PRESET_IDS: readonly string[] = [
    'btn-hollow-borderline',
    'btn-industrial-matte',
    'btn-neon-pulse',
    'btn-neon-slow-breathe',
    'card-asymmetric-accent',
    'card-carbon-tech',
    'card-claymorphism',
    'card-cyberpunk-neon',
    'card-floating-lift',
    'card-glass-minimal',
    'card-holographic-hud',
    'card-industrial-brutalist',
    'card-organic-craft',
    'card-retro-os',
    'card-scanline-crt',
    'input-alert-ring',
    'input-classic-underline',
    'input-cyberpunk-glow-line',
    'input-floating-pill',
    'input-frosted-glass',
    'input-high-contrast',
    'input-industrial-inset',
    'input-neumorphic-press',
    'input-paper-craft',
    'input-spacious-airy',
    'input-terminal-dotted',
];

/** Pares publicados que diferem em menos de dois tokens (o catálogo antigo os trouxe assim). Só encolhe. */
export const LEGACY_CLOSE_PAIRS: readonly string[] = ['bg-none ~ bg-cyber-grid-img'];
