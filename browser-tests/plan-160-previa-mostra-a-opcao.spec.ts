/**
 * A prévia do painel mostra o efeito de toda opção destacada: espiar (hover) cada opção de cada grupo, de cada decisão, e medir
 * quantos pixels da prévia mudam contra a linha de base tirada imediatamente antes, com a barra de rolagem fora da conta.
 *
 * A REGRA: toda opção destacada muda a prévia acima do limiar. Quem não muda cai em uma de duas listas, e só nelas:
 *  - `PERMANENT_EXCEPTIONS`: o que nunca vai mudar a prévia, cada um com o motivo PROVADO por mecanismo, não por nome:
 *      `applied` — espiar a opção que o design já tem não muda nada; o spec escolhe (clique) outra opção do grupo e espia de
 *        novo: a que passa a mudar estava aplicada.
 *      `animation` — a opção só mexe em duração, atraso ou curva (a foto é tirada com `animations: 'disabled'`); o spec lê as
 *        variáveis do escopo da prévia antes e depois da espiada e exige que as que mudaram sejam todas de movimento.
 *      `other-mode` — só muda no outro modo (Claro/Escuro). Nenhuma opção cai aqui hoje; a espiada no outro modo não é medida.
 *  - `KNOWN_PENDING`: defeito do painel (a prévia não tem onde mostrar a opção, ou a galeria não espia). Tem de estar VAZIA ao
 *    fim do lote 3; é o que torna a §6 da plan conferível por máquina.
 * O spec trava nos dois sentidos: zero fora das listas reprova (regressão), e item de lista que passou a mudar reprova (tire-o).
 *
 * A contagem por grupo sai no relatório de cada decisão (`CONTAGEM <decisão> <grupo> <mudam>/<total>`). Com
 * `SARAK_PLAN160_MATRIZ=<arquivo>`, cada opção medida é gravada ali (decisão|grupo|opção|fração|aplicada|variáveis).
 *
 * LIMITES DECLARADOS (R18): Chromium headless, 1600×1000, tema `sarak-sovereign`, modo escuro; lê o `dist/` (sem `npm run
 * build` recente, mede o build anterior) com as fontes do `dist/fonts`. Mede `[data-option-tile]`, os radios de paleta e os
 * cartões de tema; o `globalBlock` do Layout é de controles de token, não de opção destacada, e fica fora. O limiar é 0,03% da
 * área da prévia com diferença acima do ruído de serrilhado. A espera é por estabilidade (dois quadros seguidos iguais), com teto.
 */
import { test, expect, chromium, type Browser, type Locator, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHarness } from './build-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, 'fixtures', 'plan-160-previa-entry.tsx');
const DIST_FONTS = pathToFileURL(path.resolve(HERE, '..', 'dist', 'fonts')).href;
const MATRIX_FILE = process.env.SARAK_PLAN160_MATRIZ;
/** Depuração: mede só esta decisão (id). */
const ONLY = process.env.SARAK_PLAN160_SO;

const DECISIONS = [
    { id: 'theme', name: 'Tema' }, { id: 'colors', name: 'Cores' }, { id: 'fonts', name: 'Fontes' },
    { id: 'shape', name: 'Forma' }, { id: 'components', name: 'Componentes' }, { id: 'layout', name: 'Layout' },
] as const;

/** Fração mínima da área da prévia com pixel diferente para a opção contar como "mudou a prévia". */
const MIN_CHANGED_SHARE = 0.0003;
/** Soma da diferença dos três canais acima da qual um pixel conta (ruído de serrilhado fica abaixo). */
const PIXEL_NOISE = 30;
/** Largura, em px, da borda direita ignorada: é onde a barra de rolagem da prévia pinta. */
const SCROLLBAR_STRIP = 24;
/** A espiada só compõe depois de 150 ms (`PEEK_DELAY_MS`); o piso cobre esse atraso e o teto limita a espera por quadro estável. */
const PEEK_FLOOR_MS = 260;
const STABLE_CAP_MS = 1500;
const QUIET_MS = 90;
const BASELINE_FLOOR_MS = 80;
const LATE_PEEK_MS = 500;
/** Os tokens que só mexem em movimento: duração, atraso, curva e transição de página. */
const MOTION_TOKEN = /^(motion|pageTransition)/;

