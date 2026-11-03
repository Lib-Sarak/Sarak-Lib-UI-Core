/**
 * Matemática do mapa de blocos (projeção Web Mercator, blocos de 256 px) e a trava da URL dos blocos.
 * Pura e fora da fronteira lazy: não toca o DOM nem a rede.
 */

export interface SarakMapPoint {
    lat: number;
    lng: number;
}

export interface SarakMapTile {
    /** Chave estável do bloco. */
    key: string;
    url: string;
    /** Canto superior esquerdo do bloco, em px, relativo ao canto do viewport. */
    left: number;
    top: number;
}

export const MAP_TILE_SIZE = 256;
export const MAP_MIN_ZOOM = 0;
export const MAP_MAX_ZOOM = 19;
/** Latitude máxima da projeção: acima dela a esfera Mercator estoura. */
const MAX_LATITUDE = 85.0511;

const TILE_PLACEHOLDERS = ['{z}', '{x}', '{y}'] as const;
/** Só `https://`, `http://`, `//` e caminho absoluto no mesmo servidor: nenhum `javascript:` nem `data:` vira `src` de imagem. */
const SAFE_TILE_URL = /^(https?:)?\/\/|^\/(?!\/)/i;

/** A URL serve de molde de blocos: seguro de esquema e com `{z}`, `{x}` e `{y}`. */
export const isUsableTileUrl = (url: string | undefined): url is string =>
    typeof url === 'string' && SAFE_TILE_URL.test(url.trim()) && TILE_PLACEHOLDERS.every((token) => url.includes(token));

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

/** Tamanho do mundo em px no zoom dado. */
export const worldSize = (zoom: number): number => MAP_TILE_SIZE * 2 ** zoom;

/** Ponto geográfico → px no plano do mundo (origem no canto noroeste). */
export function project(point: SarakMapPoint, zoom: number): { x: number; y: number } {
    const size = worldSize(zoom);
    const lat = clamp(point.lat, -MAX_LATITUDE, MAX_LATITUDE) * (Math.PI / 180);
    const x = ((point.lng + 180) / 360) * size;
    const y = ((1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2) * size;
    return { x, y };
}

/** Inverso de `project`. */
export function unproject(x: number, y: number, zoom: number): SarakMapPoint {
    const size = worldSize(zoom);
    const lng = (x / size) * 360 - 180;
    const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / size))) * 180) / Math.PI;
    return { lat: clamp(lat, -MAX_LATITUDE, MAX_LATITUDE), lng: ((lng + 540) % 360) - 180 };
}

/** Move o centro por um deslocamento em px de tela (arrastar a imagem para a direita leva o centro para a esquerda). */
export function panCenter(center: SarakMapPoint, zoom: number, dx: number, dy: number): SarakMapPoint {
    const origin = project(center, zoom);
    const size = worldSize(zoom);
    return unproject(origin.x - dx, clamp(origin.y - dy, 0, size), zoom);
}

export const clampZoom = (zoom: number, min = MAP_MIN_ZOOM, max = MAP_MAX_ZOOM): number =>
    clamp(Math.round(zoom), clamp(min, MAP_MIN_ZOOM, MAP_MAX_ZOOM), clamp(max, MAP_MIN_ZOOM, MAP_MAX_ZOOM));

/** Posição de um ponto no viewport, em px a partir do canto superior esquerdo. */
export function pointInViewport(point: SarakMapPoint, center: SarakMapPoint, zoom: number, width: number, height: number): { x: number; y: number } {
    const at = project(point, zoom);
    const middle = project(center, zoom);
    return { x: at.x - middle.x + width / 2, y: at.y - middle.y + height / 2 };
}

const fillTemplate = (template: string, z: number, x: number, y: number): string =>
    template.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y));

/** Blocos que cobrem o viewport; o eixo x dá a volta ao mundo, o y é cortado nas bordas. */
export function visibleTiles(template: string, center: SarakMapPoint, zoom: number, width: number, height: number): SarakMapTile[] {
    const middle = project(center, zoom);
    const originX = middle.x - width / 2;
    const originY = middle.y - height / 2;
    const count = 2 ** zoom;
    const tiles: SarakMapTile[] = [];
    const lastColumn = Math.floor((originX + width) / MAP_TILE_SIZE);
    const lastRow = Math.floor((originY + height) / MAP_TILE_SIZE);
    for (let column = Math.floor(originX / MAP_TILE_SIZE); column <= lastColumn; column += 1) {
        for (let row = Math.floor(originY / MAP_TILE_SIZE); row <= lastRow; row += 1) {
            if (row < 0 || row >= count) continue;
            const wrapped = ((column % count) + count) % count;
            tiles.push({
                key: `${zoom}/${column}/${row}`,
                url: fillTemplate(template, zoom, wrapped, row),
                left: column * MAP_TILE_SIZE - originX,
                top: row * MAP_TILE_SIZE - originY,
            });
        }
    }
    return tiles;
}
