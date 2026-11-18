/**
 * A prévia do painel mostra o efeito de toda opção destacada: espiar (hover) cada opção de cada grupo, de cada decisão, e medir
 * quantos pixels da prévia mudam contra a linha de base tirada imediatamente antes, com a barra de rolagem fora da conta.
 * A linha de base é de CADA opção, tirada depois de rolá-la até a vista e na tela do grupo (`groupScreens`): rolar a página, ou
 * saltar de tela, já muda a prévia, e uma base única contaria isso como efeito da opção.
 *
 * A REGRA: toda opção destacada muda a prévia acima do limiar (pixels que mudam forte, ou área grande que muda pouco). Quem não muda cai em uma de duas listas, e só nelas:
 *  - `PERMANENT_EXCEPTIONS`: o que nunca vai mudar a prévia, cada um com o motivo PROVADO por mecanismo, não por nome:
 *      `applied` — espiar a opção que o design já tem não muda nada; o spec escolhe (clique) outra opção do grupo e espia de
 *        novo: a que passa a mudar estava aplicada.
 *      `animation` — a opção só mexe em duração, atraso ou curva (a foto é tirada com `animations: 'disabled'`); o spec lê as
 *        variáveis do escopo da prévia antes e depois da espiada e exige que as que mudaram sejam todas de movimento.
 *      `other-mode` — só muda no outro modo (Claro/Escuro): o spec espia de novo, no modo claro, o que não mudou no escuro, e a
 *        que passa a mudar ali está provada.
 *      `computed` — o efeito é real e a foto não o distingue: o spec lê o estilo computado no elemento que consome o valor.
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
const DECISIONS_FILE = path.resolve(HERE, '..', 'src', 'features', 'DesignEngine', 'config', 'design-decisions.json');
const MATRIX_FILE = process.env.SARAK_PLAN160_MATRIZ;
/** Depuração: mede só esta decisão (id). */
const ONLY = process.env.SARAK_PLAN160_SO;

const DECISIONS = [
    { id: 'theme', name: 'Tema' }, { id: 'colors', name: 'Cores' }, { id: 'fonts', name: 'Fontes' },
    { id: 'shape', name: 'Forma' }, { id: 'components', name: 'Componentes' }, { id: 'bars', name: 'Barras' }, { id: 'layout', name: 'Layout' },
] as const;

/** A tela em que cada grupo mostra as opções, como a decisão declara (`groupScreens`): a mesma fonte que a espiada usa para levar a prévia até lá. */
const GROUP_SCREENS: Record<string, string> = Object.fromEntries(
    (JSON.parse(fs.readFileSync(DECISIONS_FILE, 'utf8')) as Array<{ groupScreens?: Record<string, string> }>).flatMap((decision) => Object.entries(decision.groupScreens ?? {})),
);

/** Fração mínima da área da prévia com pixel diferente para a opção contar como "mudou a prévia". */
const MIN_CHANGED_SHARE = 0.0003;
/** Soma da diferença dos três canais acima da qual um pixel conta (ruído de serrilhado fica abaixo). */
const PIXEL_NOISE = 30;
/**
 * Efeito de baixo contraste e de área grande (sombra escura sobre fundo escuro, textura, degradê, listra de tabela, vidro): cada
 * pixel muda pouco, e nenhum passa de `PIXEL_NOISE`. Conta como mudança quando pelo menos `BROAD_MIN_SHARE` da área muda
 * `BROAD_DELTA` ou mais: o ruído de serrilhado mora nas bordas e fica longe dessa área.
 */
const BROAD_DELTA = 6;
const BROAD_MIN_SHARE = 0.005;
/** Largura, em px, da borda direita ignorada: é onde a barra de rolagem da prévia pinta. */
const SCROLLBAR_STRIP = 24;
/** A espiada só compõe depois de 150 ms (`PEEK_DELAY_MS`); o piso cobre esse atraso e o teto limita a espera por quadro estável. */
const PEEK_FLOOR_MS = 260;
const STABLE_CAP_MS = 1500;
const QUIET_MS = 90;
const BASELINE_FLOOR_MS = 80;
const LATE_PEEK_MS = 500;
/** A conferência de um zero: quantas fotos extras, a que intervalo. Duas fotos seguidas iguais encerram. */
const STABLE_ATTEMPTS = 3;
const STABLE_RETRY_MS = 250;
/** Os tokens que só mexem em movimento: duração, atraso, curva e transição de página. */
const MOTION_TOKEN = /^(motion|pageTransition)/;

