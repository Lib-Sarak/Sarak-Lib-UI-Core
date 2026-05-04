import { PRIMARY_COLORS } from '../../../../constants/design-tokens';
import { ColorDesign } from '../../schema/atmosphere'; // Colors are part of atmosphere/global schema usually

export interface ColorPreset {
    id: string;
    name: string;
    design: Partial<ColorDesign>;
}

export const COLOR_PRESETS: ColorPreset[] = PRIMARY_COLORS.map(color => ({
    id: color.name.toLowerCase().replace(/\s+/g, '-'),
    name: color.name,
    design: {
        primary: color.value
    }
}));
