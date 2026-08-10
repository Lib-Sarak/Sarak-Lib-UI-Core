import React from 'react';

export interface SarakScrimProps {
    /** Fecha a camada — chamado ao clique em qualquer ponto do scrim. */
    onClose: () => void;
    /** Rótulo acessível do scrim (ex.: "Fechar menu de navegação"). */
    ariaLabel: string;
    className?: string;
}

/**
 * SarakScrim — o backdrop de tela cheia que fecha um overlay (drawer, modal, painel) ao
 * clique fora. É `<button>` nativo, não `<div onClick>`: teclado (foco + Enter/Espaço) e
 * leitor de tela funcionam por construção, sem handler adicional (achado 17 / plan-19 —
 * o padrão se repetia pela base sem um átomo próprio).
 *
 * @sarak-encapsula button — a razão de existir deste componente é encapsular o
 *   `<button>` nativo do backdrop, para teclado e leitor de tela funcionarem por
 *   construção (a fronteira de R10 passou de PASTA para PAPEL — plan-20).
 */
export const SarakScrim: React.FC<SarakScrimProps> = ({ onClose, ariaLabel, className = '' }) => (
    <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClose}
        className={`fixed inset-0 z-40 border-0 cursor-default ${className}`.trim()}
        style={{ background: 'var(--sarak-overlay-bg, rgba(0,0,0,0.5))' }}
    />
);

export default SarakScrim;
