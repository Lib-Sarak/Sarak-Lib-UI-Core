import React from "react";
import { SarakSelect } from "../Inputs/SarakSelect";

export interface FilterSelectProps {
    /** Identifica a coluna cujo valor será lido de `filters` e enviado ao callback; obrigatória. */
    col: string;
    /** Não altera o texto do seletor nesta implementação; omitida ou preenchida, a opção inicial continua fixa como `(All)`. */
    placeholder?: string;
    /** Estado atual dos filtros; a opção selecionada vem de `filters[col]` e fica vazia quando a chave não existe. */
    filters: Record<string, string>;
    /** Recebe a coluna e o novo valor a cada seleção; obrigatória para propagar mudanças ao consumidor. */
    onChange: (col: string, value: string) => void;
    /** Valores disponíveis além da opção fixa `(All)`; obrigatória, mesmo quando a lista estiver vazia. */
    options: string[];
}

const FilterSelect: React.FC<FilterSelectProps> = ({ col, placeholder, filters, onChange, options }) => (
    <SarakSelect
        value={filters[col] || ''}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(col, e.target.value)}
        className="w-full text-2xs text-slate-300 transition-all"
        style={{ 
            padding: 'var(--sarak-layout-gap-sm,8px)', 
            borderRadius: 'var(--sarak-card-radius,12px)' 
        }}
    >
        <option value="">(All)</option>
        {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
        ))}
    </SarakSelect>
);

export default FilterSelect;
