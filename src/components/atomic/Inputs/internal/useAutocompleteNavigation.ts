import { useState } from 'react';
import type { KeyboardEvent, KeyboardEventHandler } from 'react';
import type { AutocompleteOption } from './autocompleteTypes';

interface AutocompleteNavigation<TOption extends AutocompleteOption> {
    options: TOption[];
    isOpen: boolean;
    activeIndex: number;
    open: () => void;
    close: () => void;
    activateOption: (index: number) => void;
    selectOption: (option: TOption) => void;
}

interface AutocompleteKeyboardActions<TOption extends AutocompleteOption> {
    navigation: AutocompleteNavigation<TOption>;
    onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}

export interface AutocompleteNavigationState {
    isOpen: boolean;
    activeIndex: number;
    open: () => void;
    close: () => void;
    activateOption: (index: number) => void;
    handleKeyDown: KeyboardEventHandler<HTMLInputElement>;
}

const getNextActiveIndex = (key: string, activeIndex: number, optionCount: number): number => {
    if (key === 'ArrowDown') return (activeIndex + 1) % optionCount;
    return activeIndex <= 0 ? optionCount - 1 : activeIndex - 1;
};

const handleAutocompleteKeyDown = <TOption extends AutocompleteOption>(
    event: KeyboardEvent<HTMLInputElement>,
    actions: AutocompleteKeyboardActions<TOption>,
): void => {
    const { navigation } = actions;
    actions.onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Escape' && navigation.isOpen) {
        event.preventDefault();
        navigation.close();
        return;
    }
    if (event.key === 'Tab') {
        navigation.close();
        return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        navigation.open();
        if (navigation.options.length > 0) {
            navigation.activateOption(getNextActiveIndex(event.key, navigation.activeIndex, navigation.options.length));
        }
        return;
    }
    if (event.key === 'Enter' && navigation.isOpen && navigation.options[navigation.activeIndex]) {
        event.preventDefault();
        navigation.close();
        navigation.selectOption(navigation.options[navigation.activeIndex]);
    }
};

export const useAutocompleteNavigation = <TOption extends AutocompleteOption>(
    options: TOption[],
    onKeyDown: KeyboardEventHandler<HTMLInputElement> | undefined,
    selectOption: (option: TOption) => void,
): AutocompleteNavigationState => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const open = (): void => setIsOpen(true);
    const close = (): void => { setIsOpen(false); setActiveIndex(-1); };
    const navigation = { options, isOpen, activeIndex, open, close, activateOption: setActiveIndex, selectOption };
    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event: KeyboardEvent<HTMLInputElement>): void =>
        handleAutocompleteKeyDown(event, { navigation, onKeyDown });
    return { isOpen, activeIndex, open, close, activateOption: setActiveIndex, handleKeyDown };
};
