import React, { useRef } from 'react';
import { OptionSampleFrame, SAMPLE_FRAME_HEIGHT } from './OptionSampleFrame';
import { usePeekHandlers, type PeekHandler, type PeekTokens } from './peek';

/** `inert` ainda não está nos tipos do React 18: o atributo entra por espalhamento. */
const INERT = { inert: '' } as const;

// sarak-allow-hardcode: o anel de foco do botão da opção desenha por dentro (o cartão corta o que passa da borda): recuo de 4 px, o dobro da largura padrão do anel, e halo inset de 2 px; o Tailwind exige a classe literal.
const TILE_FOCUS_INSIDE = 'focus-visible:-outline-offset-4 focus-visible:shadow-[inset_0_0_0_2px_var(--bg-body,var(--color-theme-body,Canvas))]';

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
    /** A largura do quadro de referência (`frame`); a miniatura de um tema desenha o app inteiro e pede mais que o padrão. */
    frameWidth?: number;
    /** Atributos do botão da opção (o alvo estável de teste do tema, `aria-busy`); a opção em si não os conhece. */
    buttonProps?: Record<string, string>;
    /** A opção que nasce sob o ponteiro (o cartão que trocou o pendente) espia sem esperar o mouse se mexer. */
    peekWhenMounted?: boolean;
    /** A amostra desenhada com os componentes reais. É só para ver: o toque e o teclado vão no botão da opção. */
    children: React.ReactNode;
}

/**
 * Uma opção da galeria: a amostra proporcional em cima, o nome embaixo (a descrição fica no leitor de tela e no balão), e um
 * botão transparente por cima de tudo. O botão separado existe porque a amostra tem botões e campos reais, e botão dentro
 * de botão não é HTML válido. Não sabe onde está: serve a toda grade de opções do painel.
 */
export const OptionTile: React.FC<OptionTileProps> = ({ name, description, onApply, peekTokens, onPeek, sampleShape = 'frame', frameHeight = SAMPLE_FRAME_HEIGHT.default, frameWidth, buttonProps, peekWhenMounted = false, children }) => {
    const button = useRef<HTMLButtonElement>(null);
    const peek = usePeekHandlers(onPeek, peekTokens, peekWhenMounted ? button : undefined);
    return (
        <div
            data-option-tile=""
            title={description}
            className="group relative flex flex-col overflow-hidden rounded-[var(--sarak-card-radius,10px)] border border-theme-border bg-[var(--theme-surface)] transition-colors hover:border-theme-primary"
            {...peek}
        >
            {/* `inert` tira da ordem do Tab e da árvore de acessibilidade os botões e campos reais da amostra: ela é só para ver. */}
            <div aria-hidden="true" className="pointer-events-none" {...INERT}>
                {sampleShape === 'square'
                    ? <div data-option-sample="" className="aspect-square w-full overflow-hidden">{children}</div>
                    : <OptionSampleFrame height={frameHeight} width={frameWidth}>{children}</OptionSampleFrame>}
            </div>
            <div className="flex flex-col gap-1 border-t border-theme-border px-2 py-1.5">
                <h3 className="break-words text-xs font-semibold leading-tight text-[var(--theme-title)]">{name}</h3>
                {description && <p className="sr-only">{description}</p>}
            </div>
            <button
                type="button"
                onClick={onApply}
                aria-label={name}
                ref={button}
                {...buttonProps}
                // `p-0` é a exceção do CSS global `button:hover`/`button:active`, que pintaria o botão transparente de ciano e o moveria.
                // O cartão corta o que passa da borda (`overflow-hidden`): o anel de foco desenha por dentro, com o halo inset.
                className={`absolute inset-0 p-0 rounded-[var(--sarak-card-radius,10px)] ${TILE_FOCUS_INSIDE}`}
            />
        </div>
    );
};
