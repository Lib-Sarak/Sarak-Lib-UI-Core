import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DynamicTokenControl } from '../DynamicTokenControl';
import { TokenControl } from '../../Main/components/TokenControl';
import { ColorControl } from '../controls/ColorControl';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { validateDesign } from '../../../../core/Provider/utils/validation';
import { sarakGetAllDesignTokens } from '../../../../core/Design/master-map';
import type { SarakDesignToken, SarakTokenValue } from '../../../../core/Design/types';
import type { SarakDesignState } from '../../../../core/Provider/types';

/**
 * O painel grava o que mostra: cada controle devolve ao rascunho um valor que a validação do tema aceita e
 * que é o que a tela exibiu. Os átomos leem `useSarakUI()`, então tudo monta sob o Provider.
 */
const withProvider = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);
const tokenById = (id: string): SarakDesignToken => {
    const token = sarakGetAllDesignTokens().find((candidate) => candidate.id === id);
    if (!token) throw new Error(`token ${id} não existe no schema`);
    return token;
};
const draftOf = (values: Record<string, SarakTokenValue>) => values as unknown as SarakDesignState;

const responsiveToken: SarakDesignToken = {
    id: 'cardBorderRadius',
    label: 'Raio',
    type: 'slider',
    isResponsive: true,
    unit: 'px',
    constraints: { min: 0, max: 40 },
    defaultValue: { desk: 12, tab: 10, mob: 8 },
};

describe('slider de token responsivo', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('mostra os três pontos (nunca NaN) e grava o objeto inteiro ao editar um deles', () => {
        const updateDraft = vi.fn();
        const { container } = withProvider(
            <DynamicTokenControl token={responsiveToken} draft={draftOf({ cardBorderRadius: { desk: 12, tab: 10, mob: 8 } })} updateDraft={updateDraft} />,
        );

        expect(container.textContent).not.toContain('NaN');
        expect(container.textContent).toContain('12px');
        expect(container.textContent).toContain('10px');
        expect(container.textContent).toContain('8px');

        const sliders = screen.getAllByRole('slider');
        expect(sliders).toHaveLength(3);
        fireEvent.change(sliders[1], { target: { value: '20' } });
        vi.advanceTimersByTime(150);

        expect(updateDraft).toHaveBeenCalledTimes(1);
        expect(updateDraft).toHaveBeenCalledWith('cardBorderRadius', { desk: 12, tab: 20, mob: 8 });
    });

    it('dois pontos editados dentro da janela de debounce não perdem o primeiro', () => {
        const updateDraft = vi.fn();
        withProvider(
            <DynamicTokenControl token={responsiveToken} draft={draftOf({ cardBorderRadius: { desk: 12, tab: 10, mob: 8 } })} updateDraft={updateDraft} />,
        );
        const sliders = screen.getAllByRole('slider');
        fireEvent.change(sliders[0], { target: { value: '30' } });
        fireEvent.change(sliders[2], { target: { value: '4' } });
        vi.advanceTimersByTime(150);

        expect(updateDraft).toHaveBeenLastCalledWith('cardBorderRadius', { desk: 30, tab: 10, mob: 4 });
    });

    it('valor escalar salvo vale para os três pontos e a edição o promove ao objeto completo', () => {
        const updateDraft = vi.fn();
        withProvider(<DynamicTokenControl token={responsiveToken} draft={draftOf({ cardBorderRadius: 16 })} updateDraft={updateDraft} />);
        fireEvent.change(screen.getAllByRole('slider')[0], { target: { value: '18' } });
        vi.advanceTimersByTime(150);

        expect(updateDraft).toHaveBeenCalledWith('cardBorderRadius', { desk: 18, tab: 16, mob: 16 });
    });

    it('um token real do schema (sidebarWidth, 37 deles mostravam NaN) renderiza sem NaN', () => {
        const { container } = withProvider(
            <DynamicTokenControl token={tokenById('sidebarWidth')} draft={draftOf({})} updateDraft={vi.fn()} />,
        );
        expect(container.textContent).not.toContain('NaN');
    });
});

describe('sufixo é a unidade declarada', () => {
    it('token sem unidade mostra o número cru (opacidade 0.6 não vira "0.6px")', () => {
        const { container } = withProvider(
            <DynamicTokenControl token={tokenById('cardSurfaceOpacity')} draft={draftOf({ cardSurfaceOpacity: 0.6 })} updateDraft={vi.fn()} />,
        );
        expect(container.textContent).toContain('0.6');
        expect(container.textContent).not.toContain('0.6px');
    });

    it('token com unidade mostra a unidade declarada', () => {
        const { container } = withProvider(
            <DynamicTokenControl token={tokenById('motionDurationFast')} draft={draftOf({ motionDurationFast: 0.2 })} updateDraft={vi.fn()} />,
        );
        expect(container.textContent).toContain('0.2s');
    });
});

