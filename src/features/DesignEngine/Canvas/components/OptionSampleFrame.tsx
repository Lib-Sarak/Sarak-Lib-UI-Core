import React, { useLayoutEffect, useRef, useState } from 'react';

/** O quadro de referência em que toda amostra é desenhada (em px de tela); a opção o reduz à largura que a grade dá. */
export const SAMPLE_REFERENCE = { width: 280, height: 240 } as const;
/** A altura do quadro quando a amostra é baixa (um campo, a barra de topo): quadro menor, para o desenho ocupar o que o olho compara. */
export const SAMPLE_FRAME_HEIGHT = { default: SAMPLE_REFERENCE.height, input: 170, topbar: 100 } as const;
/** A amostra preenche o quadro de referência: a cadeia do espaço reservado até o escopo ocupa a altura, e o conteúdo fica ao centro. */
const FILL_CHAIN = 'absolute left-0 top-0 flex origin-top-left flex-col [&>*:not([data-testid=bar-sample])]:h-full [&_[data-sx-lazy]]:h-full [&_[data-sx-lazy]>*]:flex [&_[data-sx-lazy]>*]:min-h-full [&_[data-sx-lazy]>*]:flex-col [&_[data-sx-lazy]>*]:justify-center';
/** Escala de partida, até a primeira medição (e para sempre onde não há `ResizeObserver`). */
const FALLBACK_SCALE = 0.5;

/**
 * A amostra de uma opção, proporcional: o componente real é desenhado no quadro de referência e reduzido à largura da
 * opção, com a proporção fixa. Uma grade de várias colunas fica com opções do mesmo tamanho, e nada vaza nem se corta
 * pela largura da coluna.
 */
export const OptionSampleFrame: React.FC<{ children: React.ReactNode; height?: number }> = ({ children, height = SAMPLE_REFERENCE.height }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(FALLBACK_SCALE);
    useLayoutEffect(() => {
        const node = ref.current;
        if (!node || typeof ResizeObserver === 'undefined') return undefined;
        const fit = (): void => { if (node.clientWidth > 0) setScale(node.clientWidth / SAMPLE_REFERENCE.width); };
        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(node);
        return () => observer.disconnect();
    }, []);
    return (
        <div ref={ref} data-option-sample="" className="relative w-full overflow-hidden" style={{ aspectRatio: `${SAMPLE_REFERENCE.width} / ${height}` }}>
            <div className={FILL_CHAIN} style={{ width: SAMPLE_REFERENCE.width, height, transform: `scale(${scale})` }}>
                {children}
            </div>
        </div>
    );
};
