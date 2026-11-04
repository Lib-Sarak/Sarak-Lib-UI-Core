/**
 * As texturas do schema agrupadas por família, para a galeria não despejar quarenta miniaturas numa lista só. Cada
 * textura está em UMA família; a de nome `none` fica de fora, porque é a ausência de textura.
 */
export type TextureFamilyId = 'technical' | 'organic' | 'geometric' | 'materials';

export const TEXTURE_FAMILIES: ReadonlyArray<{ id: TextureFamilyId; textures: readonly string[] }> = [
    { id: 'technical', textures: ['grid', 'blueprint', 'blueprint-pro', 'circuit', 'circuit-pro', 'cyber-binary', 'scanlines', 'radar', 'carbon-tech', 'wave-pulse'] },
    { id: 'organic', textures: ['noise', 'grain', 'mesh', 'waves', 'aurora', 'stars', 'constellation', 'nebula', 'fluid', 'topo', 'topo-deep'] },
    { id: 'geometric', textures: ['dots', 'micro-dots', 'squares', 'stripes', 'diamond', 'hexagon', 'honeycomb', 'isometric', 'crosshatch', 'pinstripes', 'prism-mesh'] },
    { id: 'materials', textures: ['prestige', 'carbon', 'brushed', 'frosted', 'silk', 'wood', 'stucco', 'paper'] },
];

/** A família de uma textura, ou `undefined` para `none`. */
export const textureFamilyOf = (texture: string): TextureFamilyId | undefined =>
    TEXTURE_FAMILIES.find((family) => family.textures.includes(texture))?.id;

/** Duas por família, para a galeria mostrar o suficiente sem despejar todas. */
export const FEATURED_TEXTURES: readonly string[] = ['grid', 'blueprint-pro', 'aurora', 'grain', 'dots', 'hexagon', 'carbon', 'paper'];
