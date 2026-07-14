/**
 * GATE DE PARIDADE DO REGISTRY (causa-raiz do plug-and-play)
 *
 * Cobra, de forma EXAUSTIVA, que a superfície de componentes da biblioteca é
 * alcançável via `type` no manifesto — ou explicitamente excluída com motivo em
 * `manifestExclusions.ts`. Três regras:
 *
 *  R1 — Todo componente React exportado pela API pública (`src/index.ts`) está no
 *       `NATIVE_COMPONENTS` OU nas exclusões declaradas.
 *  R2 — Todo id legado do Discovery registrado pela própria lib tem `type`
 *       equivalente no Registry do motor (mapa `LEGACY_DISCOVERY_TYPE_MAP`).
 *  R3 — Todo arquivo de componente em `src/components/atomic/<Categoria>/*.tsx`
 *       (nível raiz da categoria) está coberto pelo Registry ou pelas exclusões —
 *       pega componente órfão (existe no código, não chega a lugar nenhum).
 *
 * Se este teste falhar, NÃO o afrouxe: registre o componente (skill
 * `ui-novo-componente`, Camada 6) ou declare a exclusão com motivo.
 */

import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import * as PublicAPI from '../../../index';
import { NATIVE_COMPONENTS } from '../Registry/nativeComponents';
import { MANIFEST_EXCLUSIONS, LEGACY_DISCOVERY_TYPE_MAP } from '../Registry/manifestExclusions';
import { getLocalComponentIds } from '../../Discovery/registry';

const REGISTRY_KEYS = new Set(Object.keys(NATIVE_COMPONENTS));
const EXCLUSION_KEYS = new Set(Object.keys(MANIFEST_EXCLUSIONS));

/** Wrappers React aceitos como componente (lazy/memo/forwardRef). */
const REACT_WRAPPERS = new Set([
    Symbol.for('react.lazy'),
    Symbol.for('react.memo'),
    Symbol.for('react.forward_ref'),
]);

/** Heurística de censo: um export PascalCase que se comporta como componente React. */
const isComponentLike = (name: string, value: unknown): boolean => {
    if (!/^[A-Z]/.test(name)) return false;
    if (typeof value === 'function') {
        // Classes de erro (SubmitBlockedError etc.) não são componentes.
        return !(value.prototype instanceof Error);
    }
    if (typeof value === 'object' && value !== null) {
        const tag = (value as { $$typeof?: symbol }).$$typeof;
        return tag !== undefined && REACT_WRAPPERS.has(tag);
    }
    return false;
};

const publicComponentNames = Object.entries(PublicAPI)
    .filter(([name, value]) => isComponentLike(name, value))
    .map(([name]) => name);

describe('Gate de Paridade — R1 (API pública → Registry)', () => {
    it('todo componente exportado publicamente é manifestável ou excluído com motivo', () => {
        const unreachable = publicComponentNames.filter(
            (name) => !REGISTRY_KEYS.has(name) && !EXCLUSION_KEYS.has(name),
        );
        expect(
            unreachable,
            `Componentes exportados SEM alcance via manifesto e SEM exclusão declarada: ` +
                `${unreachable.join(', ')}. Registre no NATIVE_COMPONENTS (skill ` +
                `ui-novo-componente, Camada 6) ou declare em manifestExclusions.ts.`,
        ).toEqual([]);
    });

    it('nenhuma exclusão é obsoleta nem conflita com o Registry', () => {
        const publicNames = new Set(Object.keys(PublicAPI));
        const atomicNames = collectAtomicExportNames();
        const stale = [...EXCLUSION_KEYS].filter(
            (name) => !publicNames.has(name) && !atomicNames.has(name),
        );
        expect(stale, `Exclusões que não correspondem a nenhum export vivo: ${stale.join(', ')}.`).toEqual([]);

        const conflicting = [...EXCLUSION_KEYS].filter((name) => REGISTRY_KEYS.has(name));
        expect(
            conflicting,
            `Exclusões que TAMBÉM estão registradas (remova da exclusão): ${conflicting.join(', ')}.`,
        ).toEqual([]);
    });

    it('toda exclusão declara um motivo não-vazio', () => {
        for (const [name, reason] of Object.entries(MANIFEST_EXCLUSIONS)) {
            expect(reason.trim().length, `Exclusão "${name}" sem motivo.`).toBeGreaterThan(0);
        }
    });
});

