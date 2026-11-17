import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import type { SarakUIContextType } from '../../../../../core/Provider/types';
import {
    arePreviewPropsEqual,
    PREVIEW_DESKTOP_SYSTEM_WIDTH,
    PreviewSystemRenderer,
    type PreviewSystemRendererProps,
} from '../PreviewSystemRenderer';

const apps = {
    dashboard: <div>Painel preview</div>,
    forms: <div>Form preview</div>,
    tabela: <div>Tabela preview</div>,
    'caixas-texto': <div>Texto preview</div>,
    graficos: <div>Gráficos preview</div>,
    typography: <div>Tipografia preview</div>,
    components: <div>Componentes preview</div>,
    auth: <div>Entrar preview</div>,
    chat: <div>Chat preview</div>,
    logs: <div>Registros preview</div>,
    settings: <div>Configurações preview</div>,
    documentos: <div>Documentos preview</div>,
    matrix: <div>Matriz preview</div>,
    'kitchen-sink': <div>Todos os componentes preview</div>,
    'more-screens': <div>Mais telas preview</div>,
};

const makePreviewProps = (
    overrides: Partial<PreviewSystemRendererProps> = {},
): PreviewSystemRendererProps => ({
    sarak: {} as SarakUIContextType,
    tokens: {},
    previewDevice: 'desktop',
    activePreviewApp: 'dashboard',
    selectPreviewApp: () => undefined,
    apps,
    ...overrides,
});

const renderPreview = (
    previewDevice: PreviewSystemRendererProps['previewDevice'],
    overrides: Partial<PreviewSystemRendererProps> = {},
) => {
    const selectPreviewApp = vi.fn();
    const result = render(
        <SarakUIProvider>
            <PreviewSystemRenderer
                {...makePreviewProps({ ...overrides, previewDevice, selectPreviewApp })}
            />
        </SarakUIProvider>,
    );

    return { ...result, selectPreviewApp };
};

let resizeObserverCallback: ResizeObserverCallback | undefined;

class ResizeObserverStub implements ResizeObserver {
    constructor(callback: ResizeObserverCallback) {
        resizeObserverCallback = callback;
    }

    observe(_target: Element): void {}
    unobserve(_target: Element): void {}
    disconnect(): void {}
}

const fireObservedWidth = (width: number): void => {
    act(() => {
        resizeObserverCallback?.(
            [{ contentRect: { width } } as ResizeObserverEntry],
            {} as ResizeObserver,
        );
    });
};

afterEach(() => {
    resizeObserverCallback = undefined;
    vi.unstubAllGlobals();
});

describe('PreviewSystemRenderer', () => {
    it.each(['desktop', 'tablet', 'smartphone'] as const)(
        'monta SarakAppChrome na geometria %s com navegação de exemplo',
        (device) => {
            const { container } = renderPreview(device);

            expect(container.querySelector('.sarak-device-' + device)).not.toBeNull();
            expect(screen.getByText('Painel preview')).toBeTruthy();
            if (device === 'smartphone') {
                fireEvent.click(screen.getByRole('button', { name: /Abrir menu/ }));
            }
            ['Painel', 'Formulário', 'Tabela', 'Texto', 'Gráficos', 'Tipografia', 'Mais telas'].forEach((label) => {
                expect(screen.getByRole('link', { name: label })).toBeTruthy();
            });
            expect(screen.queryByRole('link', { name: 'Componentes' })).toBeNull();
        },
    );

    it('encaminha a seleção das telas principais e da grade Mais telas', () => {
        const { selectPreviewApp } = renderPreview('desktop');

        fireEvent.click(screen.getByRole('link', { name: 'Gráficos' }));
        expect(selectPreviewApp).toHaveBeenCalledWith('graficos');

        fireEvent.click(screen.getByRole('link', { name: 'Mais telas' }));
        expect(selectPreviewApp).toHaveBeenCalledWith('more-screens');
    });

    it('mantém Mais telas ativo quando uma tela secundária está selecionada', () => {
        renderPreview('desktop', { activePreviewApp: 'auth' });

        expect(screen.getByRole('link', { name: 'Mais telas' })).toHaveAttribute('aria-current', 'page');
        expect(screen.getByRole('link', { name: 'Painel' })).not.toHaveAttribute('aria-current', 'page');
    });
});

