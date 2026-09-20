import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as ComponentModule from '../SarakCheckbox';
import { SarakCheckbox } from '../SarakCheckbox';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

// A pele é o irmão do <input>: a marca (check ou traço) é o seu único filho quando aparece.
const skinOf = (input: HTMLElement) => input.nextElementSibling as HTMLElement;
const hasMark = (input: HTMLElement) => skinOf(input).childElementCount > 0;

describe('SarakCheckbox', () => {
    afterEach(() => vi.restoreAllMocks());

    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
    });

    it('renderiza sem SarakUIProvider com checkbox desmarcado', () => {
        render(<SarakCheckbox label="Concordo" />);
        const input = screen.getByRole('checkbox');
        expect(input).not.toBeChecked();
    });

    it('renderiza com checkbox marcado quando checked=true', () => {
        render(<SarakCheckbox label="Concordo" checked={true} onChange={() => {}} />);
        const input = screen.getByRole('checkbox');
        expect(input).toBeChecked();
    });

    it('suporta estado indeterminado', () => {
        render(<SarakCheckbox label="Seleção parcial" indeterminate={true} onChange={() => {}} />);
        const input = screen.getByRole('checkbox') as HTMLInputElement;
        expect(input.indeterminate).toBe(true);
    });

    it('pode ser desabilitado', () => {
        render(<SarakCheckbox label="Desabilitado" disabled={true} />);
        const input = screen.getByRole('checkbox');
        expect(input).toBeDisabled();
    });

    it('responde a eventos de teclado (espaço para toggle)', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<SarakCheckbox label="Teste teclado" onChange={handleChange} />);

        const input = screen.getByRole('checkbox');
        input.focus();
        await user.keyboard('[Space]');

        expect(handleChange).toHaveBeenCalled();
    });

    it('renderiza com rótulo e descrição', () => {
        render(
            <SarakCheckbox
                label="Opção principal"
                description="Descrição da opção"
            />
        );

        expect(screen.getByText('Opção principal')).toBeInTheDocument();
        expect(screen.getByText('Descrição da opção')).toBeInTheDocument();
    });

    it('com SarakUIProvider, aplica o tema corretamente', () => {
        render(
            <SarakUIProvider>
                <SarakCheckbox label="Com tema" checked={true} onChange={() => {}} />
            </SarakUIProvider>
        );

        const input = screen.getByRole('checkbox');
        expect(input).toBeChecked();
    });

    describe('contrato de valor', () => {
        it('controlado: pele, aria-checked e input seguem o `checked` de quem chama', () => {
            const { rerender } = render(<SarakCheckbox label="x" checked={true} onChange={() => {}} />);
            const input = screen.getByRole('checkbox');
            expect(input).toBeChecked();
            expect(hasMark(input)).toBe(true);
            expect(input).toHaveAttribute('aria-checked', 'true');

            rerender(<SarakCheckbox label="x" checked={false} onChange={() => {}} />);
            expect(input).not.toBeChecked();
            expect(hasMark(input)).toBe(false);
            expect(input).toHaveAttribute('aria-checked', 'false');
        });

        it('controlado: clicar sem quem chama atualizar o valor NÃO muda a pele — o componente não guarda estado', async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();
            render(<SarakCheckbox label="x" checked={false} onChange={onChange} />);
            const input = screen.getByRole('checkbox');

            await user.click(input);

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(input).not.toBeChecked();
            expect(hasMark(input)).toBe(false);
            expect(input).toHaveAttribute('aria-checked', 'false');
        });

        it('não controlado: clicar marca e desmarca, e a pele e o aria-checked acompanham', async () => {
            const user = userEvent.setup();
            render(<SarakCheckbox label="x" />);
            const input = screen.getByRole('checkbox');
            expect(hasMark(input)).toBe(false);

            await user.click(input);
            expect(input).toBeChecked();
            expect(hasMark(input)).toBe(true);
            expect(input).toHaveAttribute('aria-checked', 'true');

            await user.click(input);
            expect(input).not.toBeChecked();
            expect(hasMark(input)).toBe(false);
            expect(input).toHaveAttribute('aria-checked', 'false');
        });

        it('não controlado: `defaultChecked` semeia o valor, pele incluída', () => {
            render(<SarakCheckbox label="x" defaultChecked />);
            const input = screen.getByRole('checkbox');
            expect(input).toBeChecked();
            expect(hasMark(input)).toBe(true);
        });

        it('o onChange de quem chama é recebido nos dois modos', async () => {
            const user = userEvent.setup();
            const onOwn = vi.fn();
            const onControlled = vi.fn();
            render(
                <>
                    <SarakCheckbox label="a" onChange={onOwn} />
                    <SarakCheckbox label="b" checked={false} onChange={onControlled} />
                </>,
            );
            const [own, controlled] = screen.getAllByRole('checkbox');

            await user.click(own);
            await user.click(controlled);

            expect(onOwn).toHaveBeenCalledTimes(1);
            expect(onOwn.mock.calls[0][0].target.checked).toBe(true);
            expect(onControlled).toHaveBeenCalledTimes(1);
        });

        it('onFocus/onBlur de quem chama não desligam o anel de foco interno', async () => {
            const user = userEvent.setup();
            const onFocus = vi.fn();
            const onBlur = vi.fn();
            render(<SarakCheckbox label="x" onFocus={onFocus} onBlur={onBlur} />);
            const input = screen.getByRole('checkbox');

            await user.tab();
            expect(onFocus).toHaveBeenCalledTimes(1);
            expect(skinOf(input).getAttribute('style')).toContain('--sarak-focus-width');

            await user.tab();
            expect(onBlur).toHaveBeenCalledTimes(1);
            expect(skinOf(input).getAttribute('style')).not.toContain('--sarak-focus-width');
        });

        it('indeterminado, nos três modos, não gera aviso do React (console.error)', () => {
            const error = vi.spyOn(console, 'error').mockImplementation(() => {});
            render(
                <>
                    <SarakCheckbox label="a" indeterminate />
                    <SarakCheckbox label="b" indeterminate checked={false} />
                    <SarakCheckbox label="c" indeterminate defaultChecked />
                </>,
            );
            const [a, b] = screen.getAllByRole('checkbox') as HTMLInputElement[];

            expect(a.indeterminate).toBe(true);
            expect(a).toHaveAttribute('aria-checked', 'mixed');
            expect(hasMark(a)).toBe(true);
            expect(b.indeterminate).toBe(true);
            expect(error).not.toHaveBeenCalled();
        });
    });

    describe('cor e classe', () => {
        it('a marca usa o token do thumb, sem cor fixa', () => {
            render(<SarakCheckbox label="x" checked onChange={() => {}} />);
            const mark = skinOf(screen.getByRole('checkbox')).firstElementChild as HTMLElement;
            expect(mark.getAttribute('style')).toContain('--sarak-switch-thumb');
            expect(mark.getAttribute('class')).not.toMatch(/text-white|bg-white/);
        });

        it('a className de quem chama vence o default do átomo (R35)', () => {
            const { container } = render(<SarakCheckbox label="x" className="cursor-default" />);
            const label = container.querySelector('label') as HTMLElement;
            expect(label).toHaveClass('cursor-default');
            expect(label).not.toHaveClass('cursor-pointer');
        });
    });
});
