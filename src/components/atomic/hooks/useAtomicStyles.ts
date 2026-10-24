import { getButtonStyles, CYBERPUNK_TEXT_COLORS, resolveNeonPulseClass } from './buttonStyles';
import { getCheckboxStyles, getChoiceMarkColor, getRadioStyles } from './choiceStyles';
import { getInputStyles } from './inputStyles';
import { neumorphismButtonShadow } from './neumorphismStyles';
import { resolveSwitchStyles } from './switchStyles';

export { CYBERPUNK_TEXT_COLORS, resolveNeonPulseClass, neumorphismButtonShadow };

export interface AtomicStyles {
    getButtonStyles: typeof getButtonStyles;
    getInputStyles: typeof getInputStyles;
    getSwitchStyles: typeof resolveSwitchStyles;
    getCheckboxStyles: typeof getCheckboxStyles;
    getRadioStyles: typeof getRadioStyles;
    getChoiceMarkColor: typeof getChoiceMarkColor;
}

export const useAtomicStyles = (): AtomicStyles => ({
    getButtonStyles,
    getInputStyles,
    getSwitchStyles: resolveSwitchStyles,
    getCheckboxStyles,
    getRadioStyles,
    getChoiceMarkColor,
});