/** O cartão de tema ainda não carregado (`PresetCardPending`) é medido à parte, com o import do tema seguro. */
const PENDING_THEME_ID = 'neo-brutalism';

type ExceptionKind = 'applied' | 'animation' | 'other-mode';

/** Chave `decisão/grupo/opção`. Cada item prova o próprio motivo (ver o cabeçalho). */
const PERMANENT_EXCEPTIONS: Record<string, { kind: ExceptionKind; reason: string }> = {
    'fonts/fontPairs/Moderno': { kind: 'applied', reason: 'é o par de fontes do tema do harness (headingFont e bodyFont já valem): espiar o que já está aplicado não muda nada' },
    'components/charts/Área suave': { kind: 'applied', reason: 'todos os tokens de gráfico dela já valem no design do harness' },
    'components/notice/Suave': { kind: 'applied', reason: 'todos os tokens de aviso dela já valem no design do harness' },
    'components/switch/Tátil': { kind: 'applied', reason: 'switchStyleType já vale no design do harness' },
    'components/icons/Preenchidos': { kind: 'applied', reason: 'é a família e o traço que o tema do harness já usa; escolher outro ícone e espiar de novo a faz mudar' },
    'layout/sidebar/Limpa': { kind: 'applied', reason: 'é o design do tema do harness a menos de sidebarBlur; escolher outra e espiar de novo a faz mudar' },
    'layout/contentWidth/Fluida': { kind: 'applied', reason: 'maxContentWidth já vale (fluida); escolher outra largura e espiar de novo a faz mudar' },
    'components/motion/Instantâneo': { kind: 'animation', reason: 'escreve só tokens motion*: durações e atraso, que a foto sem animação não vê' },
    'components/pageTransition/Esmaecer': { kind: 'animation', reason: 'escreve só pageTransitionType, que só atua na troca de tela (fade já é o valor do harness)' },
};

const NOT_ON_SCREEN = 'a espiada compõe as variáveis do grupo no escopo da prévia, mas a tela que a decisão abre (Texto) não desenha o componente que as lê';

/** Por `decisão/grupo`: o defeito do painel e as opções que ele atinge. A esvaziar até o fim do lote 3. */
const KNOWN_PENDING: Record<string, { reason: string; options: string[] }> = {
    'colors/Paletas prontas': {
        reason: 'a galeria de paletas só tem onSelect: hover e foco não compõem nada (nenhuma variável do escopo da prévia muda e nenhum pixel)',
        options: [
            'Terra e argila — Monocromática', 'Oliva viva — Monocromática', 'Oliva dourada — Monocromática', 'Âmbar industrial — Monocromática',
            'Tinta e vinho — Monocromática', 'Tinta azul — Monocromática', 'Oceano — Análoga', 'Ciano e azul — Análoga', 'Verde néon — Complementar',
            'Cobalto vivo — Complementar', 'Azul de projeto — Complementar', 'Amarelo contraste — Complementar', 'Rosa synthwave — Complementar dividida',
            'Coral cinético — Complementar dividida', 'Ciano e violeta — Triádica', 'Grafite e rosa — Triádica', 'Verde técnico — Triádica',
            'Ametista e petróleo — Triádica', 'Rosa profundo — Triádica',
        ],
    },
    'components/tables': { reason: `${NOT_ON_SCREEN}; o mock de tabela é <table> cru, sem o componente real`, options: ['Padrão', 'Listrada', 'Compacta', 'Arejada', 'Listrada e redonda', 'Reta e densa'] },
    'components/charts': { reason: NOT_ON_SCREEN, options: ['Linha reta', 'Linha forte', 'Barras limpas', 'Barras com grade', 'Dispersão'] },
    'components/modal': { reason: NOT_ON_SCREEN, options: ['Clássica'] },
    'components/notice': { reason: NOT_ON_SCREEN, options: ['Reta e sem faixa', 'Redonda e marcada'] },
    'components/switch': { reason: `${NOT_ON_SCREEN}; o mock desenha o interruptor com div, sem o componente real`, options: ['Assimétrico', 'Vidro'] },
    'components/scroll': { reason: NOT_ON_SCREEN, options: ['Fina'] },
    'components/badge': { reason: `${NOT_ON_SCREEN}; o mock desenha o selo com span fixo, sem o componente real`, options: ['Pílula', 'Retangular', 'Com brilho', 'Etiqueta'] },
    'components/emptyState': { reason: NOT_ON_SCREEN, options: ['Esferas suaves', 'Compacto', 'Com anel', 'Aberto e amplo'] },
    'layout/topbar': {
        reason: 'as variáveis de topbar chegam ao escopo da prévia e nenhum pixel muda: a prévia navega pela barra lateral e não desenha a barra de topo',
        options: ['Plana', 'Sólida', 'Com separador', 'Vidro', 'Na cor da marca', 'Compacta', 'Invertida', 'Contornada'],
    },
    'layout/contentWidth': {
        reason: 'a variável de largura chega ao escopo da prévia, mas a prévia desktop tem a largura do container, que não passa de 1.200 px de conteúdo: só a largura de 1.000 px aparece',
        options: ['Média (1200 px)', 'Larga (1440 px)'],
    },
    'theme/themes (carga pendente)': {
        reason: 'o cartão de tema ainda não carregado (PresetCardPending) não recebe peekTokens nem onPeek: só o PresetCard recebe',
        options: [PENDING_THEME_ID],
    },
};

