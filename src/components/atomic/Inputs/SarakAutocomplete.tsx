import React from 'react';
import type { SarakInputProps } from './SarakInput';
import { SarakInput } from './SarakInput';
import { DEFAULT_AUTOCOMPLETE_DEBOUNCE_MS } from './internal/useAutocompleteSearch';
import {
    useAutocompleteController,
    type AutocompleteControllerState,
} from './internal/useAutocompleteController';
import { AutocompletePopup } from './internal/AutocompletePopup';

export interface SarakAutocompleteOption {
    value: string;
    label: string;
}

export interface SarakAutocompleteProps extends Omit<SarakInputProps, 'defaultValue' | 'onChange' | 'value'> {
    /**
     * Opções locais filtradas pelo rótulo. Omitida, a lista começa vazia; com
     * `searchOptions`, os resultados remotos substituem esta lista.
     */
    options?: SarakAutocompleteOption[];
    /**
     * Busca fornecida pelo host para listas remotas; a biblioteca não acessa a
     * rede diretamente. Omitida, a propriedade options é filtrada localmente.
     *
     * Recriar a função mantendo-a definida não reinicia a busca nem chama o
     * host de novo. A próxima busca usa a função mais recente; uma chamada já
     * iniciada continua com a função que a iniciou.
     */
    searchOptions?: (query: string) => Promise<SarakAutocompleteOption[]>;
    /**
     * Intervalo antes da busca remota, em milissegundos. Omitido, aguarda
     * 300 ms; valores negativos são tratados como zero.
     */
    debounceMs?: number;
    /**
     * Texto digitado no modo controlado. Omitido, o componente guarda a busca
     * internamente; quem controla deve atualizá-lo após a seleção.
     */
    value?: string;
    /**
     * Texto inicial no modo não controlado. Omitido, o campo começa vazio.
     */
    defaultValue?: string;
    /**
     * Recebe o evento nativo ao digitar. Omitida, não há notificação de
     * digitação; selecionar uma opção é informado por `onOptionSelect`.
     */
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    /**
     * Texto de dica do campo. Omitido, usa "Buscar...".
     */
    placeholder?: string;
    /**
     * Recebe a opção escolhida por clique ou teclado. Omitida, a opção ainda
     * preenche o texto do campo não controlado, sem emitir seleção externa.
     */
    onOptionSelect?: (option: SarakAutocompleteOption) => void;
}

type AutocompleteInputProps = Omit<
    SarakAutocompleteProps,
    | 'options'
    | 'searchOptions'
    | 'debounceMs'
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'onOptionSelect'
    | 'onFocus'
    | 'onBlur'
    | 'onKeyDown'
>;

interface AutocompleteDisplayProps {
    inputProps: AutocompleteInputProps;
    state: AutocompleteControllerState<SarakAutocompleteOption>;
}

interface AutocompleteFieldProps {
    inputProps: AutocompleteInputProps;
    state: AutocompleteControllerState<SarakAutocompleteOption>;
}

const AutocompleteField = (props: AutocompleteFieldProps): React.ReactElement => {
    const { inputProps, state } = props;
    const { placeholder = 'Buscar...', ...nativeProps } = inputProps;
    const isActiveOptionValid = state.activeIndex >= 0 && state.activeIndex < state.suggestions.length;
    const activeOptionId = isActiveOptionValid
        ? `${state.listboxId}-option-${state.activeIndex}`
        : undefined;
    return (
        <SarakInput
            {...nativeProps}
            placeholder={placeholder}
            value={state.query}
            onChange={state.handleInputChange}
            onFocus={state.handleFocus}
            onBlur={state.handleBlur}
            onKeyDown={state.handleKeyDown}
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded={state.shouldShowPanel}
            aria-controls={state.listboxId}
            aria-activedescendant={state.shouldShowPanel ? activeOptionId : undefined}
        />
    );
};

const AutocompleteDisplay = (props: AutocompleteDisplayProps): React.ReactElement => {
    const { inputProps, state } = props;
    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <AutocompleteField inputProps={inputProps} state={state} />
            <AutocompletePopup state={state} />
        </div>
    );
};

export const SarakAutocomplete = (props: SarakAutocompleteProps): React.ReactElement => {
    const {
        options, searchOptions, debounceMs = DEFAULT_AUTOCOMPLETE_DEBOUNCE_MS,
        value, defaultValue = '', onChange, onOptionSelect,
        onFocus, onBlur, onKeyDown, disabled, ...inputProps
    } = props;
    const state = useAutocompleteController({
        options, searchOptions, debounceMs, value, defaultValue, onChange,
        onOptionSelect, onFocus, onBlur, onKeyDown, disabled,
    });
    return <AutocompleteDisplay inputProps={inputProps} state={state} />;
};
