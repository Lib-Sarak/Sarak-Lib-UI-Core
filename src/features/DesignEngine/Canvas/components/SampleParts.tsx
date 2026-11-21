import React, { useEffect, useMemo, useRef } from 'react';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';
import { SarakTitleCard } from '../../../../components/atomic/Cards/SarakTitleCard';
import { SarakInput } from '../../../../components/atomic/Inputs/SarakInput';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';

/**
 * O anel de foco do botão, o mesmo que `button:focus-visible` (`styles/_elements.css`) desenha, lido das mesmas
 * variáveis. O foco de verdade é um estado do navegador e não dá para segurá-lo em quatro amostras ao mesmo tempo.
 */
const FOCUS_RING_STYLE: React.CSSProperties = {
    outline: 'var(--sarak-focus-width, 2px) solid var(--theme-texture-color, var(--theme-primary))',
    outlineOffset: 'var(--sarak-focus-width, 2px)',
    boxShadow: '0 0 0 calc(var(--sarak-focus-width, 2px) * 2) var(--theme-primary-focus)',
};

/**
 * Põe o componente real no estado pedido pelo mesmo caminho do uso: o evento que o React escuta. O botão e o campo
 * guardam `hover` e `focus` em estado próprio, e é esse estado que muda a aparência — nada é pintado à mão.
 */
const useForcedEvent = (ref: React.RefObject<HTMLElement | null>, selector: string, event: 'mouseover' | 'focusin' | null): void => {
    useEffect(() => {
        const target = ref.current?.querySelector(selector);
        if (!target || !event) return;
        target.dispatchEvent(event === 'mouseover' ? new MouseEvent('mouseover', { bubbles: true }) : new FocusEvent('focusin', { bubbles: true }));
    }, [ref, selector, event]);
};

export type SampleButtonState = 'rest' | 'hover' | 'focus' | 'disabled';

export const SAMPLE_BUTTON_STATES: readonly SampleButtonState[] = ['rest', 'hover', 'focus', 'disabled'];

const STATE_LABEL_KEY = {
    rest: 'sampleButtonRest',
    hover: 'sampleButtonHover',
    focus: 'sampleButtonFocus',
    disabled: 'sampleButtonDisabled',
} as const;

/** O botão real num estado só. */
export const SampleButton: React.FC<{ state: SampleButtonState }> = ({ state }) => {
    const text = useLibraryText();
    const ref = useRef<HTMLSpanElement>(null);
    useForcedEvent(ref, 'button', state === 'hover' ? 'mouseover' : null);
    return (
        <span ref={ref} className="inline-flex">
            <SarakButton
                size="sm"
                tabIndex={-1}
                disabled={state === 'disabled'}
                style={state === 'focus' ? FOCUS_RING_STYLE : undefined}
            >
                {text('sampleCardAction')}
            </SarakButton>
        </span>
    );
};

/** Os quatro estados do botão lado a lado, cada um com o nome embaixo. */
export const SampleButtonStates: React.FC = () => {
    const text = useLibraryText();
    return (
        <div className="flex flex-wrap items-end justify-center gap-4 p-6">
            {SAMPLE_BUTTON_STATES.map((state) => (
                <figure key={state} data-sample-state={state} className="m-0 flex flex-col items-center gap-2">
                    <SampleButton state={state} />
                    <figcaption className="text-[var(--sarak-type-scale3xs,11px)] uppercase tracking-widest " style={{ color: 'var(--theme-text-muted)' }}>{text(STATE_LABEL_KEY[state])}</figcaption>
                </figure>
            ))}
        </div>
    );
};

/** O campo real em repouso e com foco. */
export const SampleInputStates: React.FC = () => {
    const text = useLibraryText();
    const focusRef = useRef<HTMLDivElement>(null);
    useForcedEvent(focusRef, 'input', 'focusin');
    return (
        <div className="flex flex-col gap-3 p-6">
            <div data-sample-state="rest">
                <SarakInput label={text('sampleInputLabel')} defaultValue={text('sampleInputValue')} readOnly tabIndex={-1} fullWidth />
            </div>
            <div ref={focusRef} data-sample-state="focus">
                <SarakInput label={text('sampleInputLabel')} defaultValue={text('sampleInputValue')} readOnly tabIndex={-1} fullWidth />
            </div>
        </div>
    );
};

/** Opacidade com que a amostra mostra uma textura: a do tema (0,06 a 0,3) quase some numa miniatura. Só da amostra; o que se aplica ao clicar não muda. */
export const SAMPLE_TEXTURE_OPACITY = 0.7;

/**
 * Como a amostra desenha uma textura: opacidade visível e traço na cor do texto do escopo, porque o traço do tema
 * (a cor da borda) quase some sobre o próprio fundo. Só da amostra; o clique aplica o preset, sem estes valores.
 */
export const SAMPLE_TEXTURE_STYLE = {
    '--sarak-card-texture-opacity': SAMPLE_TEXTURE_OPACITY,
    '--sarak-bg-pattern-opacity': SAMPLE_TEXTURE_OPACITY,
    '--theme-texture-color': 'var(--sarak-text-main)',
    '--sarak-card-border-color': 'var(--sarak-text-main)',
} as React.CSSProperties;

/**
 * O registro e o mapa de campos do cartão da amostra: o "CPU Cluster" da tela "Painel" da prévia, sem as etiquetas de capacidade
 * (o texto delas fica em 3,9:1 no escuro, abaixo dos 4,5:1 que o painel cobra de todo texto da coluna).
 */
const SAMPLE_CARD_ITEM = { title: 'CPU Cluster', subtitle: 'Node-04-PR', context: '42000', input_caps: [] as string[] };
const SAMPLE_CARD_MAPPING = { title: 'title', subtitle: 'subtitle', context: 'context', input_caps: 'input_caps', icon: 'Cpu' };

/**
 * O cartão real do painel (chip de título, conteúdo e ação), como a tela "Painel" o desenha, com o design do escopo da amostra
 * (a opção por cima do rascunho). A textura do cartão é do grupo dela e é a do cartão de verdade (`data-sx-card-texture-type`, com a opacidade do rascunho): sem
 * `texture`, o cartão não herda a do rascunho, e a amostra de cada grupo mostra só o que o grupo escolhe.
 */
export const SampleTitleCard: React.FC<{ texture?: string }> = ({ texture }) => {
    const { design } = useSarakUI();
    const shown = useMemo(() => ({ ...design, cardTextureType: texture ?? 'none' }), [design, texture]);
    return (
        <div className="relative w-full" style={{ maxWidth: 'var(--sarak-preset-mini-card-max-width,280px)' }}>
            <SarakTitleCard item={SAMPLE_CARD_ITEM} mapping={SAMPLE_CARD_MAPPING} design={shown} />
        </div>
    );
};
