import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SarakUIProvider from '../../../core/Provider/SarakUIProvider';
import type { SarakUIContextType } from '../../../core/Provider/types';
import type { SarakDesignToken } from '../../../core/Design/types';
import { SARAK_THEME_PRESET_IDS } from '../../../core/Design/presets/themes';
import { resolvePresetText } from '../../../core/i18n/presetTexts';
import { SarakActionCard } from '../../../components/atomic/Cards/SarakActionCard';
import { ThemeAdvancedMenu } from '../Main/components/ThemeAdvancedMenu';
import { TokenControl } from '../Main/components/TokenControl';
import { ButtonsCatalog } from '../Canvas/components/ButtonsCatalog';
import { AtmosphereCatalog } from '../Canvas/components/AtmosphereCatalog';
import { PreviewToolbar } from '../Canvas/components/PreviewToolbar';
import { MoreScreensMock } from '../Canvas/Mocks/MoreScreensMock';
import { LiveDraftPreviewFrame } from '../Canvas/components/LiveDraftPreviewFrame';
import { PreviewSystemRenderer } from '../Canvas/components/PreviewSystemRenderer';
import { TemplatesTab } from '../Main/TemplatesTab';
import { ColorControl } from '../components/controls/ColorControl';

/**
 * Com o painel em inglês ou alemão, nenhum texto que a lib mostra pode sair em português: o teste renderiza cada superfície que
 * tinha literal fora do catálogo e procura o texto em português no que o usuário lê (conteúdo, `title` e `aria-label`).
 */
const PORTUGUESE_LITERALS = [
    'Avançado', 'Telas avançadas', 'Voltar ao modo normal', 'Tabela de tokens', 'Busca por pilar', 'Temas e JSON', 'Executar',
    'Modo de Inspeção', 'Meu sistema', 'Administradora', 'Novo pedido recebido', 'Relatório mensal', 'Convite aceito', 'Há 5 minutos',
    'Mais telas', 'Escolha outra tela', 'Curados', 'Por Estilo', 'Opacidade', 'Só no Tablet', 'Só no Mobile', 'Este valor vale só',
    'Dispositivo do preview', 'Integração Host', 'Tema customizado', 'Escolher tema', 'Carregando', 'Cor de ', 'Seletor de ', 'Formulário', 'Tipografia', 'Configurações', 'Registros', 'Todos os componentes', 'Painel', 'Gráficos',
];

const inLanguage = (language: string, ui: React.ReactElement) =>
    render(<SarakUIProvider options={{ fonts: 'none', i18n: { languages: [language], language } }}>{ui}</SarakUIProvider>);

/** Tudo que o usuário lê: o texto, o `title` e o `aria-label` de cada elemento (as opções de um seletor entram no texto). */
const readable = (root: HTMLElement): string => [
    root.textContent ?? '',
    ...[...root.querySelectorAll('[title],[aria-label]')].flatMap((element) => [element.getAttribute('title') ?? '', element.getAttribute('aria-label') ?? '']),
].join(' | ');

const expectNoPortuguese = (root: HTMLElement): void => {
    const text = readable(root);
    expect(PORTUGUESE_LITERALS.filter((literal) => text.includes(literal))).toEqual([]);
};

const noop = (): void => undefined;
const responsiveToken = { type: 'text', label: 'Resp', isResponsive: true } as unknown as SarakDesignToken;
const apps = { dashboard: <div>x</div>, forms: <div>x</div>, tabela: <div>x</div>, 'more-screens': <div>x</div> };

describe.each(['en', 'de'] as const)('superfícies com literal fora do catálogo — painel em %s', (language) => {
    afterEach(cleanup);

    it('menu Avançado: botão, menu e itens', () => {
        const view = inLanguage(language, <ThemeAdvancedMenu viewMode="preview" setViewMode={noop} onOpenAdvancedTokens={noop} />);
        fireEvent.click(view.container.querySelector('button[aria-haspopup="menu"]') as HTMLElement);
        expect(view.container.querySelectorAll('[role="menuitem"]')).toHaveLength(5);
        expectNoPortuguese(view.container);
    });

    it('botão de ação do card, o selo e a dica de dispositivo, o botão de inspeção e a opacidade da cor', () => {
        const card = inLanguage(language, <SarakActionCard item={{ name: 'x' }} />);
        expectNoPortuguese(card.container);
        const badge = inLanguage(language, <TokenControl token={responsiveToken} value={{ desk: 'a', tab: 'b', mob: 'c' }} onChange={noop} previewDevice="tablet" />);
        expectNoPortuguese(badge.container);
        const frame = inLanguage(language, (
            <LiveDraftPreviewFrame previewDevice="desktop" targetWidth="100%" deviceAspectRatio={undefined} getDeviceFrameStyles={() => ''} isInspecting={false} setIsInspecting={noop}><div /></LiveDraftPreviewFrame>
        ));
        expectNoPortuguese(frame.container);
        const color = inLanguage(language, <ColorControl label="Cor" value="rgba(0,0,0,0.5)" onChange={noop} />);
        expectNoPortuguese(color.container);
    });

    it('a aba de templates e a cor, inclusive o nome acessível', () => {
        const templates = inLanguage(language, <TemplatesTab onApplyFullTheme={noop} />);
        expectNoPortuguese(templates.container);
        const color = inLanguage(language, <ColorControl label="Primary" value="rgba(0,0,0,0.5)" onChange={noop} />);
        expectNoPortuguese(color.container);
        expect(color.container.querySelector('input[type="color"]')?.getAttribute('aria-label')).toMatch(/Primary/);
    });

    it.each([
        ['aba Botões dos catálogos', () => <ButtonsCatalog onApplyPreset={noop} currentMode="dark" />],
        ['opacidade da atmosfera', () => <AtmosphereCatalog onApplyPreset={noop} currentMode="dark" />],
        ['barra do preview', () => <PreviewToolbar previewDevice="desktop" setPreviewDevice={noop} mode="dark" onModeChange={noop} activePreviewApp="dashboard" selectPreviewApp={noop} />],
        ['"mais telas" do preview', () => <MoreScreensMock selectPreviewApp={noop} />],
    ])('%s', (_nome, render) => {
        expectNoPortuguese(inLanguage(language, render()).container);
    });

    it('a prévia do sistema: marca, cargo, telas e "mais telas"', () => {
        const view = inLanguage(language, (
            <PreviewSystemRenderer sarak={{} as SarakUIContextType} tokens={{}} previewDevice="desktop" activePreviewApp="dashboard" selectPreviewApp={vi.fn()} apps={apps} />
        ));
        expectNoPortuguese(view.container);
    });

    it('a descrição de cada tema da galeria sai traduzida', () => {
        const portuguese = 'Descrição em português.';
        const untranslated = SARAK_THEME_PRESET_IDS.filter((id) => resolvePresetText({ id, name: id, description: portuguese }, language).description === portuguese);
        expect(untranslated).toEqual([]);
    });
});