let browser: Browser;
let harnessDirectory: string;
let harnessUrl: string;
let results: Record<string, Measured[]>;

interface Target { group: string; option: string; selector: string; busy: boolean }
/** O que o registro de presets diz da opção: os tokens que ela escreve e se todos já valem no design do harness. */
interface PresetFacts { keys: string[]; applied: boolean }
interface Measured { group: string; option: string; share: number; applied: boolean; changedVariables: string[]; preset: PresetFacts | null }
interface Peek { share: number; changedVariables: string[] }

/** Quanto do quadro difere do outro, como fração da área, sem a faixa da barra de rolagem. */
const changedShare = (page: Page, first: Buffer, second: Buffer): Promise<number> => page.evaluate(async ([a, b, strip, noise]) => {
    const decode = async (base64: string): Promise<ImageData> => {
        const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob());
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const context = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
        context.drawImage(bitmap, 0, 0);
        return context.getImageData(0, 0, bitmap.width, bitmap.height);
    };
    const [one, two] = [await decode(a), await decode(b)];
    if (one.width !== two.width || one.height !== two.height) return 1;
    const width = one.width - strip;
    let differing = 0;
    for (let y = 0; y < one.height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const i = (y * one.width + x) * 4;
            const delta = Math.abs(one.data[i] - two.data[i]) + Math.abs(one.data[i + 1] - two.data[i + 1]) + Math.abs(one.data[i + 2] - two.data[i + 2]);
            if (delta > noise) differing += 1;
        }
    }
    return differing / (width * one.height);
}, [first.toString('base64'), second.toString('base64'), SCROLLBAR_STRIP, PIXEL_NOISE] as const);

/** As variáveis `--*` que o escopo da prévia carrega, para ver quais a espiada mudou. */
const previewVariables = (page: Page): Promise<Record<string, string>> => page.evaluate(() => {
    const scope = document.querySelector('[data-testid="live-preview-frame"] .sarak-design-scope') as HTMLElement | null;
    const found: Record<string, string> = {};
    if (!scope) return found;
    for (let index = 0; index < scope.style.length; index += 1) {
        const name = scope.style[index];
        if (name.startsWith('--')) found[name] = scope.style.getPropertyValue(name);
    }
    return found;
});

/**
 * Espera a prévia assentar sem tirar foto (uma foto custa ~0,5 s): passado o piso, o DOM dela fica `QUIET_MS` sem mudar, ou
 * o teto estoura. Nunca sai antes do piso, que cobre o atraso de 150 ms da espiada.
 */
const settlePreview = (page: Page, floorMs: number): Promise<void> => page.evaluate(([floor, quiet, cap]) => new Promise<void>((resolve) => {
    const frame = document.querySelector('[data-testid="live-preview-frame"]');
    const started = performance.now();
    let lastChange = started;
    const observer = new MutationObserver(() => { lastChange = performance.now(); });
    if (frame) observer.observe(frame, { subtree: true, childList: true, attributes: true, characterData: true });
    const tick = (): void => {
        const now = performance.now();
        if ((now - started >= floor && now - lastChange >= quiet) || now - started >= cap) { observer.disconnect(); resolve(); return; }
        setTimeout(tick, 30);
    };
    tick();
}), [floorMs, QUIET_MS, STABLE_CAP_MS] as const);

