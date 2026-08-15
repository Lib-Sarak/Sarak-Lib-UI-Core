import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SarakGrid } from '../SarakGrid';
import { SarakFlex } from '../SarakFlex';
import { SarakSplitPane } from '../SarakSplitPane';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { DeviceProvider, type DeviceType } from '../../../../core/Provider/DeviceProvider';

// Força o dispositivo ativo (o SarakUIProvider monta um DeviceProvider próprio; o interno
// aninhado sobrescreve o contexto de device, mantendo o resto do Provider intacto).
const renderAt = (device: DeviceType, ui: React.ReactElement) =>
    render(
        <SarakUIProvider>
            <DeviceProvider overrideDevice={device}>{ui}</DeviceProvider>
        </SarakUIProvider>,
    );

describe('SarakGrid — multidispositivo por padrão (Spec 40.3 — L2)', () => {
    it('colapsa um templateColumns fixo para 1 coluna no celular (não estoura)', () => {
        renderAt('smartphone',
            <SarakGrid data-testid="grid" templateColumns="1fr 1fr 1fr"><div>x</div></SarakGrid>,
        );
        expect(screen.getByTestId('grid').style.gridTemplateColumns).toBe('1fr');
    });

    it('mantém o templateColumns fixo cheio no desktop', () => {
        renderAt('desktop',
            <SarakGrid data-testid="grid" templateColumns="1fr 1fr 1fr"><div>x</div></SarakGrid>,
        );
        expect(screen.getByTestId('grid').style.gridTemplateColumns).toBe('1fr 1fr 1fr');
    });

    it('resolve um ResponsiveValue por dispositivo (controle opcional do consumidor)', () => {
        const cols = { mob: '1fr', tab: '1fr 1fr', desk: '1fr 1fr 1fr 1fr' };
        renderAt('tablet',
            <SarakGrid data-testid="grid" templateColumns={cols}><div>x</div></SarakGrid>,
        );
        expect(screen.getByTestId('grid').style.gridTemplateColumns).toBe('1fr 1fr');
    });

    // plan-47: sem `templateColumns` (caminho zero-config, o do defeito relatado), o
    // SarakGrid não tem um ramo de JS que colapsa para 1 coluna no celular — quem
    // resolve isso é o próprio CSS Grid (`auto-fit`/`minmax(280px,1fr)`), em
    // runtime, pela largura do container. Este teste prova só que a CLASSE emitida
    // no zero-config é a MESMA em qualquer dispositivo (não existe um ramo quebrado
    // ou uma classe diferente por device aqui) — NÃO prova que o browser desenha 1
    // coluna a 400px: jsdom não tem motor de layout. Essa prova é a medição real em
    // Chromium, colada no resumo da plan-47.
    it('sem templateColumns (zero-config), emite a MESMA classe content-aware em qualquer dispositivo — a resolução do nº de colunas é do CSS Grid, não de um ramo de JS', () => {
        renderAt('smartphone', <SarakGrid data-testid="grid-mobile"><div>x</div></SarakGrid>);
        renderAt('desktop', <SarakGrid data-testid="grid-desktop"><div>x</div></SarakGrid>);

        const mobileClass = screen.getByTestId('grid-mobile').className;
        const desktopClass = screen.getByTestId('grid-desktop').className;
        expect(mobileClass).toBe(desktopClass);
        expect(mobileClass).toContain('grid-cols-[repeat(auto-fit,minmax(280px,1fr))]');
        expect(mobileClass).not.toContain('grid-cols-12');
    });
});

describe('SarakFlex — wrap mobile-first por padrão (Spec 40.3 — L2)', () => {
    it('quebra em múltiplas linhas por padrão (flex-wrap: wrap)', () => {
        renderAt('desktop', <SarakFlex data-testid="flex"><span>x</span></SarakFlex>);
        expect(screen.getByTestId('flex').style.flexWrap).toBe('wrap');
    });

    it('permite forçar linha única com wrap={false}', () => {
        renderAt('desktop', <SarakFlex data-testid="flex" wrap={false}><span>x</span></SarakFlex>);
        expect(screen.getByTestId('flex').style.flexWrap).toBe('nowrap');
    });

    it('resolve direction via ResponsiveValue no dispositivo ativo', () => {
        const dir = { mob: 'column', tab: 'row', desk: 'row' } as const;
        renderAt('smartphone', <SarakFlex data-testid="flex" direction={dir}><span>x</span></SarakFlex>);
        expect(screen.getByTestId('flex').style.flexDirection).toBe('column');
    });
});

describe('SarakSplitPane — empilha no celular (Spec 40.3 — L2)', () => {
    it('no celular empilha os painéis SEM a divisória de arraste', () => {
        renderAt('smartphone',
            <SarakSplitPane
                leftPane={<div data-testid="left">L</div>}
                rightPane={<div data-testid="right">R</div>}
            />,
        );
        expect(screen.getByTestId('left')).toBeInTheDocument();
        expect(screen.getByTestId('right')).toBeInTheDocument();
        expect(document.querySelectorAll('.cursor-col-resize').length).toBe(0);
    });

    it('no desktop mantém o split redimensionável (divisória presente)', () => {
        renderAt('desktop',
            <SarakSplitPane leftPane={<div>L</div>} rightPane={<div>R</div>} />,
        );
        expect(document.querySelectorAll('.cursor-col-resize').length).toBeGreaterThan(0);
    });
});
