import { describe, expect, it } from 'vitest';
import { MAP_TILE_SIZE, clampZoom, isUsableTileUrl, panCenter, pointInViewport, project, unproject, visibleTiles } from '../mapMath';

const TEMPLATE = 'https://tiles.example/{z}/{x}/{y}.png';

describe('mapMath', () => {
    it('o ponto 0,0 cai no meio do mundo e project/unproject se desfazem', () => {
        expect(project({ lat: 0, lng: 0 }, 1)).toEqual({ x: MAP_TILE_SIZE, y: MAP_TILE_SIZE });
        const point = { lat: -23.55, lng: -46.63 };
        const back = unproject(project(point, 12).x, project(point, 12).y, 12);
        expect(back.lat).toBeCloseTo(point.lat, 5);
        expect(back.lng).toBeCloseTo(point.lng, 5);
    });

    it('arrastar a imagem para a direita leva o centro para oeste', () => {
        const moved = panCenter({ lat: 0, lng: 0 }, 3, 100, 0);
        expect(moved.lng).toBeLessThan(0);
        expect(moved.lat).toBeCloseTo(0, 5);
    });

    it('o zoom é inteiro e fica entre 0 e 19, ou nos limites pedidos', () => {
        expect(clampZoom(-3)).toBe(0);
        expect(clampZoom(40)).toBe(19);
        expect(clampZoom(7.6)).toBe(8);
        expect(clampZoom(12, 2, 10)).toBe(10);
    });

    it('aceita molde seguro e completo; recusa esquema perigoso e molde sem os três campos', () => {
        expect(isUsableTileUrl(TEMPLATE)).toBe(true);
        expect(isUsableTileUrl('/tiles/{z}/{x}/{y}.png')).toBe(true);
        expect(isUsableTileUrl('javascript:alert(1)//{z}{x}{y}')).toBe(false);
        expect(isUsableTileUrl('data:text/html,{z}{x}{y}')).toBe(false);
        expect(isUsableTileUrl('https://tiles.example/{z}/{x}.png')).toBe(false);
        expect(isUsableTileUrl(undefined)).toBe(false);
    });

    it('os blocos cobrem o viewport, no zoom 0 há um só, e o molde é preenchido', () => {
        const world = visibleTiles(TEMPLATE, { lat: 0, lng: 0 }, 0, 256, 256);
        expect(world.map((tile) => tile.url)).toContain('https://tiles.example/0/0/0.png');
        const city = visibleTiles(TEMPLATE, { lat: -23.55, lng: -46.63 }, 10, 600, 400);
        expect(city.length).toBeGreaterThanOrEqual(6);
        city.forEach((tile) => expect(tile.url).toMatch(/\/10\/\d+\/\d+\.png$/));
    });

    it('o eixo x dá a volta ao mundo e o y é cortado nas bordas', () => {
        const tiles = visibleTiles(TEMPLATE, { lat: 0, lng: -179.9 }, 2, 600, 256);
        const columns = tiles.map((tile) => Number(tile.url.split('/').at(-2)));
        expect(Math.max(...columns)).toBeLessThanOrEqual(3);
        expect(columns).toContain(3);
        const polar = visibleTiles(TEMPLATE, { lat: 85, lng: 0 }, 2, 256, 600);
        polar.forEach((tile) => expect(Number(tile.url.split('/').at(-1)!.replace('.png', ''))).toBeGreaterThanOrEqual(0));
    });

    it('o centro cai no meio do viewport', () => {
        const middle = pointInViewport({ lat: 10, lng: 20 }, { lat: 10, lng: 20 }, 5, 800, 400);
        expect(middle.x).toBeCloseTo(400, 5);
        expect(middle.y).toBeCloseTo(200, 5);
    });
});
