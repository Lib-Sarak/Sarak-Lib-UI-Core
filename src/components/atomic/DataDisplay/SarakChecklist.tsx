/**
 * SarakChecklist — lista de itens marcáveis (subtarefas de um cartão, por exemplo), com
 * progresso `feitos/total`, criação rápida e remoção opcionais. Estilo só por token;
 * texto pelo catálogo de i18n; ícone só pela porta de ícones.
 */

import React, { useState } from 'react';
import { SarakIconButton } from '../Buttons/SarakIconButton';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakIcon } from '../Icon/SarakIcon';
import { SarakCheckbox } from '../Inputs/SarakCheckbox';
import { SarakInput } from '../Inputs/SarakInput';
import { SarakProgress } from '../Feedback/SarakProgress';
import { useLibraryText } from '../../../core/i18n/useLibraryText';

export interface SarakChecklistItem {
    id: string;
    label: string;
    done: boolean;
}

export interface SarakChecklistProps {
    /** Itens na ordem em que aparecem. Vazio mostra o estado vazio traduzido. */
    items: SarakChecklistItem[];
    /** Disparado ao marcar ou desmarcar um item, com o id e o novo estado. A lista é controlada: quem chama atualiza `items`. */
    onToggle: (id: string, done: boolean) => void;
    /** Criação rápida: recebe o título digitado, sem espaços nas pontas. Omitido, o campo de novo item não aparece. */
    onAdd?: (label: string) => void;
    /** Remover um item. Omitido, o botão de remover não aparece. */
    onRemove?: (id: string) => void;
    /** Mostra a barra de progresso e o contador `feitos de total`. Omitido, não aparece. */
    showProgress?: boolean;
    /** Nome acessível da lista. Omitido, usa o texto traduzido "Lista de verificação". */
    label?: string;
    className?: string;
}

const column: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--sarak-layout-gap-sm, 8px)' };
const mutedText: React.CSSProperties = {
    color: 'var(--sarak-text-muted, inherit)',
    fontSize: 'var(--sarak-type-scale-caption, 12px)',
};

function ChecklistAddRow({ onAdd }: { onAdd: (label: string) => void }) {
    const text = useLibraryText();
    const [title, setTitle] = useState('');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;
        onAdd(trimmed);
        setTitle('');
    };

    return (
        <form data-checklist-add="true" onSubmit={handleSubmit} style={column}>
            <SarakInput
                aria-label={text('checklistAddPlaceholder')}
                placeholder={text('checklistAddPlaceholder')}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
            />
            <SarakButton type="submit" size="xs" variant="ghost" fullWidth>
                {text('checklistAddSubmit')}
            </SarakButton>
        </form>
    );
}

function ChecklistProgress({ done, total }: { done: number; total: number }) {
    const text = useLibraryText();
    const counter = text('checklistProgress', { done, total });
    return (
        <div data-checklist-progress="true" style={column}>
            <span style={mutedText}>{counter}</span>
            <SarakProgress value={done} max={Math.max(total, 1)} label={counter} />
        </div>
    );
}

export function SarakChecklist({ items, onToggle, onAdd, onRemove, showProgress, label, className }: SarakChecklistProps) {
    const text = useLibraryText();
    const done = items.filter((item) => item.done).length;

    return (
        <section aria-label={label ?? text('checklistLabel')} className={className} style={column}>
            {showProgress && <ChecklistProgress done={done} total={items.length} />}
            {items.length === 0 ? (
                <span style={mutedText}>{text('checklistEmpty')}</span>
            ) : (
                <ul style={{ ...column, listStyle: 'none', margin: 0, padding: 0 }}>
                    {items.map((item) => (
                        <li
                            key={item.id}
                            data-checklist-item={item.id}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sarak-layout-gap-sm, 8px)' }}
                        >
                            <SarakCheckbox
                                label={item.label}
                                checked={item.done}
                                onChange={(event) => onToggle(item.id, event.target.checked)}
                            />
                            {onRemove && (
                                <SarakIconButton
                                    variant="ghost"
                                    size="xs"
                                    icon={<SarakIcon name="X" />}
                                    aria-label={text('checklistRemove', { item: item.label })}
                                    onClick={() => onRemove(item.id)}
                                />
                            )}
                        </li>
                    ))}
                </ul>
            )}
            {onAdd && <ChecklistAddRow onAdd={onAdd} />}
        </section>
    );
}

export default SarakChecklist;
