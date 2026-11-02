import React from 'react';
import type { SarakDesignState } from '../../../../core/Provider/types';
import { usePeekHandlers, type PeekHandler } from './peek';

interface OptionTileProps {
    name: string;
    description?: string;
    onApply: () => void;
    /** Tokens que a espiada compõe por cima do rascunho; `null` enquanto a opção ainda não os tem. */
    peekTokens: () => Partial<SarakDesignState> | null;
    onPeek?: PeekHandler;
    /** A amostra desenhada com os componentes reais. É só para ver: o toque e o teclado vão no botão da opção. */
    children: React.ReactNode;
}

/**
 * Uma opção da galeria: a amostra em cima, nome e descrição fora da imagem, e um botão transparente por cima
 * de tudo. O botão separado existe porque a amostra tem botões e campos reais, e botão dentro de botão não é HTML válido.
 * Não sabe onde está: serve à galeria de hoje e à coluna que a plan seguinte monta.
 */
export const OptionTile: React.FC<OptionTileProps> = ({ name, description, onApply, peekTokens, onPeek, children }) => {
    const peek = usePeekHandlers(onPeek, peekTokens);
    return (
        <div
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-theme-border bg-theme-sidebar transition-colors hover:border-theme-primary"
            {...peek}
        >
            <div aria-hidden="true" className="pointer-events-none">{children}</div>
            <div className="flex flex-col gap-1 border-t border-theme-border p-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-theme-text">{name}</h3>
                {description && <p className="text-xs text-theme-muted">{description}</p>}
            </div>
            <button
                type="button"
                onClick={onApply}
                aria-label={name}
                // `p-0` é a exceção do CSS global `button:hover`/`button:active`, que pintaria o botão transparente de ciano e o moveria.
                className="absolute inset-0 p-0 rounded-2xl"
            />
        </div>
    );
};
