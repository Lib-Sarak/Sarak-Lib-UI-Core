import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as ComponentModule from '../SarakRadio';
import { SarakRadio } from '../SarakRadio';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

// A pele é o irmão do <input>: o ponto é o seu único filho quando aparece.
const skinOf = (input: HTMLElement) => input.nextElementSibling as HTMLElement;
const hasMark = (input: HTMLElement) => skinOf(input).childElementCount > 0;

describe('SarakRadio', () => {
    afterEach(() => vi.restoreAllMocks());

    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
    });

    it('renderiza sem SarakUIProvider com radio desmarcado', () => {
        render(<SarakRadio label="Opção 1" name="grupo" />);
        const input = screen.getByRole('radio');
        expect(input).not.toBeChecked();
    });

    it('renderiza com radio marcado quando checked=true', () => {
        render(<SarakRadio label="Opção 1" name="grupo" checked={true} onChange={() => {}} />);
        const input = screen.getByRole('radio');
        expect(input).toBeChecked();
    });

    it('pode ser desabilitado', () => {
        render(<SarakRadio label="Opção desabilitada" name="grupo" disabled={true} />);
        const input = screen.getByRole('radio');
        expect(input).toBeDisabled();
    });

    it('responde a eventos de teclado (espaço para marcar)', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<SarakRadio label="Opção 1" name="grupo" onChange={handleChange} />);

        const input = screen.getByRole('radio');
        input.focus();
        await user.keyboard('[Space]');

        expect(handleChange).toHaveBeenCalled();
    });

    it('renderiza com rótulo e descrição', () => {
        render(
            <SarakRadio
                label="Opção principal"
                description="Descrição da opção"
                name="grupo"
            />
        );

        expect(screen.getByText('Opção principal')).toBeInTheDocument();
        expect(screen.getByText('Descrição da opção')).toBeInTheDocument();
    });

    it('agrupa múltiplos radios pelo atributo name', () => {
        render(
            <div>
                <SarakRadio label="Opção 1" name="escolha" value="opt1" checked={true} onChange={() => {}} />
                <SarakRadio label="Opção 2" name="escolha" value="opt2" onChange={() => {}} />
                <SarakRadio label="Opção 3" name="escolha" value="opt3" onChange={() => {}} />
            </div>
        );

        const radios = screen.getAllByRole('radio');
        expect(radios).toHaveLength(3);
        expect(radios[0]).toBeChecked();
        expect(radios[1]).not.toBeChecked();
        expect(radios[2]).not.toBeChecked();
    });

    it('com SarakUIProvider, aplica o tema corretamente', () => {
        render(
            <SarakUIProvider>
                <SarakRadio label="Com tema" name="grupo" checked={true} onChange={() => {}} />
            </SarakUIProvider>
        );

        const input = screen.getByRole('radio');
        expect(input).toBeChecked();
    });

    describe('contrato de valor', () => {
        it('controlado: pele e input seguem o `checked` de quem chama', () => {
            const { rerender } = render(<SarakRadio label="x" name="g" checked={true} onChange={() => {}} />);
            const input = screen.getByRole('radio');
            expect(input).toBeChecked();
            expect(hasMark(input)).toBe(true);

            rerender(<SarakRadio label="x" name="g" checked={false} onChange={() => {}} />);
            expect(input).not.toBeChecked();
            expect(hasMark(input)).toBe(false);
        });

        it('controlado: clicar sem quem chama atualizar o valor NÃO muda a pele — o componente não guarda estado', async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();
            render(<SarakRadio label="x" name="g" checked={false} onChange={onChange} />);
            const input = screen.getByRole('radio');

            await user.click(input);

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(input).not.toBeChecked();
            expect(hasMark(input)).toBe(false);
        });

        it('não controlado: clicar marca, e a pele acompanha', async () => {
            const user = userEvent.setup();
            render(<SarakRadio label="x" name="g" />);
            const input = screen.getByRole('radio');
            expect(hasMark(input)).toBe(false);

            await user.click(input);

            expect(input).toBeChecked();
            expect(hasMark(input)).toBe(true);
        });

        it('não controlado: `defaultChecked` semeia o valor, pele incluída', () => {
            render(<SarakRadio label="x" name="g" defaultChecked />);
            const input = screen.getByRole('radio');
            expect(input).toBeChecked();
            expect(hasMark(input)).toBe(true);
        });

        it('não controlado: dois rádios de mesmo `name` se excluem — input E pele', async () => {
            const user = userEvent.setup();
            render(
                <>
                    <SarakRadio label="1" name="escolha" value="a" defaultChecked />
                    <SarakRadio label="2" name="escolha" value="b" />
                </>,
            );
            const [a, b] = screen.getAllByRole('radio');
            expect(hasMark(a)).toBe(true);
            expect(hasMark(b)).toBe(false);

            await user.click(b);
            expect(a).not.toBeChecked();
            expect(b).toBeChecked();
            expect(hasMark(a)).toBe(false);
            expect(hasMark(b)).toBe(true);

            await user.click(a);
            expect(hasMark(a)).toBe(true);
            expect(hasMark(b)).toBe(false);
        });

        it('rádios de `name` diferente não se afetam', async () => {
            const user = userEvent.setup();
            render(
                <>
                    <SarakRadio label="1" name="g1" defaultChecked />
                    <SarakRadio label="2" name="g2" />
                </>,
            );
            const [a, b] = screen.getAllByRole('radio');

            await user.click(b);

            expect(hasMark(a)).toBe(true);
            expect(hasMark(b)).toBe(true);
        });

        it('o onChange de quem chama é recebido nos dois modos', async () => {
            const user = userEvent.setup();
            const onOwn = vi.fn();
            const onControlled = vi.fn();
            render(
                <>
                    <SarakRadio label="a" name="g1" onChange={onOwn} />
                    <SarakRadio label="b" name="g2" checked={false} onChange={onControlled} />
                </>,
            );
            const [own, controlled] = screen.getAllByRole('radio');

            await user.click(own);
            await user.click(controlled);

            expect(onOwn).toHaveBeenCalledTimes(1);
            expect(onControlled).toHaveBeenCalledTimes(1);
        });

        it('controlado sem onChange não gera aviso do React no console', () => {
            const error = vi.spyOn(console, 'error').mockImplementation(() => {});
            render(<SarakRadio label="x" name="g" checked />);
            expect(error).not.toHaveBeenCalled();
        });

        it('onFocus/onBlur de quem chama não desligam o anel de foco interno', async () => {
            const user = userEvent.setup();
            const onFocus = vi.fn();
            const onBlur = vi.fn();
            render(<SarakRadio label="x" name="g" onFocus={onFocus} onBlur={onBlur} />);
            const input = screen.getByRole('radio');

            await user.tab();
            expect(onFocus).toHaveBeenCalledTimes(1);
            expect(skinOf(input).getAttribute('style')).toContain('--sarak-focus-width');

            await user.tab();
            expect(onBlur).toHaveBeenCalledTimes(1);
            expect(skinOf(input).getAttribute('style')).not.toContain('--sarak-focus-width');
        });
    });

    describe('cor e classe', () => {
        it('o ponto usa o token do thumb, sem cor fixa', () => {
            render(<SarakRadio label="x" name="g" checked onChange={() => {}} />);
            const dot = skinOf(screen.getByRole('radio')).firstElementChild as HTMLElement;
            expect(dot.getAttribute('style')).toContain('--sarak-switch-thumb');
            expect(dot.getAttribute('class')).not.toMatch(/bg-white/);
        });

        it('a className de quem chama vence o default do átomo (R35)', () => {
            const { container } = render(<SarakRadio label="x" name="g" className="cursor-default" />);
            const label = container.querySelector('label') as HTMLElement;
            expect(label).toHaveClass('cursor-default');
            expect(label).not.toHaveClass('cursor-pointer');
        });
    });
});
