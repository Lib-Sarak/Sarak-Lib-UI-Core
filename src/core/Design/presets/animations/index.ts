import { THEME_EFFECTS } from '../../../../constants/design-tokens';
import { AnimationDesign } from '../../schema/animations';

export interface AnimationPreset {
    id: string;
    name: string;
    design: Partial<AnimationDesign>;
}

export const ANIMATION_PRESETS: AnimationPreset[] = Object.entries(THEME_EFFECTS.page).map(([id, effect]) => ({
    id,
    name: effect.name,
    design: {
        pageTransition: id as any
    }
}));