/** O cartão de tema ainda não carregado (`PresetCardPending`) é medido à parte, com o import do tema seguro. */
const PENDING_THEME_ID = 'neo-brutalism';

type ExceptionKind = 'applied' | 'animation' | 'other-mode' | 'computed';

/**
 * Prova pelo estilo computado, para a opção cujo efeito é real mas fica abaixo do que a foto distingue (a barra de rolagem fina,
 * reduzida a 0,61 de escala): o spec lê a propriedade no elemento que a consome, antes e durante a espiada, e exige que ela passe
 * a valer o que a opção escreve. Prova o leitor (a variável chega e o elemento a usa), não o pixel.
 */
const COMPUTED_PROOFS: Record<string, { selector: string; property: string; after: string }> = {
    'components/scroll/Fina': { selector: '[data-testid="live-preview-frame"] [data-peek-group~="scroll"] .custom-scrollbar', property: '--scroll-w', after: '3px' },
};

/** Chave `decisão/grupo/opção`. Cada item prova o próprio motivo (ver o cabeçalho). */
const PERMANENT_EXCEPTIONS: Record<string, { kind: ExceptionKind; reason: string }> = {
    'theme/themes/sarak-sovereign': { kind: 'applied', reason: 'é o tema do harness: a prévia já o tem, e a diferença que sobra fica em torno do limiar' },
    'fonts/fontPairs/Moderno': { kind: 'applied', reason: 'é o par de fontes do tema do harness (headingFont e bodyFont já valem): espiar o que já está aplicado não muda nada' },
    'components/icons/Preenchidos': { kind: 'applied', reason: 'é a família e o traço que o tema do harness já usa; escolher outro ícone e espiar de novo a faz mudar' },
    'bars/sidebar/Limpa': { kind: 'applied', reason: 'é o design do tema do harness a menos de sidebarBlur; escolher outra e espiar de novo a faz mudar' },
    'bars/barTone/Neutra': { kind: 'applied', reason: 'sidebarTone e topbarTone já são neutros no tema do harness; escolher outro tom e espiar de novo a faz mudar' },
    'layout/contentWidth/Fluida': { kind: 'applied', reason: 'maxContentWidth já vale (fluida); escolher outra largura e espiar de novo a faz mudar' },
    'components/charts/Área suave': { kind: 'applied', reason: 'é o tipo, a espessura e a suavização que o tema do harness já tem; escolher outro gráfico e espiar de novo a faz mudar' },
    'components/notice/Suave': { kind: 'applied', reason: 'é o raio da dica e o filete que o tema do harness já tem; escolher outro aviso e espiar de novo a faz mudar' },
    'components/switch/Tátil': { kind: 'applied', reason: 'switchStyleType já vale (tátil); escolher outro interruptor e espiar de novo a faz mudar' },
    'components/badge/Pílula': { kind: 'applied', reason: 'é o raio de selo que o tema do harness já usa; escolher outro selo e espiar de novo a faz mudar' },
    'components/emptyState/Esferas suaves': { kind: 'applied', reason: 'é o estado vazio que o tema do harness já tem; escolher outro e espiar de novo a faz mudar' },
    'colors/Paletas prontas/Ciano e violeta — Triádica': { kind: 'applied', reason: 'é a paleta do tema do harness; escolher outra e espiar de novo a faz mudar' },
    'shape/shadowDirection/Para baixo': { kind: 'applied', reason: 'shadowOrientation já vale (para baixo) no tema do harness' },
    'shape/border/Sólida': { kind: 'applied', reason: 'borderType já vale (sólida) no tema do harness' },
    'shape/material/Vidro fosco': { kind: 'applied', reason: 'surfaceMaterial já vale (vidro fosco) no tema do harness' },
    'shape/atmosphere/Nenhuma (Sem Mídia)': { kind: 'applied', reason: 'globalBackgroundImageUrl já está vazio no tema do harness' },
    'components/tables/Padrão': { kind: 'applied', reason: 'densidade, listras, raio e respiro que o tema do harness já tem (os quatro tokens valem o mesmo): espiar o que já está aplicado não muda nada' },
    'components/modal/Clássica': { kind: 'applied', reason: 'cabeçalho, alinhamento, desfoque e raio de desktop que o tema do harness já tem; é a única opção destacada do grupo' },
    'shape/glass/Facetado': { kind: 'other-mode', reason: 'o brilho de quina e a saturação do vidro só aparecem no claro; no escuro o spec mede 0, no claro a prévia muda' },
    'components/scroll/Fina': { kind: 'computed', reason: 'a barra de 3 px chega ao elemento da lista (--scroll-w de 6 para 3 px); reduzida a 0,61 de escala a diferença de pixel fica no limiar (ora acima, ora abaixo de 30), então a prova é o estilo computado e a trava de pixel não vale para ela' },
    'components/motion/Instantâneo': { kind: 'animation', reason: 'escreve só tokens motion*: durações e atraso, que a foto sem animação não vê' },
    'components/pageTransition/Esmaecer': { kind: 'animation', reason: 'escreve só pageTransitionType, que só atua na troca de tela (fade já é o valor do harness)' },
};