describe('select grava o value da opção', () => {
    it('cardTitleFontWeight: a opção escolhida chega ao rascunho como valor que a validação aceita', () => {
        const updateDraft = vi.fn();
        withProvider(<DynamicTokenControl token={tokenById('cardTitleFontWeight')} draft={draftOf({})} updateDraft={updateDraft} />);

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '700' } });
        expect(updateDraft).toHaveBeenCalledWith('cardTitleFontWeight', '700');

        const validated = validateDesign({ cardTitleFontWeight: updateDraft.mock.calls[0][1] }) as unknown as Record<string, unknown>;
        expect(validated.cardTitleFontWeight).toBe('700');
    });

    it('toda opção de todo select do schema grava um valor que a validação mantém', () => {
        const dropped: string[] = [];
        for (const token of sarakGetAllDesignTokens()) {
            if (token.type !== 'select') continue;
            for (const option of token.constraints?.options ?? token.options ?? []) {
                const written = option.value ?? option.id;
                if (written === undefined) continue;
                const kept = (validateDesign({ [token.id]: written }) as unknown as Record<string, unknown>)[token.id];
                if (kept !== written) dropped.push(`${token.id}=${written}`);
            }
        }
        expect(dropped).toEqual([]);
    });
});

describe('todo tipo do schema tem controle', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('sombra e curva (text) viram campo de texto e gravam texto', () => {
        const updateDraft = vi.fn();
        withProvider(<DynamicTokenControl token={tokenById('cardShadow')} draft={draftOf({})} updateDraft={updateDraft} />);

        expect(screen.queryByText(/Tipo não suportado/)).toBeNull();
        fireEvent.change(screen.getByRole('textbox'), { target: { value: '0 4px 12px rgba(0,0,0,0.3)' } });
        vi.advanceTimersByTime(150);
        expect(updateDraft).toHaveBeenCalledWith('cardShadow', '0 4px 12px rgba(0,0,0,0.3)');
    });

    it('imagem vira o seletor de arquivo, e remover grava vazio', () => {
        const updateDraft = vi.fn();
        const token = tokenById('globalBackgroundImageUrl');
        const { container } = withProvider(
            <DynamicTokenControl token={token} draft={draftOf({ globalBackgroundImageUrl: 'https://exemplo.test/fundo.png' })} updateDraft={updateDraft} />,
        );

        expect(screen.queryByText(/Tipo não suportado/)).toBeNull();
        expect(container.querySelector('input[type="file"]')).not.toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Remover' }));
        expect(updateDraft).toHaveBeenCalledWith('globalBackgroundImageUrl', '');
    });

    it('a aba de tema (TokenControl) também tem entrada para cada tipo do schema', () => {
        const types = new Set(sarakGetAllDesignTokens().map((token) => token.type));
        for (const type of types) {
            const token = { ...tokenById(sarakGetAllDesignTokens().find((candidate) => candidate.type === type)!.id) };
            const { container, unmount } = withProvider(<TokenControl token={token} value={token.defaultValue} onChange={vi.fn()} />);
            expect(container.innerHTML, `tipo ${type}`).not.toBe('');
            unmount();
        }
    });
});

describe('cor do painel', () => {
    it('o seletor preserva o alfa que a cor já tinha', () => {
        const onChange = vi.fn();
        const { container } = render(<ColorControl label="Fundo" value="rgba(255, 0, 0, 0.5)" onChange={onChange} />);
        const picker = container.querySelector('input[type="color"]') as HTMLInputElement;

        fireEvent.change(picker, { target: { value: '#00ff00' } });
        expect(onChange).toHaveBeenCalledWith('rgba(0, 255, 0, 0.5)');
    });

    it('cor opaca segue em hex', () => {
        const onChange = vi.fn();
        const { container } = render(<ColorControl label="Fundo" value="#112233" onChange={onChange} />);
        fireEvent.change(container.querySelector('input[type="color"]') as HTMLInputElement, { target: { value: '#00ff00' } });
        expect(onChange).toHaveBeenCalledWith('#00ff00');
    });

    it('o controle de opacidade muda só o alfa e mantém o canal', () => {
        const onChange = vi.fn();
        render(<ColorControl label="Fundo" value="#336699" onChange={onChange} />);
        fireEvent.change(screen.getByLabelText('Opacidade de Fundo'), { target: { value: '25' } });
        expect(onChange).toHaveBeenCalledWith('rgba(51, 102, 153, 0.25)');
    });

    it('aceita var() e color-mix() digitados; só grava o que a validação do tema aceita', () => {
        const onChange = vi.fn();
        render(<ColorControl label="Fundo" value="#112233" onChange={onChange} />);
        const field = screen.getByLabelText('Cor de Fundo');

        fireEvent.change(field, { target: { value: 'var(--sarak-primary-color, #00f2ff)' } });
        fireEvent.blur(field);
        expect(onChange).toHaveBeenLastCalledWith('var(--sarak-primary-color, #00f2ff)');

        fireEvent.change(field, { target: { value: 'color-mix(in srgb, var(--sarak-primary-color, #00f2ff) 40%, transparent)' } });
        fireEvent.blur(field);
        expect(onChange).toHaveBeenLastCalledWith('color-mix(in srgb, var(--sarak-primary-color, #00f2ff) 40%, transparent)');

        onChange.mockClear();
        fireEvent.change(field, { target: { value: 'url(javascript:alert(1))' } });
        fireEvent.blur(field);
        expect(onChange).not.toHaveBeenCalled();
        expect(field).toHaveAttribute('aria-invalid', 'true');
    });

    it('renderizar um var() não o troca por branco (nada é gravado sem ação)', () => {
        const onChange = vi.fn();
        render(<ColorControl label="Fundo" value="var(--sarak-primary-color, #00f2ff)" onChange={onChange} />);
        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByLabelText('Cor de Fundo')).toHaveValue('var(--sarak-primary-color, #00f2ff)');
    });
});
