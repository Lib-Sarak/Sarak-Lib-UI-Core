/**
 * O anel de foco de um controle cujo `<input>` real é `sr-only` (switch, caixa de seleção, rádio): o foco está no input, que não se
 * vê, e o anel desenha na peça visual que é irmã dele. O input leva `peer`; a peça leva esta classe. O desenho é o do anel global
 * (`_elements.css`): a largura do token `focusRingWidth` e a cor do texto do tema.
 */
export const PEER_INPUT_CLASS = 'peer sr-only';

export const PEER_FOCUS_RING_CLASS = 'peer-focus-visible:outline peer-focus-visible:outline-[length:var(--sarak-focus-width,2px)] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--theme-text-primary,var(--sarak-text-main,CanvasText))]';
