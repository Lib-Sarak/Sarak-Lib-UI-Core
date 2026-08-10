import React from 'react';
import { motion } from 'framer-motion';

export interface SarakScrimProps {
    /** Fecha a camada — chamado ao clique em qualquer ponto do scrim. */
    onClose: () => void;
    /** Rótulo acessível do scrim (ex.: "Fechar menu de navegação"). */
    ariaLabel: string;
    className?: string;
    /** `data-testid`, para quem precisa localizar o scrim em teste sem depender do
     * `ariaLabel`. Não é passthrough genérico de props — evita colidir com os tipos de
     * evento do `motion.button` (que redefine `onDrag` e afins com assinatura própria). */
    testId?: string;
    /** Sobrepõe o fundo padrão (`--sarak-overlay-bg`) — para consumidores que já liam a
     * cor do overlay de um token de design próprio antes de migrar para este átomo. */
    style?: React.CSSProperties;
    /** Ativa a transição de opacidade na entrada/saída. Default `false` — o comportamento
     * de sempre, sem animação (plan-19/20/22 pararam exatamente por causa disto: dar
     * animação sem ela ser opcional removeria o scrim estático que já existe). */
    animate?: boolean;
    /** Só tem efeito com `animate`. Alvo da opacidade (1 = visível, 0 = invisível) SEM
     * desmontar — para consumidores que gerenciam o próprio atraso de desmontagem (ex.:
     * `SarakDrawer`, que mantém o overlay montado até a transição terminar). Quando
     * omitido, assume visível — o caso de quem desmonta via `AnimatePresence` por fora
     * (ex.: `Controls.tsx`), onde o `exit` já cobre o fade de saída. */
    visible?: boolean;
    /** Só tem efeito com `animate`. Duração da transição em ms. Default 300 — o mesmo
     * valor que o `motion.div` ad hoc de `Controls.tsx` já usava (default do framer-motion
     * para uma transição de opacidade sem `transition` explícito). */
    durationMs?: number;
}

/**
 * SarakScrim — o backdrop de tela cheia que fecha um overlay (drawer, modal, painel) ao
 * clique fora. É `<button>` nativo, não `<div onClick>`: teclado (foco + Enter/Espaço) e
 * leitor de tela funcionam por construção, sem handler adicional (achado 17 / plan-19 —
 * o padrão se repetia pela base sem um átomo próprio).
 *
 * `animate` é opcional (plan-23): por padrão o scrim continua estático, pixel a pixel
 * igual ao que sempre foi (`SarakAppChromeMobile`, o único uso publicado hoje). Quem
 * precisa de fade (`Controls.tsx`, `SarakDrawer`) liga a prop.
 *
 * @sarak-encapsula button — a razão de existir deste componente é encapsular o
 *   `<button>` nativo do backdrop, para teclado e leitor de tela funcionarem por
 *   construção (a fronteira de R10 passou de PASTA para PAPEL — plan-20).
 */
export const SarakScrim: React.FC<SarakScrimProps> = ({
    onClose,
    ariaLabel,
    className = '',
    style,
    animate = false,
    visible = true,
    durationMs = 300,
    testId,
}) => {
    const sharedProps = {
        type: 'button' as const,
        'aria-label': ariaLabel,
        'data-testid': testId,
        onClick: onClose,
        className: `fixed inset-0 z-40 border-0 cursor-default ${className}`.trim(),
        style: { background: 'var(--sarak-overlay-bg, rgba(0,0,0,0.5))', ...style },
    };

    if (!animate) return <button {...sharedProps} />;

    return (
        <motion.button
            {...sharedProps}
            initial={{ opacity: 0 }}
            animate={{ opacity: visible ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: durationMs / 1000 }}
        />
    );
};

export default SarakScrim;
