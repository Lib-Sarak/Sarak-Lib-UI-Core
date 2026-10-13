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

    describe('sombra do campo (`inputShadow`, token de texto com duas palavras-chave)', () => {
        const { getInputStyles } = useAtomicStyles();

        it('`neumorphism` aplica o relevo interno da lib; sem foco é interno, com foco leva o anel por cima', () => {
            expect(String(getInputStyles({ inputShadow: 'neumorphism' } as never, false).boxShadow)).toContain('inset 2px 2px 5px');
            expect(String(getInputStyles({ inputShadow: 'neumorphism' } as never, true).boxShadow)).toContain('0 0 0 2px');
        });

        it('`none` não escreve sombra; texto CSS é gravado como box-shadow quando o campo não está focado', () => {
            expect(getInputStyles({ inputShadow: 'none' } as never, false).boxShadow).toBeUndefined();
            expect(getInputStyles({ inputShadow: '0 8px 20px rgba(0,0,0,0.25)' } as never, false).boxShadow).toBe('0 8px 20px rgba(0,0,0,0.25)');
        });
    });
});
