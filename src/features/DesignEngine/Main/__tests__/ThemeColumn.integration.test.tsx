import React from 'react';
import { render, screen, within, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SarakUIProvider from '../../../../core/Provider/SarakUIProvider';
import { ThemeCustomizationTab } from '../ThemeCustomizationTab';

// A prévia grande custa um app inteiro: o que importa aqui é a COLUNA e o que ela entrega à prévia.
vi.mock('../../Canvas/PreviewCanvas', () => ({
    PreviewCanvas: ({ config, draftTokens }: { config: { systemName?: string }; draftTokens: { logoUrl?: string; colorPalette?: string } }) => (
        <div data-testid="preview-canvas" data-system-name={config.systemName ?? ''} data-logo={draftTokens.logoUrl ?? ''} data-palette={draftTokens.colorPalette ?? ''} />
    ),
}));

vi.setConfig({ testTimeout: 60000 });

interface HarnessOptions {
    onBrandingChange?: (branding: unknown) => void;
}

const renderPanel = ({ onBrandingChange = vi.fn() }: HarnessOptions = {}) => {
    const user = userEvent.setup();
    render(
        <SarakUIProvider
            initialTheme="sarak-sovereign"
            options={{ fonts: 'none', branding: { initial: { loginName: 'Acme', logoBase64: null }, onChange: onBrandingChange } }}
        >
            <div style={{ width: 1200, height: 800 }}>
                <ThemeCustomizationTab />
            </div>
        </SarakUIProvider>,
    );
    return { user, onBrandingChange };
};

const tabUntil = async (user: ReturnType<typeof userEvent.setup>, isTarget: () => boolean, max = 120): Promise<void> => {
    for (let step = 0; step < max && !isTarget(); step += 1) await user.tab();
    expect(isTarget()).toBe(true);
};

const focusedRow = (id: string) => () => (document.activeElement as HTMLElement | null)?.getAttribute('data-decision-row') === id;
const focusedName = (name: RegExp) => () => name.test((document.activeElement as HTMLElement | null)?.getAttribute('aria-label') ?? (document.activeElement as HTMLElement | null)?.textContent ?? '');

describe('coluna de decisões — só pelo teclado, do início ao "Aplicar"', () => {
    it('entra numa decisão com o foco no título, escolhe uma opção, volta com Esc ao foco na linha e aplica', async () => {
        const { user } = renderPanel();
        await screen.findByRole('button', { name: /Fontes/ });

        await tabUntil(user, focusedRow('fonts'));
        await user.keyboard('{Enter}');

        const heading = await screen.findByRole('heading', { level: 2, name: 'Fontes' });
        expect(heading).toHaveFocus();
        expect(screen.getByRole('button', { name: 'Voltar para a lista de decisões' })).toBeInTheDocument();
        expect(screen.getByTestId('preview-canvas')).toBeInTheDocument();

        const apply = screen.getByRole('button', { name: 'Aplicar' });
        expect(apply).toBeDisabled();
        await tabUntil(user, () => (document.activeElement as HTMLElement | null)?.closest('[data-option-group="fonts"]') !== null && document.activeElement?.tagName === 'BUTTON');
        await user.keyboard('{Enter}');
        await waitFor(() => expect(apply).toBeEnabled());

        await user.keyboard('{Escape}');
        await waitFor(() => expect(screen.queryByRole('heading', { level: 2, name: 'Fontes' })).toBeNull());
        await waitFor(() => expect(screen.getByRole('button', { name: /Fontes/ })).toHaveFocus());
        expect(screen.getByRole('button', { name: /Fontes/ }).querySelector('[aria-label="Alterada"]')).not.toBeNull();

        await tabUntil(user, () => document.activeElement === apply);
        await user.keyboard('{Enter}');
        await waitFor(() => expect(apply).toBeDisabled());
    });

    it('o botão Voltar também leva de volta à lista, com o foco na linha da decisão', async () => {
        const { user } = renderPanel();

        await user.click(await screen.findByRole('button', { name: /Cores/ }));
        await user.click(await screen.findByRole('button', { name: 'Voltar para a lista de decisões' }));

        await waitFor(() => expect(screen.getByRole('button', { name: /Cores/ })).toHaveFocus());
    });

    it('não há seletor de modo nem galeria sobre a prévia, em nenhuma tela da coluna', async () => {
        const { user } = renderPanel();
        await screen.findByRole('button', { name: /Forma/ });
        expect(screen.queryByRole('radiogroup', { name: 'Modo de edição' })).toBeNull();

        await user.click(screen.getByRole('button', { name: /Forma/ }));
        await screen.findByRole('heading', { level: 2, name: 'Forma' });

        expect(screen.queryByRole('heading', { name: 'Galeria de estilos' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Abrir galeria' })).toBeNull();
        expect(screen.getByTestId('preview-canvas')).toBeInTheDocument();
    });
});

describe('coluna de decisões — ajuste fino em níveis', () => {
    it('nasce recolhido com a contagem real; abre nos principais e só então mostra todos', async () => {
        const { user } = renderPanel();
        await user.click(await screen.findByRole('button', { name: /Forma/ }));
        const toggle = await screen.findByRole('button', { name: /Ajuste fino/ });

        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        const total = Number(/(\d+) ajustes/.exec(toggle.textContent ?? '')?.[1]);
        expect(total).toBeGreaterThan(0);
        expect(document.querySelectorAll('[data-decision-section] [data-token-row]')).toHaveLength(0);

        await user.click(toggle);
        const essentialRows = document.querySelectorAll('[data-testid="fine-tuning"] [data-token-row]').length;
        expect(essentialRows).toBeGreaterThan(0);
        expect(essentialRows).toBeLessThan(total);

        await user.click(screen.getByRole('button', { name: `Mostrar todos os ${total} ajustes` }));
        expect(document.querySelectorAll('[data-testid="fine-tuning"] [data-token-row]')).toHaveLength(total);
        expect(screen.getByRole('button', { name: 'Mostrar só os principais' })).toBeInTheDocument();
    });
});

describe('coluna de decisões — a busca leva ao token', () => {
    it('abrir o resultado abre a decisão certa, com o ajuste fino aberto e o token visível e em foco', async () => {
        const { user } = renderPanel();
        await screen.findByRole('button', { name: /Fontes/ });

        await user.type(screen.getByPlaceholderText('Buscar token...'), 'Quina Superior Esquerda');
        const result = await screen.findByRole('button', { name: /Abrir Quina Superior Esquerda do Card em Forma/ });
        await user.click(result);

        await screen.findByRole('heading', { level: 2, name: 'Forma' });
        const row = await waitFor(() => {
            const found = document.querySelector<HTMLElement>('[data-token-row="cardRadiusTL"]');
            expect(found).not.toBeNull();
            return found as HTMLElement;
        });
        expect(row).toBeVisible();
        await waitFor(() => expect(row).toHaveFocus());
        expect(screen.getByRole('button', { name: /Ajuste fino/ })).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('button', { name: 'Mostrar só os principais' })).toBeInTheDocument();
    });
});

describe('coluna de decisões — "Usar minha marca"', () => {
    it('do formulário à prévia com nome, cor e fonte; nada é gravado até o "Aplicar"', async () => {
        const { user, onBrandingChange } = renderPanel();
        await user.click(await screen.findByRole('button', { name: /Usar minha marca/ }));

        const form = await screen.findByTestId('brand-shortcut');
        expect(screen.getByRole('heading', { level: 2, name: 'Usar minha marca' })).toHaveFocus();
        const name = within(form).getByLabelText('Nome da empresa');
        expect(name).toHaveValue('');
        await user.type(name, 'Acme Ltda');
        await waitFor(() => expect(screen.getByTestId('preview-canvas')).toHaveAttribute('data-palette', expect.any(String)));

        await user.click(within(form).getByRole('button', { name: 'Gerar meu tema' }));

        await screen.findByRole('button', { name: /Usar minha marca/ });
        await waitFor(() => expect(screen.getByTestId('preview-canvas')).toHaveAttribute('data-system-name', 'Acme Ltda'));
        expect(screen.getByTestId('preview-canvas').getAttribute('data-palette')).toMatch(/^custom:analogous:#/);
        expect(screen.getByRole('button', { name: /Cores/ })).toHaveTextContent('Paleta criada');
        expect(onBrandingChange).not.toHaveBeenCalled();

        const apply = screen.getByRole('button', { name: 'Aplicar' });
        expect(apply).toBeEnabled();
        await act(async () => { await user.click(apply); });

        await waitFor(() => expect(onBrandingChange).toHaveBeenCalledWith(expect.objectContaining({ companyName: 'Acme Ltda' })));
    });

    it('descartar esquece a marca pendente: a prévia volta ao nome do host', async () => {
        const { user, onBrandingChange } = renderPanel();
        await user.click(await screen.findByRole('button', { name: /Usar minha marca/ }));
        const form = await screen.findByTestId('brand-shortcut');
        await user.type(within(form).getByLabelText('Nome da empresa'), 'Acme Ltda');
        await user.click(within(form).getByRole('button', { name: 'Gerar meu tema' }));
        await waitFor(() => expect(screen.getByTestId('preview-canvas')).toHaveAttribute('data-system-name', 'Acme Ltda'));

        await user.click(screen.getByRole('button', { name: 'Descartar' }));

        await waitFor(() => expect(screen.getByTestId('preview-canvas')).toHaveAttribute('data-system-name', ''));
        expect(onBrandingChange).not.toHaveBeenCalled();
    });
});

describe('coluna de decisões — Avançado', () => {
    it('"Outros ajustes" abre o pilar Avançado na própria coluna, com os tokens que a lista não traz', async () => {
        const { user } = renderPanel();
        await user.click(await screen.findByRole('button', { name: /Avançado/ }));

        await user.click(screen.getByRole('menuitem', { name: 'Outros ajustes' }));

        await screen.findByRole('heading', { level: 2, name: 'Outros ajustes' });
        expect(screen.getByRole('button', { name: /Ajuste fino/ })).toBeInTheDocument();
    });
});

// Evita o aviso de variável sem uso quando o helper só serve a um teste.
void focusedName;
