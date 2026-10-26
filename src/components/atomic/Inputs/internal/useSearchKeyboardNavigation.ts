import { useEffect, useState, type Dispatch, type KeyboardEvent, type SetStateAction } from 'react';

interface SearchKeyboardNavigationOptions {
    query: string;
    resultCount: number;
    onSelectActive: (index: number) => void;
}

interface SearchKeyboardNavigation {
    activeIndex: number;
    setActiveIndex: Dispatch<SetStateAction<number>>;
    handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export const useSearchKeyboardNavigation = ({
    query,
    resultCount,
    onSelectActive,
}: SearchKeyboardNavigationOptions): SearchKeyboardNavigation => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        setActiveIndex(0);
    }, [query, resultCount]);

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        if (resultCount === 0) return;
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((currentIndex) => (currentIndex + 1) % resultCount);
            return;
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((currentIndex) => (currentIndex - 1 + resultCount) % resultCount);
            return;
        }
        if (event.key !== 'Enter') return;
        event.preventDefault();
        onSelectActive(activeIndex);
    };

    return { activeIndex, setActiveIndex, handleKeyDown };
};
