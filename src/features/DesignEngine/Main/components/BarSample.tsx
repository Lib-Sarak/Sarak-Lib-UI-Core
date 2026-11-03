import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { SarakAppChrome, type SarakNavItem } from '../../../../components/Layout/SarakAppChrome';
import { SampleScope } from '../../Canvas/components/SampleScope';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { SarakDesignState } from '../../../../core/Provider/types';

interface BarSampleProps {
    /** O rascunho aberto no painel: a amostra é o cromo REAL desenhado por ele. */
    draft: SarakDesignState;
    mode: 'light' | 'dark';
    /** Tokens de uma opção que a amostra aplica por cima do rascunho (a galeria de barras). */
    tokens?: Partial<SarakDesignState>;
    /**
     * A galeria de opções desenha a barra num quadro de referência (do tamanho de uma barra de verdade) e o reduz à largura
     * do tile: a barra inteira cabe, em vez de a marca e o rótulo serem espremidos. Omitida, a amostra tem o tamanho do quadro.
     */
    miniature?: 'sidebar' | 'topbar';
}

/** Largura e altura do quadro de referência de cada barra, em pixels de tela (o quadro é reduzido depois). */
const REFERENCE_FRAME = { sidebar: { width: 520, height: 320 }, topbar: { width: 640, height: 112 } } as const;

/** A escala que leva o quadro de referência à largura que o tile oferece. */
const useFitScale = (referenceWidth: number, enabled: boolean): [React.RefObject<HTMLDivElement>, number] => {
    const ref = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    useLayoutEffect(() => {
        const node = ref.current;
        if (!enabled || !node) return undefined;
        const fit = (): void => setScale(node.clientWidth / referenceWidth);
        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(node);
        return () => observer.disconnect();
    }, [enabled, referenceWidth]);
    return [ref, scale];
};

/** Marca de amostra neutra: um quadrado na cor primária do tema (uma imagem em SVG sairia preta: `currentColor` não alcança uma `<img>`). */
const SampleLogo: React.FC = () => (
    <span aria-hidden="true" className="block aspect-square rounded-[var(--sarak-card-radius,10px)]" style={{ height: 'var(--sarak-shell-brand-logo-size, 32px)', backgroundColor: 'var(--theme-primary)' }} />
);

const noop = (): void => undefined;

/**
 * A amostra de um grupo de ajustes da barra: o próprio `SarakAppChrome`, no rascunho, num quadro pequeno. Troque o
 * papel de cor, a posição da marca ou o item ativo e a amostra muda na hora, porque não é um desenho — é o componente.
 */
export const BarSample: React.FC<BarSampleProps> = ({ draft, mode, tokens = {}, miniature }) => {
    const text = useLibraryText();
    const frame = miniature ? REFERENCE_FRAME[miniature] : null;
    const [fitRef, scale] = useFitScale(frame?.width ?? 1, Boolean(frame));
    const navItems = useMemo<SarakNavItem[]>(() => [
        { id: 'home', label: text('barSampleHome'), href: '#home', icon: 'Home' },
        { id: 'sales', label: text('barSampleSales'), href: '#sales', icon: 'Briefcase' },
        { id: 'orders', label: text('barSampleOrders'), href: '#orders', icon: 'FileText', active: true },
    ], [text]);

    const chrome = (
        <SampleScope draft={draft} tokens={tokens} mode={mode} slotClassName={frame ? 'h-full' : 'h-56'} transparent>
            <div className={frame ? 'h-full w-full' : 'h-56 w-full'} style={{ transform: 'translateZ(0)' }}>
                <SarakAppChrome
                    brand={{ name: text('barSampleBrand') }}
                    logo={<SampleLogo />}
                    navItems={navItems}
                    user={{ name: text('barSampleUser') }}
                    logout={noop}
                    onNavigate={noop}
                    style={{ height: '100%' }}
                >
                    <div aria-hidden="true" className="h-full w-full" />
                </SarakAppChrome>
            </div>
        </SampleScope>
    );

    return (
        <div ref={fitRef} data-testid="bar-sample" className="overflow-hidden rounded-[var(--sarak-card-radius,10px)] border border-[var(--theme-border)]">
            {frame ? (
                <div style={{ height: frame.height * scale }}>
                    <div style={{ width: frame.width, height: frame.height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{chrome}</div>
                </div>
            ) : chrome}
        </div>
    );
};

export default BarSample;
