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
