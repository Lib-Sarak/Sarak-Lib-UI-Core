export const countDigitsBeforeCursor = (value: string, cursorPosition: number): number =>
    value.slice(0, cursorPosition).match(/\d/g)?.length ?? 0;

export const countMaskCharactersBeforeCursor = (
    value: string,
    cursorPosition: number,
    allowLetters: boolean = false,
): number => {
    const maskCharacters = value.slice(0, cursorPosition).match(allowLetters ? /[A-Z0-9]/gi : /\d/g);
    return maskCharacters?.length ?? 0;
};

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

export const findCursorAfterMaskCharacters = (
    value: string,
    characterCount: number,
    allowLetters: boolean = false,
): number => {
    const targetCharacterCount = Math.max(0, characterCount);
    const characterPattern = allowLetters ? /[A-Z0-9]/i : /\d/;
    let cursorPosition = 0;
    let foundCharacters = 0;

    while (cursorPosition < value.length && foundCharacters < targetCharacterCount) {
        if (characterPattern.test(value[cursorPosition])) foundCharacters += 1;
        cursorPosition += 1;
    }

    if (targetCharacterCount === 0) {
        const firstCharacterPosition = value.search(allowLetters ? /[A-Z0-9]/i : /\d/);
        return firstCharacterPosition === -1 ? value.length : firstCharacterPosition;
    }

    if (foundCharacters < targetCharacterCount) return value.length;
    while (cursorPosition < value.length && !characterPattern.test(value[cursorPosition])) cursorPosition += 1;
    return cursorPosition;
};
