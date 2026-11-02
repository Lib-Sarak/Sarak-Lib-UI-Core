/**
 * Geometria da miniatura de tema: o deslocamento, o desfoque e o recuo da sombra do cartão e o passo da grade. Eram os tokens
 * `presetCardShadow*` e `presetGridTextureSize`, retirados do schema porque nenhum componente da lib os lia: a miniatura é desenho
 * do próprio painel, e o valor mora aqui, num `.ts`, fora do que o painel oferece para ajustar.
 */
export const THUMBNAIL_SHADOW_OFFSET_Y = '4px';
export const THUMBNAIL_SHADOW_BLUR = '10px';
export const THUMBNAIL_SHADOW_SPREAD = '-2px';
export const THUMBNAIL_GRID_TEXTURE_SIZE = '8px';
