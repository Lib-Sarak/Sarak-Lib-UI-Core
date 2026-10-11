import { describe, expect, it } from 'vitest';
import { BREAKPOINT_TABLET } from '../../../../../core/Design/breakpoints';
import { GANTT_BAR_CLASS, GANTT_GROUP_CLASS, GANTT_LIST_CLASS, GANTT_MAX_HEIGHT, GANTT_ROW_HEIGHT, GANTT_ROW_SIZE, GANTT_SCROLL_HEIGHT, GANTT_STICKY_SURFACE } from '../ganttLayout';

// As constantes são literais (o Tailwind lê texto); aqui a forma interpolada pega a deriva
// caso o breakpoint de tablet mude e as classes fiquem para trás.
describe('ganttLayout', () => {
    const bp = `@min-[${BREAKPOINT_TABLET}px]:`;

    it('a lista se alarga a partir da faixa de tablet', () => {
        expect(GANTT_LIST_CLASS).toBe(
            `shrink-0 w-[calc(var(--sarak-layout-gap-md,16px)*6)] ${bp}w-[calc(var(--sarak-layout-gap-md,16px)*14)]`,
        );
    });

    it('o grupo só aparece no largo', () => {
        expect(GANTT_GROUP_CLASS).toBe(`hidden truncate ${bp}block`);
    });

    it('a barra troca a tipografia de ação pela de conteúdo', () => {
        expect(GANTT_BAR_CLASS).toBe('normal-case tracking-normal font-normal');
    });

    it('o fundo do que fica preso é opaco: a cor do cartão em camada sobre a de fundo do tema', () => {
        expect(GANTT_STICKY_SURFACE.backgroundColor).toBe('var(--color-theme-body, Canvas)');
        expect(String(GANTT_STICKY_SURFACE.backgroundImage)).toMatch(/^linear-gradient\(var\(--sarak-card-bg/);
    });

    it('a área que rola ocupa o host de altura definida e respeita o teto sem ela', () => {
        expect(GANTT_SCROLL_HEIGHT).toEqual({ flex: '1 1 auto', minHeight: '100%', maxHeight: GANTT_MAX_HEIGHT });
    });

    it('a altura da linha deriva do token de espaçamento', () => {
        expect(GANTT_ROW_HEIGHT).toMatch(/^calc\(var\(--sarak-layout-gap-md/);
    });
});

describe('alvo mínimo de toque da linha do Gantt', () => {
    it('a linha é a maior entre a altura do token de espaçamento e o alvo de toque ativo', () => {
        expect(GANTT_ROW_SIZE).toBe(`max(${GANTT_ROW_HEIGHT}, var(--sarak-touch-target-active, 0px))`);
    });
});
