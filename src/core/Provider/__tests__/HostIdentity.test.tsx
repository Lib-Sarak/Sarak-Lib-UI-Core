/**
 * Soberania de identidade do host (Spec 47) — gate anti-regressão.
 *
 * Princípio: a identidade da página (nome da aba, favicon, marca) é SEMPRE do
 * importador. A lib só escreve `document.title`/favicon quando o consumidor
 * FORNECE o valor; sem valor, o que o `index.html` do host definiu sobrevive.
 *
 * O defeito que originou esta spec: `DEFAULT_BRANDING.tabName = 'Sarak OS'` era
 * sempre truthy, então o guard `if (branding?.tabName)` nunca segurava e a aba
 * do consumidor piscava do título dele para a marca da LIB ao montar o Provider.
 *
 * Estes testes exercitam o Provider REAL (não o hook isolado): é o caminho que o
 * dono valida no browser.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import SarakUIProvider from '../SarakUIProvider';

/** O que o `index.html` do importador definiu. Nada da lib pode sobrescrever isto. */
const HOST_TITLE = 'ERP Earendel — Propostas';
const HOST_FAVICON = '/favicon-do-host.ico';

const faviconLink = (): HTMLLinkElement | null =>
    document.querySelector("link[rel~='icon']");

beforeEach(() => {
    document.title = HOST_TITLE;

    document.querySelectorAll("link[rel~='icon']").forEach((el) => el.remove());
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = HOST_FAVICON;
    document.head.appendChild(link);
});

describe('Identidade do host — zero-config NÃO é tocada', () => {
    it('sem nenhuma config, o Provider preserva o `<title>` do host', () => {
        render(
            <SarakUIProvider>
                <div>app do consumidor</div>
            </SarakUIProvider>,
        );

        expect(document.title).toBe(HOST_TITLE);
    });

    it('sem nenhuma config, o Provider preserva o favicon do host', () => {
        render(
            <SarakUIProvider>
                <div>app do consumidor</div>
            </SarakUIProvider>,
        );

        expect(faviconLink()?.getAttribute('href')).toBe(HOST_FAVICON);
    });

    it('com design (tema/cor) mas SEM identidade, o título segue do host', () => {
        render(
            <SarakUIProvider config={{ mode: 'light', primaryColor: '#ff0000' }}>
                <div>app do consumidor</div>
            </SarakUIProvider>,
        );

        expect(document.title).toBe(HOST_TITLE);
    });

    it('nenhum default de branding carrega a marca da lib', () => {
        // Regressão direta do `DEFAULT_BRANDING = { companyName: 'Sarak OS', ... }`:
        // `companyName` alimenta `useSarakUI().systemName`, que o cromo (Sidebar/
        // Topbar) exibe como rótulo da marca. O default não pode ser a marca da lib.
        render(
            <SarakUIProvider>
                <div>app do consumidor</div>
            </SarakUIProvider>,
        );

        expect(document.title).not.toContain('Sarak');
        expect(document.body.textContent ?? '').not.toContain('Sarak OS');
    });
});

describe('Identidade do host — opt-in do consumidor funciona', () => {
    it('`branding.initial.tabName` define o título da aba', () => {
        render(
            <SarakUIProvider options={{ branding: { initial: { tabName: 'Minha Empresa' } } }}>
                <div>app</div>
            </SarakUIProvider>,
        );

        expect(document.title).toBe('Minha Empresa');
    });

    it('`config.systemName` também define o título (2ª porta)', () => {
        render(
            <SarakUIProvider config={{ systemName: 'Sistema do Cliente' }}>
                <div>app</div>
            </SarakUIProvider>,
        );

        expect(document.title).toBe('Sistema do Cliente');
    });

    it('`branding.initial.logoBase64` troca o favicon', () => {
        const LOGO = 'data:image/png;base64,iVBORw0KGgo=';
        render(
            <SarakUIProvider options={{ branding: { initial: { logoBase64: LOGO } } }}>
                <div>app</div>
            </SarakUIProvider>,
        );

        expect(faviconLink()?.getAttribute('href')).toBe(LOGO);
    });
});

describe('Fonte ÚNICA do `document.title` (precedência determinística)', () => {
    it('`tabName` vence `systemName` quando ambos são fornecidos', () => {
        // Antes da Spec 47 havia DOIS efeitos escrevendo `document.title` (este hook
        // e o `DesignInjector`), sem ordem garantida — o resultado dependia da ordem
        // de execução dos effects. Agora a precedência é resolvida num só lugar.
        render(
            <SarakUIProvider
                config={{ systemName: 'Nome do Sistema' }}
                options={{ branding: { initial: { tabName: 'Nome da Aba' } } }}
            >
                <div>app</div>
            </SarakUIProvider>,
        );

        expect(document.title).toBe('Nome da Aba');
    });

    it('a precedência é estável — o título não regride para o perdedor', () => {
        const { rerender } = render(
            <SarakUIProvider
                config={{ systemName: 'Nome do Sistema' }}
                options={{ branding: { initial: { tabName: 'Nome da Aba' } } }}
            >
                <div>app</div>
            </SarakUIProvider>,
        );

        rerender(
            <SarakUIProvider
                config={{ systemName: 'Nome do Sistema' }}
                options={{ branding: { initial: { tabName: 'Nome da Aba' } } }}
            >
                <div>app re-renderizado</div>
            </SarakUIProvider>,
        );

        expect(document.title).toBe('Nome da Aba');
    });
});

describe('Modo Embarcado — segue intocado (Spec 24, sem regressão)', () => {
    it('não escreve o título nem com identidade fornecida', () => {
        render(
            <SarakUIProvider
                config={{ systemName: 'Sistema da Ilha' }}
                options={{ mode: 'embedded', branding: { initial: { tabName: 'Aba da Ilha' } } }}
            >
                <div>ilha</div>
            </SarakUIProvider>,
        );

        expect(document.title).toBe(HOST_TITLE);
    });

    it('não troca o favicon nem com `logoBase64` fornecido', () => {
        render(
            <SarakUIProvider
                options={{
                    mode: 'embedded',
                    branding: { initial: { logoBase64: 'data:image/png;base64,iVBORw0KGgo=' } },
                }}
            >
                <div>ilha</div>
            </SarakUIProvider>,
        );

        expect(faviconLink()?.getAttribute('href')).toBe(HOST_FAVICON);
    });
});
