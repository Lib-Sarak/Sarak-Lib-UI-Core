import React from "react";
import { SarakSelect } from "../Inputs/SarakSelect";
import { useLibraryText } from "../../../core/i18n/useLibraryText";

export interface SarakFilterSelectOption {
    label: string;
    value: string;
}

export interface SarakFilterSelectProps {
    /** Identifica a coluna cujo valor será lido de `filters` e enviado ao callback; obrigatória. */
    col: string;
    /** Texto da opção inicial (valor vazio); omitido, sai do catálogo da lib no idioma escolhido (`Todos`, `All`…). */
    placeholder?: string;
    /** Nome acessível do seletor; omitido, a biblioteca usa um rótulo genérico oculto. */
    label?: string;
    /** Estado atual dos filtros; a opção selecionada vem de `filters[col]` e fica vazia quando a chave não existe. */
    filters: Record<string, string>;
    /** Recebe a coluna e o novo valor a cada seleção; obrigatória para propagar mudanças ao consumidor. */
    onChange: (col: string, value: string) => void;
    /** Valores disponíveis além da opção inicial: textos simples ou pares `{ label, value }`; obrigatória, mesmo vazia. */
    options: string[] | SarakFilterSelectOption[];
}

const normalizeOption = (option: string | SarakFilterSelectOption): SarakFilterSelectOption =>
    typeof option === "string" ? { label: option, value: option } : option;

const SarakFilterSelect = ({ col, placeholder, label, filters, onChange, options }: SarakFilterSelectProps): React.ReactElement => {
    const text = useLibraryText();
    return (
        <SarakSelect
            label={label ?? text('selectAriaLabel')}
            hideLabel
            value={filters[col] || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(col, e.target.value)}
            className="w-full text-2xs text-[var(--color-theme-title,#f2f6fb)] transition-all"
            style={{
                padding: 'var(--sarak-layout-gap-sm,8px)',
                borderRadius: 'var(--sarak-card-radius,10px)'
            }}
        >
            <option value="">{placeholder ?? text('filterSelectAll')}</option>
            {(options as Array<string | SarakFilterSelectOption>).map(normalizeOption).map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </SarakSelect>
    );
};

export default SarakFilterSelect;