describe('PreviewSystemRenderer — navegação do celular (`mobileNavigationStyle` do rascunho)', () => {
    it('com `bottom` no rascunho, o preview em celular mostra a barra na base e o drawer sem a navegação', () => {
        const { container } = renderPreview('smartphone', { tokens: { mobileNavigationStyle: 'bottom' } });

        const bar = container.querySelector('nav[data-sarak-bottom-nav]');
        expect(bar).not.toBeNull();
        expect(bar?.querySelectorAll('a').length).toBeGreaterThan(5);
        fireEvent.click(screen.getByRole('button', { name: /Abrir menu/ }));
        expect(container.querySelector('#sarak-chrome-drawer nav')).toBeNull();
    });

    it('em `auto`, as telas de exemplo passam do teto de 5 itens e a navegação fica na gaveta', () => {
        const { container } = renderPreview('smartphone', { tokens: { mobileNavigationStyle: 'auto' } });

        expect(container.querySelector('nav[data-sarak-bottom-nav]')).toBeNull();
    });

    it('desktop não ganha a barra com `bottom`', () => {
        const { container } = renderPreview('desktop', { tokens: { mobileNavigationStyle: 'bottom' } });

        expect(container.querySelector('nav[data-sarak-bottom-nav]')).toBeNull();
    });
});

describe('PreviewSystemRenderer — usuário e notificações de amostra', () => {
    afterEach(() => vi.unstubAllEnvs());

    it('em produção a barra de exemplo mostra a faixa do usuário e o botão de notificações', () => {
        vi.stubEnv('NODE_ENV', 'production');
        const { container } = renderPreview('desktop');

        const strip = container.querySelector('[data-sarak-user-strip]');
        expect(strip).not.toBeNull();
        expect(strip?.textContent).toContain('Ana Souza');
        expect(container.querySelector('[data-sarak-widget="notifications"]')).not.toBeNull();
        expect(container.textContent).not.toContain('indisponível');
    });

    it('trocar o estilo do avatar no rascunho muda o avatar da faixa', () => {
        vi.stubEnv('NODE_ENV', 'production');
        const initials = renderPreview('desktop', { tokens: { userAvatarStyle: 'initials' } });
        expect(initials.container.querySelector('[data-sarak-avatar-initials]')?.textContent).toBe('AS');
        initials.unmount();

        const icon = renderPreview('desktop', { tokens: { userAvatarStyle: 'icon' } });
        expect(icon.container.querySelector('[data-sarak-avatar-initials]')).toBeNull();
        expect(icon.container.querySelector('[data-sarak-user-strip] svg')).not.toBeNull();
    });
});

describe('PreviewSystemRenderer — escala pela largura real do contêiner', () => {
    it('reduz a escala no contêiner estreito até o piso de 0.2', () => {
        vi.stubGlobal('ResizeObserver', ResizeObserverStub);
        const { container } = renderPreview('desktop');

        fireObservedWidth(320);

        expect(container.querySelector<HTMLElement>('.origin-top-left')?.style.transform).toBe('scale(0.2)');
    });

    it('desenha a janela do sistema (1.920 px) e a reduz para caber: 1.180 px de contêiner dão escala 0,6146', () => {
        vi.stubGlobal('ResizeObserver', ResizeObserverStub);
        const { container } = renderPreview('desktop');

        fireObservedWidth(1180);

        const layer = container.querySelector<HTMLElement>('.origin-top-left');
        expect(Number.parseFloat(layer?.style.transform.replace('scale(', '') ?? '')).toBeCloseTo(1180 / PREVIEW_DESKTOP_SYSTEM_WIDTH, 4);
        expect(PREVIEW_DESKTOP_SYSTEM_WIDTH).toBeGreaterThanOrEqual(1280);
    });

    it('não amplia acima do tamanho real: contêiner mais largo que a janela do sistema fica em escala 1', () => {
        vi.stubGlobal('ResizeObserver', ResizeObserverStub);
        const { container } = renderPreview('desktop');

        fireObservedWidth(2400);

        expect(container.querySelector<HTMLElement>('.origin-top-left')?.style.transform).toBe('scale(1)');
    });

    it.each(['tablet', 'smartphone'] as const)('%s desenha na largura do aparelho, sem reduzir', (device) => {
        vi.stubGlobal('ResizeObserver', ResizeObserverStub);
        const { container } = renderPreview(device);

        fireObservedWidth(320);

        expect(container.querySelector<HTMLElement>('.origin-top-left')?.style.transform).toBe('scale(1)');
    });

    it('usa o fallback sem ResizeObserver', () => {
        vi.stubGlobal('ResizeObserver', undefined);
        const { container } = renderPreview('desktop');

        expect(container.querySelector<HTMLElement>('.origin-top-left')?.style.transform).toBe('scale(0.95)');
    });
});

