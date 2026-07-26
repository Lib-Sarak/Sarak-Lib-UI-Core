// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runRefreshKit } from '../runRefreshKit.mjs';

let tmpDir;
let packageRoot;
let rootDir;

const write = (base, relPath, content) => {
    const full = path.join(base, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
};

const read = (base, relPath) => fs.readFileSync(path.join(base, relPath), 'utf8');

/** Um "pacote instalado" mínimo com o kit da versão NOVA. */
const seedInstalledKit = (versionStamp) => {
    write(packageRoot, 'sarak-ui/VERSION', versionStamp);
    write(packageRoot, 'sarak-ui/GUIA-FRONTEND.md', `guia ${versionStamp}`);
    write(packageRoot, 'sarak-ui/catalog.json', `{"v":"${versionStamp}"}`);
    write(packageRoot, 'sarak-ui/skill/SKILL.md', `skill ${versionStamp}`);
};

beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-kit-'));
    packageRoot = path.join(tmpDir, 'pacote');
    rootDir = path.join(tmpDir, 'consumidor');
    fs.mkdirSync(rootDir, { recursive: true });
});

afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('runRefreshKit (Spec 50 §7) — re-sincronização do kit após sarak:update', () => {
    it('copia o kit inteiro para a raiz do consumidor quando ele ainda não existe', () => {
        seedInstalledKit('kitHash=novo');

        const result = runRefreshKit({ rootDir, packageRoot });

        expect(result.status).toBe('ok');
        expect(result.wasUpToDate).toBe(false);
        expect(read(rootDir, 'sarak-ui/VERSION')).toBe('kitHash=novo');
        expect(read(rootDir, 'sarak-ui/skill/SKILL.md')).toBe('skill kitHash=novo');
    });

    it('sobrescreve o kit VELHO da raiz — é conteúdo gerado, não do consumidor', () => {
        seedInstalledKit('kitHash=novo');
        write(rootDir, 'sarak-ui/VERSION', 'kitHash=velho');
        write(rootDir, 'sarak-ui/catalog.json', '{"v":"velho"}');

        const result = runRefreshKit({ rootDir, packageRoot });

        expect(result.wasUpToDate).toBe(false);
        expect(read(rootDir, 'sarak-ui/catalog.json')).toBe('{"v":"kitHash=novo"}');
    });

    it('refresca as cópias MOVIDAS (guia em specs/, skill em .claude e .agents)', () => {
        seedInstalledKit('kitHash=novo');
        write(rootDir, 'specs/sarak-ui-guia-frontend.md', 'guia VELHO');
        write(rootDir, '.claude/skills/ui-integra-consumidor/SKILL.md', 'skill VELHA');
        write(rootDir, '.agents/skills/ui-integra-consumidor/SKILL.md', 'skill VELHA');

        const result = runRefreshKit({ rootDir, packageRoot });

        expect(read(rootDir, 'specs/sarak-ui-guia-frontend.md')).toBe('guia kitHash=novo');
        expect(read(rootDir, '.claude/skills/ui-integra-consumidor/SKILL.md')).toBe('skill kitHash=novo');
        expect(read(rootDir, '.agents/skills/ui-integra-consumidor/SKILL.md')).toBe('skill kitHash=novo');
        expect(result.refreshed).toContain('specs/sarak-ui-guia-frontend.md');
    });

    it('NÃO cria cópia movida que o consumidor nunca moveu', () => {
        seedInstalledKit('kitHash=novo');

        runRefreshKit({ rootDir, packageRoot });

        expect(fs.existsSync(path.join(rootDir, 'specs/sarak-ui-guia-frontend.md'))).toBe(false);
        expect(fs.existsSync(path.join(rootDir, '.claude/skills/ui-integra-consumidor'))).toBe(false);
    });

    it('reconhece kit já em dia pelo VERSION (mesmo carimbo)', () => {
        seedInstalledKit('kitHash=igual');
        write(rootDir, 'sarak-ui/VERSION', 'kitHash=igual');

        expect(runRefreshKit({ rootDir, packageRoot }).wasUpToDate).toBe(true);
    });

    it('degrada em silêncio quando o pacote instalado não traz kit (versão anterior à Spec 50)', () => {
        const result = runRefreshKit({ rootDir, packageRoot });

        expect(result.status).toBe('sem-kit');
        expect(result.refreshed).toEqual([]);
        expect(fs.existsSync(path.join(rootDir, 'sarak-ui'))).toBe(false);
    });
});
