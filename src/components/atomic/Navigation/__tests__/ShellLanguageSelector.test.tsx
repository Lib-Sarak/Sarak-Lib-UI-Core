import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ShellLanguageSelector } from '../ShellLanguageSelector';
import '@testing-library/jest-dom';
import { SarakUIProvider, useSarakUI } from '../../../../core/Provider/SarakUIProvider';

const TWO_LANGUAGES = { enabledLanguages: ['pt', 'en'] };

const renderWithProvider = (ui: React.ReactElement, config: Record<string, unknown> = TWO_LANGUAGES) =>
    render(<SarakUIProvider config={config}>{ui}</SarakUIProvider>);

beforeEach(() => {
    localStorage.clear();
});

afterEach(() => {
    delete (window as Window & { __SARAK_OVERRIDES__?: unknown }).__SARAK_OVERRIDES__;
});

describe('ShellLanguageSelector', () => {
    it('renderiza com variante horizontal, listando os idiomas habilitados no tema', () => {
        renderWithProvider(<ShellLanguageSelector variant="horizontal" />);
        expect(screen.getByText('pt')).toBeInTheDocument();
    });

    it('abre e fecha o dropdown ao clicar no seletor horizontal', () => {
        renderWithProvider(<ShellLanguageSelector variant="horizontal" />);
        const button = screen.getByRole('button');

        fireEvent.click(button);
        expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('com um idioma habilitado, não monta', () => {
        renderWithProvider(<ShellLanguageSelector variant="horizontal" />, { enabledLanguages: ['pt'] });
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('sem nenhum idioma habilitado, não monta', () => {
        renderWithProvider(<ShellLanguageSelector variant="horizontal" />, {});
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('escolher um idioma grava a PREFERÊNCIA do usuário, e não o tema', () => {
        const Probe = () => {
            const { preferences, systemDesign } = useSarakUI();
            return (
                <>
                    <span data-testid="pref-language">{String(preferences.language)}</span>
                    <span data-testid="theme-enabled">{String(systemDesign?.enabledLanguages)}</span>
                </>
            );
        };

        renderWithProvider(
            <>
                <ShellLanguageSelector variant="horizontal" />
                <Probe />
            </>,
        );

        fireEvent.click(screen.getByRole('button'));
        fireEvent.click(screen.getByText('English'));

        expect(screen.getByTestId('pref-language')).toHaveTextContent('en');
        // o tema (o dado que o painel edita) continua exatamente como configurado — só
        // ganhou a preferência sobreposta, nunca uma gravação nele.
        expect(screen.getByTestId('theme-enabled')).toHaveTextContent('pt,en');
    });

    it('o host lê a troca pelo idioma EFETIVO (`design.language` via `useSarakUI`), sem polling — reage ao re-render', () => {
        // NÃO pela preferência crua (`preferences.language`): o valor que vale é o que a
        // sobreposição produz — o mesmo que o próprio seletor usa para decidir o realce.
        const Consumer = () => {
            const { design } = useSarakUI();
            return <span data-testid="host-language">{design.language ?? 'default-do-host'}</span>;
        };

        renderWithProvider(
            <>
                <ShellLanguageSelector variant="horizontal" />
                <Consumer />
            </>,
            { ...TWO_LANGUAGES, preferenceLanguagePosition: 'menu' },
        );

        expect(screen.getByTestId('host-language')).toHaveTextContent('default-do-host');

        fireEvent.click(screen.getByRole('button'));
        fireEvent.click(screen.getByText('English'));

        expect(screen.getByTestId('host-language')).toHaveTextContent('en');
    });

    it('idioma NÃO OFERECIDO (padrão de fábrica): escolher no seletor não muda o idioma efetivo que o host lê', () => {
        // Sem o administrador oferecer a preferência, ela é gravada (existe para quando for
        // oferecida) mas IGNORADA ao montar o design efetivo — ler a crua misturaria dois
        // idiomas na mesma tela.
        const Consumer = () => {
            const { design } = useSarakUI();
            return <span data-testid="host-language">{design.language ?? 'sem-idioma-no-tema'}</span>;
        };

        renderWithProvider(
            <>
                <ShellLanguageSelector variant="horizontal" />
                <Consumer />
            </>,
            { ...TWO_LANGUAGES, language: 'pt' }, // preferenceLanguagePosition ausente → 'off', o padrão de fábrica
        );

        fireEvent.click(screen.getByRole('button'));
        fireEvent.click(screen.getByText('English'));

        expect(screen.getByTestId('host-language')).toHaveTextContent('pt'); // o idioma do TEMA, não 'en'
    });

    it('a preferência salva para um idioma que o administrador DESABILITOU depois deixa de valer', () => {
        // O seletor escolhe 'en' enquanto o tema o habilita; o administrador tira 'en' de
        // `enabledLanguages`; o idioma EFETIVO tem de voltar ao do tema —
        // `overlayPreferences` é quem recusa, não o seletor.
        const Consumer = () => {
            const { design, applyConfigRaw } = useSarakUI();
            return (
                <>
                    <span data-testid="host-language">{design.language}</span>
                    <button data-testid="admin-disable-en" onClick={() => applyConfigRaw({ enabledLanguages: ['pt'] })}>
                        desabilitar en
                    </button>
                </>
            );
        };

        renderWithProvider(
            <>
                <ShellLanguageSelector variant="horizontal" />
                <Consumer />
            </>,
            { ...TWO_LANGUAGES, language: 'pt', preferenceLanguagePosition: 'menu' },
        );

        // Dois botões na tela (o toggle do seletor e o do admin) — mira o do seletor pela ordem.
        fireEvent.click(screen.getAllByRole('button')[0]);
        fireEvent.click(screen.getByText('English'));
        expect(screen.getByTestId('host-language')).toHaveTextContent('en');

        fireEvent.click(screen.getByTestId('admin-disable-en'));
        expect(screen.getByTestId('host-language')).toHaveTextContent('pt');
    });

    it('o caminho de substituição do seletor pelo host continua funcionando', () => {
        const Override: React.FC<{ variant?: string }> = ({ variant }) => (
            <div data-testid="override-lang">override-{variant}</div>
        );
        (window as Window & { __SARAK_OVERRIDES__?: Record<string, React.ComponentType<{ variant?: string }>> })
            .__SARAK_OVERRIDES__ = { 'shell-language-selector': Override };

        // Mesmo sem idiomas habilitados no tema, o override monta — ele não depende
        // da regra de "um idioma só não monta", que é desta biblioteca, não dele.
        renderWithProvider(<ShellLanguageSelector variant="horizontal" />, {});

        expect(screen.getByTestId('override-lang')).toHaveTextContent('override-horizontal');
    });
});
