import { describe, expect, it } from 'vitest';
import { BREAKPOINT_TABLET } from '../../../../../core/Design/breakpoints';
import {
    CALENDAR_CELL_CLASS,
    CALENDAR_CHIP_CLASS,
    CALENDAR_CHIP_DOT_CLASS,
    CALENDAR_CHIP_LABEL_CLASS,
} from '../calendarLayout';

// As constantes são literais (o Tailwind lê texto); aqui a forma interpolada pega a deriva
// caso o breakpoint de tablet mude e as classes fiquem para trás.
describe('calendarLayout', () => {
    const bp = `@min-[${BREAKPOINT_TABLET}px]:`;

    it('a altura do dia cresce a partir da faixa de tablet', () => {
        expect(CALENDAR_CELL_CLASS).toBe(
            `min-h-[calc(var(--sarak-layout-gap-md,16px)*3)] ${bp}min-h-[calc(var(--sarak-layout-gap-md,16px)*6)]`,
        );
    });

    it('o chip tem texto comum e só recebe toque e largura toda a partir da faixa de tablet', () => {
        expect(CALENDAR_CHIP_CLASS).toBe(
            `normal-case tracking-normal font-normal w-auto pointer-events-none ${bp}w-full ${bp}pointer-events-auto`,
        );
    });

    it('título no largo, ponto no estreito', () => {
        expect(CALENDAR_CHIP_LABEL_CLASS).toBe(`hidden truncate ${bp}block`);
        expect(CALENDAR_CHIP_DOT_CLASS).toBe(`inline-block ${bp}hidden`);
    });
});