/** Por `decisão/grupo`: o defeito do painel e as opções que ele atinge. A esvaziar até o fim do lote 3. */
const KNOWN_PENDING: Record<string, { reason: string; options: string[] }> = {};

let browser: Browser;
let harnessDirectory: string;
let harnessUrl: string;
let results: Record<string, Measured[]>;

interface Target { group: string; option: string; selector: string; busy: boolean }
/** O que o registro de presets diz da opção: os tokens que ela escreve e se todos já valem no design do harness. */
interface PresetFacts { keys: string[]; applied: boolean }
interface Measured { group: string; option: string; share: number; lightShare?: number; computed?: { before: string; after: string; expected: string }; applied: boolean; changedVariables: string[]; preset: PresetFacts | null }
interface Peek { share: number; changedVariables: string[] }

/** Quanto do quadro difere do outro, como fração da área, sem a faixa da barra de rolagem. */
const changedShare = (page: Page, first: Buffer, second: Buffer): Promise<number> => page.evaluate(async ([a, b, strip, noise, broadDelta, broadMinShare]) => {
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
    let faint = 0;
    for (let y = 0; y < one.height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const i = (y * one.width + x) * 4;
            const delta = Math.abs(one.data[i] - two.data[i]) + Math.abs(one.data[i + 1] - two.data[i + 1]) + Math.abs(one.data[i + 2] - two.data[i + 2]);
            if (delta > noise) differing += 1;
            if (delta >= broadDelta) faint += 1;
        }
    }
    const area = width * one.height;
    return Math.max(differing / area, faint / area >= broadMinShare ? faint / area : 0);
}, [first.toString('base64'), second.toString('base64'), SCROLLBAR_STRIP, PIXEL_NOISE, BROAD_DELTA, BROAD_MIN_SHARE] as const);

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

/** A tela que a prévia mostra agora (o seletor de tela da barra da prévia). */
/** O seletor mostra a primeira tela quando a decisão abre numa que ele não lista (as telas de decisão): por isso a tela de abertura só é refeita se o grupo anterior a trocou. */
const screenSelect = (page: Page): Locator => page.locator('select').filter({ has: page.locator('option[value="dashboard"]') });

/**
 * Leva a prévia à tela em que o grupo mostra as opções, pela barra da prévia (sem espiar, sem mexer no rascunho). Grupo sem tela
 * própria fica na tela em que a decisão abriu. A linha de base de um grupo se tira DEPOIS disto: com a prévia já na tela do
 * grupo, o que a espiada muda é o efeito da opção, não o salto de tela. A tela é mais alta que a prévia: a seção do grupo
 * (`data-peek-group`) é rolada até o centro da prévia (a moldura corta o que passa dela, mesmo com o elemento dentro da janela), porque a foto só pega o que está visível.
 */