describe('Gate de Paridade — R2 (Discovery legado → Registry)', () => {
    it('todo id do Discovery registrado pela lib tem type equivalente manifestável', () => {
        const ids = getLocalComponentIds();
        expect(ids.length, 'esperava os ids legados registrados em src/index.ts').toBeGreaterThan(0);
        for (const id of ids) {
            const mapped = LEGACY_DISCOVERY_TYPE_MAP[id];
            expect(
                mapped,
                `Id legado "${id}" (registerLocalComponent) sem type equivalente em ` +
                    `LEGACY_DISCOVERY_TYPE_MAP — foi assim que o CustomizationPanel ficou inalcançável.`,
            ).toBeTruthy();
            expect(
                REGISTRY_KEYS.has(mapped),
                `O type "${mapped}" mapeado para o id legado "${id}" não existe no NATIVE_COMPONENTS.`,
            ).toBe(true);
        }
    });
});

// ---------------------------------------------------------------------------
// R3 — varredura do código-fonte atômico (pega órfãos que nem são exportados)
// ---------------------------------------------------------------------------

const ATOMIC_ROOT = path.resolve(__dirname, '../../../components/atomic');
const EXPORT_NAME_RE = /export\s+(?:const|function|class)\s+([A-Z][A-Za-z0-9]*)/g;
const DEFAULT_EXPORT_RE = /export\s+default\s+(?:function\s+)?([A-Z][A-Za-z0-9]*)/;

/** Nomes exportados (PascalCase, não ALL_CAPS) de um arquivo de componente. */
const exportedNamesOf = (filePath: string): string[] => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const names = new Set<string>();
    for (const match of content.matchAll(EXPORT_NAME_RE)) names.add(match[1]);
    const def = content.match(DEFAULT_EXPORT_RE);
    if (def) names.add(def[1]);
    return [...names].filter((name) => !/^[A-Z0-9_]+$/.test(name));
};

/** Arquivos .tsx no NÍVEL RAIZ de cada categoria atômica (subpastas = internos). */
const atomicComponentFiles = (): string[] => {
    const files: string[] = [];
    for (const category of fs.readdirSync(ATOMIC_ROOT)) {
        const dir = path.join(ATOMIC_ROOT, category);
        if (!fs.statSync(dir).isDirectory() || category === 'hooks') continue;
        for (const entry of fs.readdirSync(dir)) {
            if (entry.endsWith('.tsx') && fs.statSync(path.join(dir, entry)).isFile()) {
                files.push(path.join(dir, entry));
            }
        }
    }
    return files;
};

const collectAtomicExportNames = (): Set<string> => {
    const names = new Set<string>();
    for (const file of atomicComponentFiles()) {
        for (const name of exportedNamesOf(file)) names.add(name);
    }
    return names;
};

describe('Gate de Paridade — R3 (código atômico → Registry, anti-órfão)', () => {
    it('todo arquivo de componente atômico é coberto pelo Registry ou pelas exclusões', () => {
        const orphans: string[] = [];
        for (const file of atomicComponentFiles()) {
            const names = exportedNamesOf(file);
            if (names.length === 0) continue;
            const covered = names.some((name) => REGISTRY_KEYS.has(name) || EXCLUSION_KEYS.has(name));
            if (!covered) {
                orphans.push(`${path.basename(file)} (exporta: ${names.join(', ')})`);
            }
        }
        expect(
            orphans,
            `Componentes atômicos ÓRFÃOS (nem manifestáveis, nem excluídos): ${orphans.join('; ')}. ` +
                `Era assim que ImageCard/SarakPageTransition estavam invisíveis.`,
        ).toEqual([]);
    });
});
