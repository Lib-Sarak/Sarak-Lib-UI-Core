import React, { createContext, useContext, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

/** Com `true`, toda seção recolhível da decisão fica aberta: a busca de token precisa achar a linha onde ela estiver. */
export const ForceOpenSections = createContext(false);

interface CollapsibleSectionProps {
    title: string;
    /** O `id` que o botão carrega em `data-group-toggle`: é como o teste e a busca acham a seção. */
    toggleId: string;
    /** Atributos da seção (`data-option-group`, `data-decision-question`...). */
    sectionProps?: Record<string, string>;
    defaultOpen?: boolean;
    /** O estado controlado por quem agrupa seções (o grupo "em uso" decide o que abre); sem ele a seção guarda o próprio. */
    open?: boolean;
    onToggle?: () => void;
    children: React.ReactNode;
}

/**
 * Uma seção da decisão com o título como botão: fechada, custa uma linha e não desenha o conteúdo (amostras e controles
 * só montam abertos). `aria-expanded` diz o estado; o título segue `<h3>`, como era antes de recolher.
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, toggleId, sectionProps, defaultOpen = false, open, onToggle, children }) => {
    const forced = useContext(ForceOpenSections);
    const [ownOpen, setOwnOpen] = useState(defaultOpen);
    const isControlled = open !== undefined;
    const isOpen = forced || (isControlled ? open : ownOpen);
    return (
        <section aria-label={title} className="flex flex-col gap-3" {...sectionProps}>
            <h3 className="text-xs font-semibold text-[var(--theme-muted)]">
                <button
                    type="button"
                    data-group-toggle={toggleId}
                    aria-expanded={isOpen}
                    onClick={isControlled ? onToggle : () => setOwnOpen((current) => !current)}
                    className="flex w-full items-center gap-1 rounded-lg px-1 py-1 text-left text-xs font-semibold hover:bg-[var(--theme-primary)]/10"
                >
                    {isOpen ? <ChevronDown size={14} aria-hidden="true" /> : <ChevronRight size={14} aria-hidden="true" />}
                    {title}
                </button>
            </h3>
            {isOpen && children}
        </section>
    );
};