const showGroupScreen = async (page: Page, group: string, openingScreen: string): Promise<void> => {
    const select = screenSelect(page);
    const target = GROUP_SCREENS[group] ?? openingScreen;
    if ((await select.inputValue()) !== target) await select.selectOption(target);
    const section = page.locator(`[data-testid="live-preview-frame"] [data-peek-group~="${group}"]`).first();
    if ((await section.count()) > 0) await section.evaluate((node) => node.scrollIntoView({ block: 'center' }));
    await page.mouse.move(2, 2);
    await settlePreview(page, BASELINE_FLOOR_MS);
};

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
        // O cartão de tema também é uma opção (`data-option-tile`), mas entra abaixo, pelo botão com o id do tema.
        area.querySelectorAll('[data-option-tile]:not(:has([data-theme-id]))').forEach((tile, index) => add(tile, group, Array.from(tile.querySelectorAll('h3')).pop()?.textContent?.trim() ?? `#${index}`, index));
    });
    document.querySelectorAll('[role="radiogroup"]').forEach((gallery) => {
        const group = gallery.getAttribute('aria-label') ?? 'radiogroup';
        gallery.querySelectorAll('[role="radio"]').forEach((radio, index) => add(radio, group, radio.getAttribute('aria-label') ?? radio.textContent?.trim() ?? `#${index}`, index));
    });
    document.querySelectorAll('[data-theme-id]').forEach((button, index) => { const card = button.closest('[data-option-tile]') ?? button; add(card, 'themes', button.getAttribute('data-theme-id') ?? `#${index}`, index, button.getAttribute('aria-busy') === 'true'); });
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
 * A prévia desktop desenha a janela do sistema e a reduz para caber: um elemento ocupa `escala²` da área que ocuparia em tamanho
 * real. A fração que mudou é dividida por isso (peso = 1/escala²), para o limiar valer para a área do sistema desenhado, e não
 * para a da moldura. Tablet e celular não reduzem (escala 1).
 */
const areaWeight = (page: Page): Promise<number> => page.evaluate(() => {
    const layer = document.querySelector('[data-testid="live-preview-frame"] .origin-top-left') as HTMLElement | null;
    const scale = Number.parseFloat(layer?.style.transform.replace('scale(', '') ?? '1');
    return Number.isFinite(scale) && scale > 0 ? 1 / (scale * scale) : 1;
});

const previewShot = (page: Page): Promise<Buffer> => page.locator('[data-testid="live-preview-frame"]').screenshot({ animations: 'disabled' });

/**
 * A fração que mudou, medida com a prévia ESTÁVEL: a foto vale quando uma segunda, tirada logo depois, é igual a ela. Sob carga
 * a espiada pode ainda estar pintando (componente preguiçoso, gráfico), e uma opção com efeito sairia como "sem efeito". Só o
 * que dá zero paga a conferência: se a prévia ainda mexe, espera e mede de novo, até o teto de tentativas.
 */
const shareWhenStable = async (page: Page, base: Baseline): Promise<number> => {
    const weight = await areaWeight(page);
    let shot = await previewShot(page);
    let share = (await changedShare(page, base.shot, shot)) * weight;
    for (let attempt = 0; attempt < STABLE_ATTEMPTS && share < MIN_CHANGED_SHARE; attempt += 1) {
        await page.waitForTimeout(STABLE_RETRY_MS);
        const next = await previewShot(page);
        const moved = (await changedShare(page, shot, next)) * weight;
        share = Math.max(share, (await changedShare(page, base.shot, next)) * weight);
        shot = next;
        if (moved < MIN_CHANGED_SHARE && attempt > 0) break;
    }
    return share;
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
    const changedVariables = Object.keys({ ...base.variables, ...after }).filter((name) => base.variables[name] !== after[name]);
    return { share: await shareWhenStable(page, base), changedVariables };
};

/**
 * Espia uma opção contra a linha de base DELA: rola a opção até a vista, tira a linha de base e só então põe o mouse nela. A
 * prévia depende da rolagem da página (rolar a opção até a vista, sem espiar, já muda a prévia), então uma linha de base tirada
 * antes da rolagem contaria a rolagem como efeito da opção.
 */
const peekOption = async (page: Page, element: Locator): Promise<Peek> => {
    await element.scrollIntoViewIfNeeded();
    return peekAgainst(page, element, await takeBaseline(page));
};

const probeAfterChoosing = async (page: Page, chosen: Target, probes: Array<{ entry: Measured; own: Target }>): Promise<void> => {
    if (probes.length === 0) return;
    await page.locator(chosen.selector).scrollIntoViewIfNeeded();
    await page.locator(chosen.selector).click();
    for (const { entry, own } of probes) entry.applied = (await peekOption(page, page.locator(own.selector))).share >= MIN_CHANGED_SHARE;
};

/**
 * Das opções de um grupo que não mudaram: escolhe a primeira do grupo e espia de novo as outras, todas contra a mesma linha de
 * base; para a própria primeira, escolhe a segunda. A que passa a mudar era a que o design já tinha, e por isso não mudava.
 * Roda depois de toda a medição, porque o clique grava no rascunho.
 */
