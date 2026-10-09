/**
 * Campo de criação rápida do SarakKanban: um título e Enter (ou o botão). Serve ao rodapé da
 * coluna (novo cartão) e ao fim do quadro (nova coluna). Título vazio não dispara nada.
 */

import React, { useState } from 'react';
import { SarakButton } from '../../Buttons/SarakButton';
import { SarakInput } from '../../Inputs/SarakInput';

export interface KanbanAddFormProps {
    placeholder: string;
    submitLabel: string;
    onSubmit: (title: string) => void;
    formKind: 'card' | 'column';
}

export function KanbanAddForm({ placeholder, submitLabel, onSubmit, formKind }: KanbanAddFormProps) {
    const [title, setTitle] = useState('');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;
        onSubmit(trimmed);
        setTitle('');
    };

    return (
        <form
            data-kanban-add={formKind}
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sarak-layout-gap-sm, 8px)' }}
        >
            <SarakInput
                aria-label={placeholder}
                placeholder={placeholder}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
            />
            <SarakButton type="submit" size="xs" variant="ghost" fullWidth>
                {submitLabel}
            </SarakButton>
        </form>
    );
}

export default KanbanAddForm;
