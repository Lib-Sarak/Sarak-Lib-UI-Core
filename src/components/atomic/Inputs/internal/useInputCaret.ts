import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { countMaskCharactersBeforeCursor, findCursorAfterMaskCharacters } from './inputCaret';

export interface InputCaretController {
    inputContainerRef: RefObject<HTMLDivElement>;
    captureCaret: (value: string, cursorPosition: number | null) => void;
}

export const useInputCaret = (formattedValue: string, allowLetters: boolean = false): InputCaretController => {
    const inputContainerRef = useRef<HTMLDivElement>(null);
    const [pendingDigitCount, setPendingDigitCount] = useState<number | null>(null);

    useLayoutEffect(() => {
        if (pendingDigitCount === null) return;
        const input = inputContainerRef.current?.querySelector('input');
        if (input && document.activeElement === input) {
            const cursorPosition = findCursorAfterMaskCharacters(formattedValue, pendingDigitCount, allowLetters);
            input.setSelectionRange(cursorPosition, cursorPosition);
        }
        setPendingDigitCount(null);
    }, [formattedValue, pendingDigitCount, allowLetters]);

    const captureCaret = (value: string, cursorPosition: number | null): void => {
        setPendingDigitCount(countMaskCharactersBeforeCursor(value, cursorPosition ?? value.length, allowLetters));
    };

    return { inputContainerRef, captureCaret };
};