const markApplied = async (page: Page, targets: Target[], measured: Measured[], openingScreen: string): Promise<void> => {
    for (const group of [...new Set(measured.map((item) => item.group))]) {
        const choices = targets.filter((target) => target.group === group && !target.busy);
        const zeros = measured.filter((item) => item.group === group && item.share < MIN_CHANGED_SHARE)
            .flatMap((entry) => { const own = choices.find((target) => target.option === entry.option); return own ? [{ entry, own }] : []; });
        if (choices.length < 2) continue;
        await showGroupScreen(page, group, openingScreen);
        await probeAfterChoosing(page, choices[0], zeros.filter((pair) => pair.own !== choices[0]));
        await probeAfterChoosing(page, choices[1], zeros.filter((pair) => pair.own === choices[0]));
    }
};


/**
 * O modo de cor da prévia, pelo ⚙ da barra dela (é onde o modo mora): o item mostra o modo para onde vai, `label` é o que ele diz
 * ANTES do clique.
 */
const setPreviewMode = async (page: Page, label: 'Modo Claro' | 'Modo Escuro'): Promise<void> => {
    await page.locator('.sarak-device-desktop [data-sarak-widget="preferences-menu"]').getByRole('button').first().click();
    await page.getByRole('menu', { name: 'Preferências' }).getByText(label, { exact: true }).click();
    await page.keyboard.press('Escape');
    await page.mouse.move(2, 2);
    await settlePreview(page, PEEK_FLOOR_MS + 400);
};

/**
 * O que não mudou no escuro é espiado de novo no claro: sombra escura sobre fundo escuro, por exemplo, não se vê, e se vê no
 * claro. A opção que muda no outro modo fica provada como `other-mode`. Roda antes de qualquer clique, com o rascunho intacto.
 */
const measureInLightMode = async (page: Page, targets: Target[], measured: Measured[], openingScreen: string): Promise<void> => {
    const zeros = measured.filter((item) => item.share < MIN_CHANGED_SHARE);
    if (zeros.length === 0) return;
    await setPreviewMode(page, 'Modo Claro');
    for (const item of zeros) {
        const own = targets.find((target) => target.group === item.group && target.option === item.option);
        if (!own) continue;
        await showGroupScreen(page, item.group, openingScreen);
        item.lightShare = (await peekOption(page, page.locator(own.selector))).share;
    }
    await setPreviewMode(page, 'Modo Escuro');
};

/** O valor computado de uma propriedade (variável ou CSS) no elemento da prova. */
const readComputed = (page: Page, proof: { selector: string; property: string }): Promise<string> => page.evaluate(({ selector, property }) => {
    const node = document.querySelector(selector);
    return node ? getComputedStyle(node).getPropertyValue(property).trim() : '';
}, proof);

const measureDecision = async (decisionName: string, decisionId: string): Promise<Measured[]> => {
    const { page, errors } = await openDecision(decisionName);
    const targets = await collectTargets(page);
    const registry = await page.evaluate(() => (window as unknown as { __plan160: Record<string, PresetFacts> }).__plan160);
    const openingScreen = await screenSelect(page).inputValue();
    const measured: Measured[] = [];
    for (const group of [...new Set(targets.map((target) => target.group))]) {
        await showGroupScreen(page, group, openingScreen);
        for (const target of targets.filter((candidate) => candidate.group === group)) {
            const proof = COMPUTED_PROOFS[`${decisionId}/${target.group}/${target.option}`];
            let before = '';
            if (proof) {
                await page.mouse.move(2, 2);
                await settlePreview(page, BASELINE_FLOOR_MS);
                before = await readComputed(page, proof);
            }
            const peek = await peekOption(page, page.locator(target.selector));
            const computed = proof ? { before, after: await readComputed(page, proof), expected: proof.after } : undefined;
            measured.push({ group: target.group, option: target.option, share: peek.share, applied: false, changedVariables: peek.changedVariables, preset: registry[`${target.group}/${target.option}`] ?? null, computed });
        }
    }
    await measureInLightMode(page, targets, measured, openingScreen);
    await markApplied(page, targets, measured, openingScreen);
    await page.close();
    expect(errors).toEqual([]);
    return measured;
};

