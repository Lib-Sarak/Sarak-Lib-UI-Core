/**
 * Medidas e classes de layout do SarakGantt. As classes são literais de propósito: o Tailwind lê o arquivo
 * como texto (container query nunca é montada por interpolação); a amarração com o breakpoint de tablet está
 * no teste. O `@container` que elas consultam é plantado na raiz do SarakGantt.
 *
 * Mobile-first: no contêiner estreito a lista vira uma coluna de título estreita, sem o grupo, e a linha do
 * tempo rola ao lado dela; da faixa de tablet para cima a lista se alarga e mostra o grupo.
 */
import type { CSSProperties } from 'react';

/**
 * Fundo do que fica PRESO (lista, cabeçalhos) por cima do que rola: a cor do cartão em camada sobre a cor de
 * fundo do tema. Só a do cartão não basta, porque o tema pode deixá-la translúcida (vidro) e as barras
 * apareceriam por trás.
 */
export const GANTT_STICKY_SURFACE: CSSProperties = {
    backgroundColor: 'var(--color-theme-body, Canvas)',
    backgroundImage:
        'linear-gradient(var(--sarak-card-bg, var(--color-theme-card, transparent)), var(--sarak-card-bg, var(--color-theme-card, transparent)))',
};

/** Altura de uma linha (lista e linha do tempo usam a mesma), derivada do token de espaçamento. */
export const GANTT_ROW_HEIGHT = 'calc(var(--sarak-layout-gap-md, 16px) * 2.5)';

/** Altura do cabeçalho fixo (o "Tarefa" da lista e as datas da linha do tempo). */
export const GANTT_HEADER_HEIGHT = 'calc(var(--sarak-layout-gap-md, 16px) * 2.5)';

/** Teto da área que rola quando o host NÃO tem altura definida; acima dele, lista e linha do tempo rolam juntas. */
export const GANTT_MAX_HEIGHT = 'calc(var(--sarak-layout-gap-md, 16px) * 30)';

/**
 * Altura da área que rola (item flex da raiz em coluna, que tem `height: 100%`). Com host de altura definida, o
 * `min-height: 100%` resolve para a altura dele e vence o teto: a área ocupa o host inteiro e rola por dentro.
 * Sem altura no host, o percentual não resolve (vale 0) e o teto manda. Medido no Chromium: host de 420 → 420;
 * de 1000 → 1000; sem altura → o teto, ou a altura do conteúdo se ela for menor.
 */
export const GANTT_SCROLL_HEIGHT: CSSProperties = { flex: '1 1 auto', minHeight: '100%', maxHeight: GANTT_MAX_HEIGHT };

/** Largura da coluna da lista: estreita no contêiner estreito, larga a partir da faixa de tablet. */
export const GANTT_LIST_CLASS =
    'shrink-0 w-[calc(var(--sarak-layout-gap-md,16px)*6)] @min-[768px]:w-[calc(var(--sarak-layout-gap-md,16px)*14)]';

/** O grupo da tarefa só aparece no largo. */
export const GANTT_GROUP_CLASS = 'hidden truncate @min-[768px]:block';

/** A barra é conteúdo, não ação: caixa, espaçamento e peso comuns no lugar dos do átomo de botão. */
export const GANTT_BAR_CLASS = 'normal-case tracking-normal font-normal';
