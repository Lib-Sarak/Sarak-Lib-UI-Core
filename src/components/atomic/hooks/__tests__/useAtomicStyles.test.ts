// @vitest-environment node
import { describe, it, expect } from 'vitest';
import * as HookModule from '../useAtomicStyles';
import { useAtomicStyles } from '../useAtomicStyles';

describe('useAtomicStyles', () => {
    it('should export the hook correctly', () => {
        expect(HookModule).toBeDefined();
        // TODO: Escrever testes comportamentais para este hook
    });

    describe('controles de escolha (checkbox e radio)', () => {
        // O hook não usa hooks do React por dentro: dá para chamá-lo direto, em ambiente node.
        const { getCheckboxStyles, getRadioStyles, getChoiceMarkColor } = useAtomicStyles();

        it('a marca vem do token do thumb, com fallback', () => {
            expect(getChoiceMarkColor()).toBe('var(--sarak-switch-thumb, #ffffff)');
        });

        it('sem foco, o anel é nenhum; com foco, usa a largura e a cor de foco dos tokens', () => {
            expect(getCheckboxStyles(undefined, true).boxShadow).toBe('none');
            expect(getRadioStyles(undefined, true).boxShadow).toBe('none');

            const ring = String(getCheckboxStyles(undefined, false, false, true).boxShadow);
            expect(ring).toContain('var(--sarak-focus-width');
            expect(ring).toContain('var(--sarak-input-focus-border-color');
            expect(String(getRadioStyles(undefined, false, true).boxShadow)).toBe(ring);
        });

        it('marcado (ou indeterminado) pinta o fundo ativo; desmarcado fica transparente', () => {
            expect(getCheckboxStyles(undefined, true).backgroundColor).toContain('--sarak-checkbox-active');
            expect(getCheckboxStyles(undefined, false, true).backgroundColor).toContain('--sarak-checkbox-active');
            expect(getCheckboxStyles(undefined, false).backgroundColor).toBe('transparent');
            expect(getRadioStyles(undefined, true).backgroundColor).toContain('--sarak-checkbox-active');
            expect(getRadioStyles(undefined, false).backgroundColor).toBe('transparent');
        });
    });
});