interface Baseline { shot: Buffer; variables: Record<string, string> }

/** A prévia como o rascunho a deixa, com o mouse fora de qualquer opção. */
const takeBaseline = async (page: Page): Promise<Baseline> => {
    await page.mouse.move(2, 2);
    await settlePreview(page, BASELINE_FLOOR_MS);
    return { shot: await page.locator('[data-testid="live-preview-frame"]').screenshot({ animations: 'disabled' }), variables: await previewVariables(page) };
};

/** As opções que a decisão aberta mostra: tiles das galerias, radios de paleta e cartões de tema, com o grupo de cada uma. */
const collectTargets = (page: Page): Promise<Target[]> => page.evaluate(() => {
    const targets: Array<{ group: string; option: string; selector: string; busy: boolean }> = [];
    const add = (node: Element, group: string, option: string, index: number, busy = false): void => {
        node.setAttribute('data-plan160-id', `${group}-${index}`);
        targets.push({ group, option, selector: `[data-plan160-id="${group}-${index}"]`, busy });
    };
    document.querySelectorAll('[data-option-group]').forEach((area) => {
        const group = area.getAttribute('data-option-group') ?? '';
        area.querySelectorAll('[data-option-tile]').forEach((tile, index) => add(tile, group, Array.from(tile.querySelectorAll('h3')).pop()?.textContent?.trim() ?? `#${index}`, index));
    });
    document.querySelectorAll('[role="radiogroup"]').forEach((gallery) => {
        const group = gallery.getAttribute('aria-label') ?? 'radiogroup';
        gallery.querySelectorAll('[role="radio"]').forEach((radio, index) => add(radio, group, radio.getAttribute('aria-label') ?? radio.textContent?.trim() ?? `#${index}`, index));
    });
    document.querySelectorAll('[data-theme-id]').forEach((card, index) => add(card, 'themes', card.getAttribute('data-theme-id') ?? `#${index}`, index, card.getAttribute('aria-busy') === 'true'));
    return targets;
});

/** As amostras só desenham ao entrar na área visível: rola até as pendentes até nenhuma sobrar. */
const settleSamples = async (page: Page): Promise<void> => {
    for (let pass = 0; pass < 8; pass += 1) {
        await page.evaluate(async () => {
            for (const node of Array.from(document.querySelectorAll('[data-sx-lazy="pending"]'))) {
                node.scrollIntoView({ block: 'center' });
                for (let wait = 0; wait < 40 && node.getAttribute('data-sx-lazy') === 'pending'; wait += 1) await new Promise((resolve) => setTimeout(resolve, 50));
            }
        });
        if ((await page.locator('[data-sx-lazy="pending"]').count()) === 0) break;
        await page.waitForTimeout(150);
    }
};

