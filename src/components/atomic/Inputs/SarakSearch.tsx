import React, { useEffect, useId, useState, type Dispatch, type SetStateAction } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { SarakSearchDialog } from './internal/SarakSearchDialog';
import { useSearchKeyboardNavigation } from './internal/useSearchKeyboardNavigation';

export interface SarakSearchItem {
    id: string;
    label: string;
    category?: string;
    icon?: React.ReactNode;
}

export interface SarakSearchProps {
    isOpen: boolean;
    onClose: () => void;
    items: SarakSearchItem[];
    onSelect?: (id: string) => void;
}

export interface SearchPaletteState {
    query: string;
    setQuery: Dispatch<SetStateAction<string>>;
    filteredItems: SarakSearchItem[];
    listboxId: string;
    getOptionId: (index: number) => string;
    activeIndex: number;
    setActiveIndex: Dispatch<SetStateAction<number>>;
    handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    selectItem: (id: string) => void;
}

const getPalettePanelStyle = (searchStyle?: string): React.CSSProperties => ({
    maxWidth: 'var(--sarak-search-dropdown-width, 400px)',
    marginTop: 'calc(' + (searchStyle === 'minimal' ? '5vh' : '10vh') + ' + var(--sarak-search-dropdown-gap, 0.5rem))',
});

const useSearchPalette = ({ isOpen, onClose, items, onSelect }: SarakSearchProps): SearchPaletteState => {
    const [query, setQuery] = useState('');
    const listboxId = 'sarak-search-results-' + useId();
    const getOptionId = (index: number): string => listboxId + '-option-' + index;
    const filteredItems = items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.id.toLowerCase().includes(query.toLowerCase())
    );
    const selectActiveOption = (index: number): void => {
        document.getElementById(getOptionId(index))?.click();
    };
    const keyboardNavigation = useSearchKeyboardNavigation({
        query,
        resultCount: filteredItems.length,
        onSelectActive: selectActiveOption,
    });
    const selectItem = (id: string): void => {
        onSelect?.(id);
        onClose();
    };

    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    return { query, setQuery, filteredItems, listboxId, getOptionId, ...keyboardNavigation, selectItem };
};

export const SarakSearch = (props: SarakSearchProps): React.ReactElement => {
    const design = useSarakUIOptional()?.design;
    const state = useSearchPalette(props);

    return (
        <AnimatePresence>
            {props.isOpen && (
                <SarakSearchDialog
                    onClose={props.onClose}
                    onSelect={props.onSelect}
                    state={state}
                    panelStyle={getPalettePanelStyle(design?.searchStyle)}
                />
            )}
        </AnimatePresence>
    );
};

export default SarakSearch;
