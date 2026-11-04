import React, { useId } from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakFlex } from '../Layouts/SarakFlex';
import { SarakCheckbox } from './SarakCheckbox';
import { SarakColorInput } from './SarakColorInput';
import { SarakInput } from './SarakInput';
import { SarakSelect } from './SarakSelect';
import { SarakSwitch } from './SarakSwitch';
import { SarakTagInput } from './SarakTagInput';
import { SarakTextarea } from './SarakTextarea';

export type SarakFieldType =
    | 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'date'
    | 'textarea' | 'select' | 'checkbox' | 'switch' | 'color' | 'tags';

export interface SarakFieldDefinition {
    /** Chave do valor em `values` e em `errors`; também compõe o `id` do campo. */
    name: string;
    /** Tipo do campo; um tipo que a lib não conhece cai em `text`. */
    type: SarakFieldType;
    label: string;
    /** Marca o campo como obrigatório para o navegador e para o leitor de tela; a regra de validar é do host. */
    required?: boolean;
    /** Opções do `select`, com `value` e `label`. */
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
}

export interface SarakFieldRendererProps {
    /** Campos na ordem em que aparecem. Só dado: nenhuma função nem HTML é lida daqui. */
    fields: SarakFieldDefinition[];
    /** Valor atual de cada campo, por `name`. */
    values: Record<string, unknown>;
    /** Recebe o nome do campo e o valor novo (`number` no tipo `number`, `boolean` em `checkbox`/`switch`, `string[]` em `tags`). */
    onChange: (name: string, value: unknown) => void;
    /** Mensagem de erro por `name`. */
    errors?: Record<string, string>;
    disabled?: boolean;
    className?: string;
}

const valueOf = (values: Record<string, unknown>, name: string): unknown =>
    Object.prototype.hasOwnProperty.call(values, name) ? values[name] : undefined;

const asText = (value: unknown): string => (typeof value === 'string' || typeof value === 'number' ? String(value) : '');

const asTags = (value: unknown): string[] => (Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []);

interface FieldProps {
    field: SarakFieldDefinition;
    id: string;
    value: unknown;
    error?: string;
    disabled?: boolean;
    onChange: (value: unknown) => void;
}

const ChoiceField = ({ field, id, value, error, disabled, onChange }: FieldProps): React.ReactElement => {
    const text = useLibraryText();
    if (field.type === 'select') {
        return (
            <SarakSelect
                id={id} label={field.label} required={field.required} disabled={disabled} error={error} fullWidth
                value={asText(value)} onChange={(event) => onChange(event.target.value)}
                options={[{ value: '', label: text('fieldRendererSelect') }, ...(field.options ?? [])]}
            />
        );
    }
    const Control = field.type === 'switch' ? SarakSwitch : SarakCheckbox;
    return <Control id={id} label={field.label} required={field.required} aria-required={field.required} disabled={disabled} checked={value === true} onChange={(event) => onChange(event.target.checked)} />;
};

const ValueField = ({ field, id, value, error, disabled, onChange }: FieldProps): React.ReactElement => {
    const common = { id, label: field.label, disabled, error, required: field.required, placeholder: field.placeholder };
    if (field.type === 'color') return <SarakColorInput id={id} label={field.label} required={field.required} disabled={disabled} error={error} value={asText(value)} onChange={onChange} />;
    if (field.type === 'tags') return <SarakTagInput label={field.label} required={field.required} placeholder={field.placeholder} disabled={disabled} error={error} value={asTags(value)} onChange={onChange} />;
    if (field.type === 'textarea') return <SarakTextarea {...common} fullWidth value={asText(value)} onChange={(event) => onChange(event.target.value)} />;
    const inputType = field.type === 'number' ? 'number' : field.type;
    const handle = (event: React.ChangeEvent<HTMLInputElement>): void =>
        onChange(field.type === 'number' && event.target.value !== '' ? Number(event.target.value) : event.target.value);
    return <SarakInput {...common} type={inputType} fullWidth value={asText(value)} onChange={handle} />;
};

const KNOWN_TYPES: ReadonlySet<string> = new Set<SarakFieldType>([
    'text', 'email', 'password', 'tel', 'url', 'number', 'date', 'textarea', 'select', 'checkbox', 'switch', 'color', 'tags',
]);

/**
 * Gera os campos de um formulário a partir de uma lista de definições, com os átomos da lib. É só dado → tela:
 * rótulos e opções entram como texto do React (escapados), e nada vindo da lista é executado nem vira HTML.
 */
export const SarakFieldRenderer = ({ fields, values, onChange, errors = {}, disabled, className }: SarakFieldRendererProps): React.ReactElement => {
    const baseId = useId();
    return (
        <SarakFlex direction="column" gap="spacing-md" className={className}>
            {fields.map((raw) => {
                const field = KNOWN_TYPES.has(raw.type) ? raw : { ...raw, type: 'text' as const };
                const props: FieldProps = {
                    field, id: `${baseId}-${field.name}`, value: valueOf(values, field.name), disabled,
                    error: Object.prototype.hasOwnProperty.call(errors, field.name) ? errors[field.name] : undefined,
                    onChange: (next) => onChange(field.name, next),
                };
                const isChoice = field.type === 'select' || field.type === 'checkbox' || field.type === 'switch';
                return <div key={field.name}>{isChoice ? <ChoiceField {...props} /> : <ValueField {...props} />}</div>;
            })}
        </SarakFlex>
    );
};
