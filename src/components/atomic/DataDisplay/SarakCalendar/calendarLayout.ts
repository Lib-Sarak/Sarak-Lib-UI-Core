/**
 * Classes de layout do SarakCalendar. Literais de propósito: o Tailwind lê o arquivo como
 * texto (container query nunca é montada por interpolação); a amarração com o breakpoint de
 * tablet está no teste. Mobile-first: no contêiner estreito o dia é baixo e o chip vira um
 * ponto que deixa o toque passar para a célula; da faixa de tablet para cima o dia cresce e
 * o chip mostra o título. O `@container` que estas classes consultam é plantado na raiz do
 * SarakCalendar.
 */

/** Altura mínima do dia: baixa no estreito, maior no largo, derivada do token de espaçamento. */
export const CALENDAR_CELL_CLASS =
    'min-h-[calc(var(--sarak-layout-gap-md,16px)*3)] @min-[768px]:min-h-[calc(var(--sarak-layout-gap-md,16px)*6)]';

/**
 * O chip: largura do ponto e sem toque no estreito; largura toda e clicável no largo. O título do evento é
 * conteúdo, não ação: caixa, espaçamento e peso comuns no lugar dos do átomo de botão (a classe do chamador
 * vence a do átomo).
 */
export const CALENDAR_CHIP_CLASS =
    'normal-case tracking-normal font-normal w-auto pointer-events-none @min-[768px]:w-full @min-[768px]:pointer-events-auto';

/** O título do chip só aparece no largo. */
export const CALENDAR_CHIP_LABEL_CLASS = 'hidden truncate @min-[768px]:block';

/** O ponto colorido só aparece no estreito. A classe decide o `display` nos dois tamanhos. */
export const CALENDAR_CHIP_DOT_CLASS = 'inline-block @min-[768px]:hidden';
