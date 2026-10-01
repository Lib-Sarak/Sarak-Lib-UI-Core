export const countDigitsBeforeCursor = (value: string, cursorPosition: number): number =>
    value.slice(0, cursorPosition).match(/\d/g)?.length ?? 0;

export const findCursorAfterDigits = (value: string, digitCount: number): number => {
    const targetDigitCount = Math.max(0, digitCount);
    let cursorPosition = 0;
    let foundDigits = 0;

    while (cursorPosition < value.length && foundDigits < targetDigitCount) {
        if (/\d/.test(value[cursorPosition])) foundDigits += 1;
        cursorPosition += 1;
    }

    if (targetDigitCount === 0) {
        const firstDigitPosition = value.search(/\d/);
        return firstDigitPosition === -1 ? value.length : firstDigitPosition;
    }

    if (foundDigits < targetDigitCount) return value.length;
    while (cursorPosition < value.length && !/\d/.test(value[cursorPosition])) cursorPosition += 1;
    return cursorPosition;
};
