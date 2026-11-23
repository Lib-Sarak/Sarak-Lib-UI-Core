// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Glossário do painel: termo técnico fica em inglês (Sidebar, Topbar, Dark mode…) e o nome antigo em
 * português, francês, alemão ou italiano deixa de ser usado para essas peças. A lista abaixo é o dado do
 * teste; ele lê o texto dos arquivos (comentário e identificador entre crases ficam de fora).
 */
interface BannedTerm {
    readonly name: string;
    readonly pattern: RegExp;
    /** Em arquivo de catálogo o texto vem entre crases (template literal); lá não se retiram trechos de código. */
    readonly stripCode?: boolean;
}

const BANNED_TERMS: readonly BannedTerm[] = [
    { name: 'barra lateral (pt/es/it/fr/de)', pattern: /barra lateral|barra laterale|barre latérale|seitenleiste/i },
    { name: 'barra superior / do topo (pt/es/it/fr/de)', pattern: /barra superior|barra superiore|barra de topo|barra do topo|barre du haut|barre supérieure|obere leiste|top bar/i },
    { name: 'Header como nome de peça', pattern: /\bheader\b/i },
    { name: 'cabeçalho como nome da Topbar ou do cromo', pattern: /\(cabeçalho\)|cabeçalho (do shell|da sidebar|da topbar|de navegação|superior)|sobre o cabeçalho.|seta do cabeçalho/i },
    { name: 'Modo escuro/claro como nome do modo', pattern: /[Mm]odo ([Ee]scuro|[Cc]laro)|Dark Mode|Light Mode|modo claro\/escuro|modo \(claro/ },
];

const ROOT = process.cwd();
const listTs = (dir: string, only?: RegExp): string[] =>
    readdirSync(join(ROOT, dir))
        .filter((file) => file.endsWith('.ts') && (only === undefined || only.test(file)))
        .map((file) => join(dir, file));

/** Arquivos que o painel lê: rótulos e descrições do schema, textos do catálogo e textos dos presets. */
const PANEL_TEXT_FILES = [
    ...listTs('src/core/Design/schema'),
    ...listTs('src/core/i18n/presetTexts'),
    ...listTs('src/core/i18n', /^catalogEntries\..*\.ts$/),
];

/** Textos do shell (alternador de modo) ficam fora: são do usuário final, não do painel. */
const SHELL_ONLY_LINE = /^\s*(pt|en|es|fr|de|it):\s*`(Modo (Claro|Escuro)|Mudar para modo|Cambiar a modo)/;

/** Comentário e linha de identificador (id, variável CSS, consumidor) não são texto que o painel mostra. */
const isComment = (line: string): boolean => /^\s*(\/\/|\/\*|\*|cssVars:|structuralConsumer:|id:)/.test(line);

const textOf = (line: string): string => line.replace(/`[^`]*`/g, '');

const violationsOf = (file: string): string[] => {
    const found: string[] = [];
    readFileSync(join(ROOT, file), 'utf8')
        .split('\n')
        .forEach((line, index) => {
            if (isComment(line) || SHELL_ONLY_LINE.test(line)) return;
            // Catálogo e textos de preset guardam o texto entre crases ou aspas; o schema guarda código entre crases.
            const scanned = file.split('\\').join('/').includes('Design/schema') ? textOf(line) : line;
            BANNED_TERMS.filter((term) => term.pattern.test(scanned)).forEach((term) => found.push(`${file}:${index + 1} — ${term.name}`));
        });
    return found;
};

interface PartitionToken { tokenId: string; name?: string; description?: string }

/** O painel prefere o nome e a descrição das partições do catálogo de design ao rótulo do schema: os dois campos entram na varredura. */
const PARTITIONS_DIR = 'src/core/Design/catalog/partitions';

const partitionViolations = (): string[] =>
    readdirSync(join(ROOT, PARTITIONS_DIR))
        .filter((file) => file.endsWith('.json'))
        .flatMap((file) => (JSON.parse(readFileSync(join(ROOT, PARTITIONS_DIR, file), 'utf8')) as PartitionToken[])
            .flatMap((token) => (['name', 'description'] as const).flatMap((field) => {
                const text = textOf(token[field] ?? '');
                return BANNED_TERMS.filter((term) => term.pattern.test(text)).map((term) => `${file} ${token.tokenId}.${field} — ${term.name}`);
            })));

describe('glossário do painel — termo técnico em inglês', () => {
    it('há arquivos para varrer', () => {
        expect(PANEL_TEXT_FILES.length).toBeGreaterThan(40);
    });

    it('nenhum texto do painel usa o nome banido de Sidebar, Topbar, Header ou modo', () => {
        expect(PANEL_TEXT_FILES.flatMap(violationsOf)).toEqual([]);
    });

    it('nome e descrição das partições do catálogo de design seguem o mesmo glossário', () => {
        expect(partitionViolations()).toEqual([]);
    });
});