describe('PreviewSystemRenderer — mídia global', () => {
    it('deixa o fundo transparente quando há mídia global', () => {
        const imageUrl = 'https://example.com/preview-background.png';
        const { container } = renderPreview('desktop', {
            tokens: { globalBackgroundImageUrl: imageUrl },
        });

        expect(container.querySelector('[style*="preview-background.png"]')).not.toBeNull();
        expect(container.querySelector<HTMLElement>('.absolute.inset-0.z-0')?.style.backgroundColor)
            .toBe('transparent');
    });

    it('usa a variável de fundo do tema sem mídia global, e a camada de fundo fica atrás da textura e leva o gradiente', () => {
        const { container } = renderPreview('desktop', { tokens: {} });

        expect(container.querySelector('[style*="preview-background.png"]')).toBeNull();
        const base = container.querySelector<HTMLElement>('.absolute.inset-0.z-0');
        expect(base?.style.backgroundColor).toBe('var(--sarak-bg-base)');
        expect(base?.style.zIndex).toBe('-2');
        expect(base?.style.backgroundImage).toContain('--sarak-bg-gradient-image');
    });
});

describe('arePreviewPropsEqual — comparador do React.memo', () => {
    it('considera iguais props com as mesmas referências', () => {
        const props = makePreviewProps();

        expect(arePreviewPropsEqual(props, { ...props })).toBe(true);
    });

    it('detecta uma nova referência dos tokens', () => {
        const props = makePreviewProps();

        expect(arePreviewPropsEqual(props, { ...props, tokens: { ...props.tokens } })).toBe(false);
    });

    it('detecta uma nova referência da lista de apps', () => {
        const props = makePreviewProps();

        expect(arePreviewPropsEqual(props, { ...props, apps: { ...props.apps } })).toBe(false);
    });

    it('detecta mudança do app ativo e da geometria', () => {
        const props = makePreviewProps();

        expect(arePreviewPropsEqual(props, { ...props, activePreviewApp: 'reports' })).toBe(false);
        expect(arePreviewPropsEqual(props, { ...props, previewDevice: 'tablet' })).toBe(false);
    });
});

describe('PreviewSystemRenderer — nada leva o navegador para fora do painel', () => {
    const graphicsLink = (): HTMLElement => screen.getByRole('link', { name: 'Gráficos' });

    it('a rota de exemplo é âncora interna (#tela), que não existe como rota no sistema de quem importa', () => {
        renderPreview('desktop');
        expect(graphicsLink().getAttribute('href')).toBe('#graficos');
    });

    it('Ctrl+clique, Cmd+clique, botão do meio e menu de contexto no item não abrem nada', () => {
        renderPreview('desktop');
        expect(fireEvent.click(graphicsLink(), { ctrlKey: true })).toBe(false);
        expect(fireEvent.click(graphicsLink(), { metaKey: true })).toBe(false);
        expect(fireEvent(graphicsLink(), new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 }))).toBe(false);
        expect(fireEvent.contextMenu(graphicsLink())).toBe(false);
    });

    it('o clique simples continua trocando a tela da prévia', () => {
        const { selectPreviewApp } = renderPreview('desktop');
        fireEvent.click(graphicsLink());
        expect(selectPreviewApp).toHaveBeenCalledWith('graficos');
    });
});

describe('PreviewSystemRenderer — nome de exemplo e popovers', () => {
    it('o nome de exemplo da barra não é marca da lib', () => {
        const { container } = renderPreview('desktop');
        expect(container.textContent).not.toContain('Sarak Preview');
        expect(container.textContent).toContain('Meu sistema');
    });

    it('o ponto de portal dos popovers do cromo vive dentro da camada reduzida da prévia', () => {
        const { container } = renderPreview('desktop');
        const layer = container.querySelector('.origin-top-left');
        expect(layer?.querySelector('[data-sarak-preview-portal]')).not.toBeNull();
    });
});
