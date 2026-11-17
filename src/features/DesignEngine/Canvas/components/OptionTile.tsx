import React from 'react';
import { OptionSampleFrame, SAMPLE_FRAME_HEIGHT } from './OptionSampleFrame';
import { usePeekHandlers, type PeekHandler, type PeekTokens } from './peek';

interface OptionTileProps {
    name: string;
    description?: string;
    onApply: () => void;
    /** Tokens que a espiada compõe por cima do rascunho; `null` enquanto a opção ainda não os tem. */
    peekTokens: () => PeekTokens;
    onPeek?: PeekHandler;
    /** `frame` reduz a amostra ao quadro de referência (a grade padrão); `square` a quer num quadrado, do tamanho da opção. */
    sampleShape?: 'frame' | 'square';
    /** A altura do quadro de referência (`frame`); a amostra baixa pede menos que o padrão. */
    frameHeight?: number;
    /** A amostra desenhada com os componentes reais. É só para ver: o toque e o teclado vão no botão da opção. */
    children: React.ReactNode;
}

/**
 * Uma opção da galeria: a amostra proporcional em cima, o nome embaixo (a descrição fica no leitor de tela e no balão), e um
 * botão transparente por cima de tudo. O botão separado existe porque a amostra tem botões e campos reais, e botão dentro
 * de botão não é HTML válido. Não sabe onde está: serve a toda grade de opções do painel.
 */
export const OptionTile: React.FC<OptionTileProps> = ({ name, description, onApply, peekTokens, onPeek, sampleShape = 'frame', frameHeight = SAMPLE_FRAME_HEIGHT.default, children }) => {
    const peek = usePeekHandlers(onPeek, peekTokens);
    return (
        <div
            data-option-tile=""
            title={description}
            className="group relative flex flex-col overflow-hidden rounded-[var(--sarak-card-radius,10px)] border border-theme-border bg-theme-sidebar transition-colors hover:border-theme-primary"
            {...peek}
        >
            <div aria-hidden="true" className="pointer-events-none">
                {sampleShape === 'square'
                    ? <div data-option-sample="" className="aspect-square w-full overflow-hidden">{children}</div>
                    : <OptionSampleFrame height={frameHeight}>{children}</OptionSampleFrame>}
            </div>
            <div className="flex flex-col gap-1 border-t border-theme-border px-2 py-1.5">
                <h3 className="break-words text-xs font-semibold leading-tight text-theme-text">{name}</h3>
                {description && <p className="sr-only">{description}</p>}
            </div>
            <button
                type="button"
                onClick={onApply}
                aria-label={name}
                // `p-0` é a exceção do CSS global `button:hover`/`button:active`, que pintaria o botão transparente de ciano e o moveria.
                className="absolute inset-0 p-0 rounded-[var(--sarak-card-radius,10px)]"
            />
        </div>
    );
};
