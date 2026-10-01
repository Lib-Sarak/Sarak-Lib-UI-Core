import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { countDigitsBeforeCursor, findCursorAfterDigits } from './inputCaret';

export interface InputCaretController {
    inputContainerRef: RefObject<HTMLDivElement>;
    captureCaret: (value: string, cursorPosition: number | null) => void;
}

export const useInputCaret = (formattedValue: string): InputCaretController => {
    const inputContainerRef = useRef<HTMLDivElement>(null);
    const [pendingDigitCount, setPendingDigitCount] = useState<number | null>(null);

    useLayoutEffect(() => {
        if (pendingDigitCount === null) return;
        const input = inputContainerRef.current?.querySelector('input');
        if (input && document.activeElement === input) {
            const cursorPosition = findCursorAfterDigits(formattedValue, pendingDigitCount);
            input.setSelectionRange(cursorPosition, cursorPosition);
        }
        setPendingDigitCount(null);
    }, [formattedValue, pendingDigitCount]);

    const captureCaret = (value: string, cursorPosition: number | null): void => {
        setPendingDigitCount(countDigitsBeforeCursor(value, cursorPosition ?? value.length));
    };

    return { inputContainerRef, captureCaret };
};
