import React from 'react';
import { describe, it, expect } from 'vitest';
import { isValidElement } from 'react';
import { ICON_PACKS, EMOJI_SETS } from '../icon-packs';

/**
 * Cobertura 1:1 de `icon-packs` (R8) — plan-07, item 7.
 *
 * `src/constants/` está FORA do escopo do `auditor_coverage` (`:52-54`) — foi o outro
 * achado NOVO da `plan-06` (vão nº 6). O arquivo é `.tsx` e renderiza elementos React,
 * então a regra o cobra na letra.
 *
 * O que importa aqui é **paridade**: um pack a que falte uma chave não quebra a tela,
 * ele silenciosamente não desenha o ícone — a mesma classe de defeito que R26 cobra
 * para os nomes de ícone do catálogo.
 */

const CHAVES = ['dashboard', 'data', 'analysis', 'audit', 'settings', 'profile'] as const;

describe('ICON_PACKS', () => {
    const ids = Object.keys(ICON_PACKS);

    it('o pack "none" existe — é o default do sistema', () => {
        expect(ids).toContain('none');
        expect(ICON_PACKS.none.name).toBe('System Default');
    });

    it('a chave do mapa e o `id` de dentro do pack não divergem', () => {
        for (const id of ids) {
            expect(ICON_PACKS[id].id, `pack "${id}" tem id interno divergente`).toBe(id);
        }
    });

    it('todo pack tem nome legível e não vazio', () => {
        for (const id of ids) {
            expect(ICON_PACKS[id].name?.trim(), `pack "${id}" sem nome`).toBeTruthy();
        }
    });

    it('PARIDADE: todo pack cobre exatamente as mesmas 6 chaves', () => {
        for (const id of ids) {
            expect(Object.keys(ICON_PACKS[id].icons).sort(), `pack "${id}" fora de paridade`).toEqual(
                [...CHAVES].sort(),
            );
        }
    });

    it('todo ícone é um elemento React de verdade, não string nem undefined', () => {
        for (const id of ids) {
            for (const chave of CHAVES) {
                expect(isValidElement(ICON_PACKS[id].icons[chave]), `${id}.${chave} não é elemento`).toBe(true);
            }
        }
    });
});

describe('EMOJI_SETS', () => {
    it('espelha as mesmas chaves de ICON_PACKS', () => {
        expect(Object.keys(EMOJI_SETS).sort()).toEqual(Object.keys(ICON_PACKS).sort());
    });

    it('cada entrada aponta para o MESMO objeto de ícones do pack — é projeção, não cópia', () => {
        for (const id of Object.keys(ICON_PACKS)) {
            expect(EMOJI_SETS[id]).toBe(ICON_PACKS[id].icons);
        }
    });
});
