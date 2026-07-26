import React, { act } from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { SarakAppChrome } from '../SarakAppChrome';
import SarakUIProvider from '../../../core/Provider/SarakUIProvider';

const NAV = [
    { label: 'Propostas', route: '/propostas' },
    { label: 'Projetos', route: '/projetos' },
];

/** Simula o CAMINHO REAL: seta a largura da janela e dispara `resize` (como o browser). */
const setViewport = (width: number) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
    act(() => { window.dispatchEvent(new Event('resize')); });
};

afterEach(() => setViewport(1024));

// Este bloco exercita a DETECÇÃO REAL (DeviceProvider + window.innerWidth), NÃO
// `overrideDevice`. É o teste que TERIA pego o bug do L1 reprovado no browser.
describe('SarakAppChrome (Spec 40.3 — L1) detecção REAL por viewport (sem overrideDevice)', () => {
    it('a <768px o cromo colapsa em hambúrguer (SarakAppChromeMobile)', () => {
        setViewport(375);
        const { container } = render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakAppChrome nav={NAV}><div>x</div></SarakAppChrome>
            </SarakUIProvider>,
        );
        setViewport(375); // garante a largura mesmo que o Provider tenha montado antes
        expect(container.querySelector('[aria-controls="sarak-chrome-drawer"]')).not.toBeNull();
    });

    it('≥1024px mantém a sidebar (sem hambúrguer)', () => {
        setViewport(1280);
        const { container } = render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakAppChrome navigationStyle="sidebar" nav={NAV}><div>x</div></SarakAppChrome>
            </SarakUIProvider>,
        );
        setViewport(1280);
        expect(container.querySelector('aside')).not.toBeNull();
        expect(container.querySelector('[aria-controls="sarak-chrome-drawer"]')).toBeNull();
    });
});

// Spec 48 — L2: os slots atravessam os 3 viewports pela DETECÇÃO REAL (sem overrideDevice).
// Cada viewport tem um corpo de cromo diferente (drawer / topbar compacta / sidebar), então
// "o slot tem lugar" precisa ser provado em cada um — não só no device forçado.
const renderComSlots = () => render(
    <SarakUIProvider config={{ mode: 'dark' }}>
        <SarakAppChrome
            navigationStyle="sidebar"
            nav={NAV}
            banner={<span>faixa</span>}
            footer={<span>rodapé</span>}
            decoration={<span>arte</span>}
            sidebarHeader={<span>busca</span>}
            sidebarFooter={<span>versão</span>}
            topbarStart={<span>início</span>}
            topbarEnd={<span>avatar</span>}
            logo={<span>◆</span>}
        >
            <div>conteúdo</div>
        </SarakAppChrome>
    </SarakUIProvider>,
);

const slotOf = (c: HTMLElement, name: string) => c.querySelector(`[data-sarak-slot="${name}"]`);

describe('SarakAppChrome (Spec 48 — L2) slots por VIEWPORT (detecção real)', () => {
    it.each([
        ['celular', 375],
        ['tablet', 800],
        ['desktop', 1280],
    ])('%s: banner/footer/decoration/logo têm lugar e o conteúdo continua de pé', (_nome, largura) => {
        setViewport(largura);
        const { container } = renderComSlots();
        setViewport(largura);
        for (const slot of ['banner', 'footer', 'decoration', 'logo', 'topbarStart', 'topbarEnd']) {
            expect(slotOf(container, slot)).not.toBeNull();
        }
        // Faixas full-width em qualquer viewport (refluem, não estouram).
        expect((slotOf(container, 'banner') as HTMLElement).className).toContain('w-full');
        expect((slotOf(container, 'footer') as HTMLElement).className).toContain('w-full');
        // Decoração nunca captura foco/toque, em nenhum dispositivo.
        expect(slotOf(container, 'decoration')).toHaveAttribute('aria-hidden', 'true');
        expect((slotOf(container, 'decoration') as HTMLElement).style.pointerEvents).toBe('none');
        expect(container.textContent).toContain('conteúdo');
    });

    it('celular: as regiões da sidebar não ocupam a tela — migram para o drawer', () => {
        setViewport(375);
        const { container } = renderComSlots();
        setViewport(375);
        expect(slotOf(container, 'sidebarHeader')).toBeNull();
        act(() => { (container.querySelector('[aria-controls="sarak-chrome-drawer"]') as HTMLElement).click(); });
        const drawer = container.querySelector('#sarak-chrome-drawer')!;
        expect(drawer.contains(slotOf(container, 'sidebarHeader'))).toBe(true);
        expect(drawer.contains(slotOf(container, 'sidebarFooter'))).toBe(true);
    });

    it('desktop: as regiões da sidebar ficam na sidebar fixa', () => {
        setViewport(1280);
        const { container } = renderComSlots();
        setViewport(1280);
        const aside = container.querySelector('aside')!;
        expect(aside.contains(slotOf(container, 'sidebarHeader'))).toBe(true);
        expect(aside.contains(slotOf(container, 'sidebarFooter'))).toBe(true);
    });
});