const openDecision = async (decisionName: string, query = ''): Promise<{ page: Page; errors: string[] }> => {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${harnessUrl}?fontes=${encodeURIComponent(DIST_FONTS)}${query}`);
    await page.getByRole('button', { name: /Usar minha marca/ }).waitFor();
    await page.getByRole('button', { name: new RegExp(`^${decisionName}`) }).click();
    await page.getByRole('heading', { level: 2, name: decisionName }).waitFor();
    await page.locator('[data-option-tile], [role="radio"], [data-theme-id]').first().waitFor();
    await settleSamples(page);
    return { page, errors };
};

/**
 * Uma espiada contra a linha de base dada. Se, passado o piso, nenhuma variável do escopo da prévia mudou, espera mais um
 * pouco antes da foto: a espiada pode ainda não ter composto. Opção sem efeito visível nem de variável paga essa espera.
 */
const peekAgainst = async (page: Page, element: Locator, base: Baseline): Promise<Peek> => {
    const box = await element.boundingBox();
    if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await settlePreview(page, PEEK_FLOOR_MS);
    let after = await previewVariables(page);
    const differs = (): boolean => Object.keys({ ...base.variables, ...after }).some((name) => base.variables[name] !== after[name]);
    if (!differs()) {
        await settlePreview(page, LATE_PEEK_MS);
        after = await previewVariables(page);
    }
    const peeked = await page.locator('[data-testid="live-preview-frame"]').screenshot({ animations: 'disabled' });
    const changedVariables = Object.keys({ ...base.variables, ...after }).filter((name) => base.variables[name] !== after[name]);
    return { share: await changedShare(page, base.shot, peeked), changedVariables };
};

/** Escolhe (clique) a opção `chosen`, toma a linha de base nova e espia cada opção de `probes`: marca como aplicada a que passa a mudar. */
/** Espia uma opção contra a linha de base. */
const peekOption = async (page: Page, element: Locator, base: Baseline): Promise<Peek> => {
    await element.scrollIntoViewIfNeeded();
    return peekAgainst(page, element, base);
};

const probeAfterChoosing = async (page: Page, chosen: Target, probes: Array<{ entry: Measured; own: Target }>): Promise<void> => {
    if (probes.length === 0) return;
    await page.locator(chosen.selector).scrollIntoViewIfNeeded();
    await page.locator(chosen.selector).click();
    const base = await takeBaseline(page);
    for (const { entry, own } of probes) {
        await page.locator(own.selector).scrollIntoViewIfNeeded();
        entry.applied = (await peekAgainst(page, page.locator(own.selector), base)).share >= MIN_CHANGED_SHARE;
    }
};

/**
 * Das opções de um grupo que não mudaram: escolhe a primeira do grupo e espia de novo as outras, todas contra a mesma linha de
 * base; para a própria primeira, escolhe a segunda. A que passa a mudar era a que o design já tinha, e por isso não mudava.
 * Roda depois de toda a medição, porque o clique grava no rascunho.
 */
const markApplied = async (page: Page, targets: Target[], measured: Measured[]): Promise<void> => {
    for (const group of [...new Set(measured.map((item) => item.group))]) {
        const choices = targets.filter((target) => target.group === group && !target.busy);
        const zeros = measured.filter((item) => item.group === group && item.share < MIN_CHANGED_SHARE)
            .flatMap((entry) => { const own = choices.find((target) => target.option === entry.option); return own ? [{ entry, own }] : []; });
        if (choices.length < 2) continue;
        await probeAfterChoosing(page, choices[0], zeros.filter((pair) => pair.own !== choices[0]));
        await probeAfterChoosing(page, choices[1], zeros.filter((pair) => pair.own === choices[0]));
    }
};


const measureDecision = async (decisionName: string): Promise<Measured[]> => {
    const { page, errors } = await openDecision(decisionName);
    const targets = await collectTargets(page);
    const registry = await page.evaluate(() => (window as unknown as { __plan160: Record<string, PresetFacts> }).__plan160);
    const base = await takeBaseline(page);
    const measured: Measured[] = [];
    for (const target of targets) {
        const peek = await peekOption(page, page.locator(target.selector), base);
        measured.push({ group: target.group, option: target.option, share: peek.share, applied: false, changedVariables: peek.changedVariables, preset: registry[`${target.group}/${target.option}`] ?? null });
    }
    await markApplied(page, targets, measured);
    await page.close();
    expect(errors).toEqual([]);
    return measured;
};

test.beforeAll(async () => {
    test.setTimeout(900_000);
    const executablePath = process.env.SARAK_CHROMIUM_EXECUTABLE_PATH;
    browser = await chromium.launch(executablePath ? { executablePath } : {});
    const harness = await buildHarness(ENTRY);
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
    // Uma decisão por vez: páginas medindo em paralelo travam o hover (a página fora de foco não pinta).
    const measured: Measured[][] = [];
    for (const decision of DECISIONS) {
        const started = Date.now();
        measured.push(!ONLY || ONLY === decision.id ? await measureDecision(decision.name) : []);
        console.log('TEMPO', decision.id, ((Date.now() - started) / 1000).toFixed(1), 's');
    }
    if (MATRIX_FILE) fs.writeFileSync(MATRIX_FILE, DECISIONS.flatMap((decision, index) => measured[index].map((item) => `${decision.id}/${item.group}/${item.option}|${item.share.toFixed(4)}|${item.applied}|${item.changedVariables.join(',')}|${item.preset ? `${item.preset.applied}:${item.preset.keys.join(',')}` : 'sem-registro'}`)).join(String.fromCharCode(10)));
    results = Object.fromEntries(DECISIONS.map((decision, index) => [decision.id, measured[index]]));
});

test.afterAll(async () => {
    if (browser) await browser.close();
    if (harnessDirectory) fs.rmSync(harnessDirectory, { recursive: true, force: true });
});

const keyOf = (decisionId: string, item: Measured): string => `${decisionId}/${item.group}/${item.option}`;
const pendingKeys = (): Set<string> => new Set(Object.entries(KNOWN_PENDING).flatMap(([group, { options }]) => options.map((option) => `${group}/${option}`)));

/**
 * As provas que o mecanismo dá para uma opção que não mudou a prévia. `applied`: espiada depois de escolher outra opção mudou,
 * ou todos os tokens dela já valem no design do harness. `animation`: ela só escreve tokens de movimento.
 */
const provenKinds = (item: Measured): ExceptionKind[] => {
    const kinds: ExceptionKind[] = [];
    if (item.applied || item.preset?.applied) kinds.push('applied');
    if (item.preset && item.preset.keys.length > 0 && item.preset.keys.every((key) => MOTION_TOKEN.test(key))) kinds.push('animation');
    return kinds;
};

for (const decision of DECISIONS) {
    test(`${decision.name}: toda opção destacada muda a prévia ao ser espiada`, () => {
        const measured = results[decision.id];
        const groups = [...new Set(measured.map((item) => item.group))];
        console.log(groups.map((group) => {
            const inGroup = measured.filter((item) => item.group === group);
            return `CONTAGEM ${decision.id} ${group} ${inGroup.filter((item) => item.share >= MIN_CHANGED_SHARE).length}/${inGroup.length}`;
        }).join('\n'));

        const pending = pendingKeys();
        const isListed = (item: Measured): boolean => Boolean(PERMANENT_EXCEPTIONS[keyOf(decision.id, item)]) || pending.has(keyOf(decision.id, item));
        const zeros = measured.filter((item) => item.share < MIN_CHANGED_SHARE);
        const wrongProof = zeros.filter((item) => PERMANENT_EXCEPTIONS[keyOf(decision.id, item)] && !provenKinds(item).includes(PERMANENT_EXCEPTIONS[keyOf(decision.id, item)].kind));
        expect(measured.length, 'a decisão tem de mostrar ao menos uma opção medível').toBeGreaterThan(0);
        expect(zeros.filter((item) => !isListed(item)).map((item) => `${item.group}/${item.option} = ${(item.share * 100).toFixed(3)}%`), 'opção que não muda a prévia e não está em nenhuma lista').toEqual([]);
        expect(wrongProof.map((item) => `${item.group}/${item.option}: lista ${PERMANENT_EXCEPTIONS[keyOf(decision.id, item)].kind}, provas ${provenKinds(item).join('+') || 'nenhuma'}`), 'exceção permanente sem a prova do motivo').toEqual([]);
        expect(measured.filter((item) => item.share >= MIN_CHANGED_SHARE && isListed(item)).map((item) => keyOf(decision.id, item)), 'item de lista que já muda a prévia: tire-o da lista').toEqual([]);
    });
}

test('Tema: o cartão de tema ainda não carregado espia como os outros', async () => {
    const { page, errors } = await openDecision('Tema', `&hold=${PENDING_THEME_ID}`);
    const card = page.locator(`[data-theme-id="${PENDING_THEME_ID}"]`);
    await expect(card, 'o import do tema está seguro: o cartão é o pendente').toHaveAttribute('aria-busy', 'true');
    const { share } = await peekOption(page, card, await takeBaseline(page));
    await page.close();
    expect(errors).toEqual([]);
    const listed = KNOWN_PENDING['theme/themes (carga pendente)']?.options.includes(PENDING_THEME_ID) ?? false;
    expect(share >= MIN_CHANGED_SHARE, `cartão pendente: ${(share * 100).toFixed(3)}% (listado: ${listed})`).toBe(!listed);
});
