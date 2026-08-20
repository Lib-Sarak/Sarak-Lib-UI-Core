// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveUpdatePlan } from '../updatePlan.mjs';

let tmpDir;

const lsRemoteTags = (tags) =>
    tags
        .flatMap((tag) => [`${'a'.repeat(40)}\trefs/tags/${tag}`, `${'b'.repeat(40)}\trefs/tags/${tag}^{}`])
        .join('\n');

/** Simula só o pedaço do `context` que `resolveUpdatePlan` lê: `spec` + `installedDir` REAL. */
function contextWith({ spec, installedVersion }) {
    const installedDir = fs.mkdtempSync(path.join(tmpDir, 'installed-'));
    fs.writeFileSync(path.join(installedDir, 'package.json'), JSON.stringify({ name: '@sarak/lib-ui-core', version: installedVersion }));
    return { spec, installedDir };
}

beforeEach(() => {
    tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-update-plan-')));
});

afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('resolveUpdatePlan — plan-10 (o que `update` decide antes de agir)', () => {
    it('sem versão instalada legível -> ok:false', () => {
        const plan = resolveUpdatePlan({
            context: { spec: 'github:x/y#semver:^1.0.0', installedDir: null },
            refsCrus: lsRemoteTags(['v1.0.0']),
        });
        expect(plan.ok).toBe(false);
    });

    it('remoto sem nenhuma tag "vX.Y.Z" -> ok:false', () => {
        const plan = resolveUpdatePlan({ context: contextWith({ spec: 'github:x/y', installedVersion: '1.0.0' }), refsCrus: '' });
        expect(plan.ok).toBe(false);
    });

    it('faixa `^1.0.0` -> inRange é a maior DENTRO do major 1; latest é a maior de TODAS', () => {
        const plan = resolveUpdatePlan({
            context: contextWith({ spec: 'github:x/y#semver:^1.0.0', installedVersion: '1.2.0' }),
            refsCrus: lsRemoteTags(['v1.2.0', 'v1.9.0', 'v3.0.0']),
        });
        expect(plan.ok).toBe(true);
        expect(plan.inRange.tag).toBe('v1.9.0');
        expect(plan.latest.tag).toBe('v3.0.0');
        expect(plan.majorsSkipped).toBe(2);
    });

    it('SEM faixa declarada (github: puro) -> o default de segurança é o MAJOR instalado, não o mais novo', () => {
        const plan = resolveUpdatePlan({
            context: contextWith({ spec: 'github:x/y', installedVersion: '1.2.0' }),
            refsCrus: lsRemoteTags(['v1.2.0', 'v1.9.0', 'v2.0.0']),
        });
        expect(plan.faixa).toBeNull();
        expect(plan.inRange.tag).toBe('v1.9.0');
        expect(plan.latest.tag).toBe('v2.0.0');
        expect(plan.majorsSkipped).toBe(1);
    });

    it('já na maior tag -> majorsSkipped 0 e inRange == latest', () => {
        const plan = resolveUpdatePlan({
            context: contextWith({ spec: 'github:x/y#semver:^2.0.0', installedVersion: '2.0.0' }),
            refsCrus: lsRemoteTags(['v2.0.0']),
        });
        expect(plan.majorsSkipped).toBe(0);
        expect(plan.inRange.tag).toBe(plan.latest.tag);
    });
});