// A medição inteira roda no beforeAll, uma decisão por vez, num navegador só: nada aqui compete com outro teste do arquivo. Sob
// carga (outros arquivos em paralelo) o que se perde é tempo de pintura, e a conferência de zeros acima absorve isso; se ela
// não bastar, o arquivo inteiro passa a rodar em série.
test.beforeAll(async () => {
    test.setTimeout(1_800_000);
    const executablePath = process.env.SARAK_CHROMIUM_EXECUTABLE_PATH;
    // O Playwright esconde as barras de rolagem no headless; a opção de rolagem só se vê com elas pintadas.
    // O Playwright esconde as barras de rolagem no headless; a opção de rolagem só se vê com elas pintadas.
    browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'], ...(executablePath ? { executablePath } : {}) });
    const harness = await buildHarness(ENTRY);
    harnessDirectory = harness.outDir;
    harnessUrl = pathToFileURL(harness.htmlPath).href;
    // Uma decisão por vez: páginas medindo em paralelo travam o hover (a página fora de foco não pinta).
    const measured: Measured[][] = [];
    for (const decision of DECISIONS) {
        const started = Date.now();
        measured.push(!ONLY || ONLY === decision.id ? await measureDecision(decision.name, decision.id) : []);
        console.log('TEMPO', decision.id, ((Date.now() - started) / 1000).toFixed(1), 's');
    }
    if (MATRIX_FILE) fs.writeFileSync(MATRIX_FILE, DECISIONS.flatMap((decision, index) => measured[index].map((item) => `${decision.id}/${item.group}/${item.option}|${item.share.toFixed(4)}|${(item.lightShare ?? -1).toFixed(4)}|${item.applied}|${item.changedVariables.join(',')}|${item.preset ? `${item.preset.applied}:${item.preset.keys.join(',')}` : 'sem-registro'}`)).join(String.fromCharCode(10)));
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
    if ((item.lightShare ?? 0) >= MIN_CHANGED_SHARE) kinds.push('other-mode');
    if (item.computed && item.computed.before !== item.computed.after && item.computed.after === item.computed.expected) kinds.push('computed');
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
        expect(measured.filter((item) => item.share >= MIN_CHANGED_SHARE && isListed(item) && PERMANENT_EXCEPTIONS[keyOf(decision.id, item)]?.kind !== 'computed').map((item) => keyOf(decision.id, item)), 'item de lista que já muda a prévia: tire-o da lista').toEqual([]);
    });
}

/** Abre o Tema com o import do tema pendente seguro, tira a linha de base e põe o mouse no cartão pendente. */
const hoverPendingCard = async (): Promise<{ page: Page; errors: string[]; base: Baseline; card: Locator }> => {
    const { page, errors } = await openDecision('Tema', `&hold=${PENDING_THEME_ID}`);
    const card = page.locator(`[data-theme-id="${PENDING_THEME_ID}"]`);
    await expect(card, 'o import do tema está seguro: o cartão é o pendente').toHaveAttribute('aria-busy', 'true');
    await card.scrollIntoViewIfNeeded();
    const base = await takeBaseline(page);
    const box = await card.boundingBox();
    if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await settlePreview(page, PEEK_FLOOR_MS);
    return { page, errors, base, card };
};

test('Tema: o cartão de tema ainda não carregado não aplica nada enquanto o tema não chega, nem se o mouse sai antes dele', async () => {
    const { page, errors, base, card } = await hoverPendingCard();
    expect(await changedShare(page, base.shot, await previewShot(page)), 'com o tema ainda preso, a espiada não muda a prévia').toBeLessThan(MIN_CHANGED_SHARE);
    await page.mouse.move(2, 2);
    await page.evaluate(() => (window as unknown as { __releaseTheme: () => void }).__releaseTheme());
    await expect(card, 'o tema chegou: o cartão deixou de estar ocupado').not.toHaveAttribute('aria-busy', 'true');
    await settlePreview(page, 700);
    expect(await changedShare(page, base.shot, await previewShot(page)), 'o mouse saiu antes de o tema chegar: nada foi aplicado').toBeLessThan(MIN_CHANGED_SHARE);
    await page.close();
    expect(errors).toEqual([]);
});

test('Tema: o cartão de tema ainda não carregado carrega o tema ao ser espiado e mostra a prévia dele quando chega', async () => {
    const { page, errors, base, card } = await hoverPendingCard();
    await page.evaluate(() => (window as unknown as { __releaseTheme: () => void }).__releaseTheme());
    await expect(card, 'o tema chegou: o cartão deixou de estar ocupado').not.toHaveAttribute('aria-busy', 'true');
    await settlePreview(page, PEEK_FLOOR_MS + 400);
    const share = await shareWhenStable(page, base);
    await page.close();
    expect(errors).toEqual([]);
    expect(share, `cartão que estava pendente: ${(share * 100).toFixed(3)}%`).toBeGreaterThanOrEqual(MIN_CHANGED_SHARE);
});
