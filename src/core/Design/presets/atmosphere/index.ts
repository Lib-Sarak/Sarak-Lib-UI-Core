import { TEXTURE_LIBRARY } from '../../../../constants/design-tokens';
import { AtmosphereDesign } from '../../schema/atmosphere';

export interface AtmospherePreset {
    id: string;
    name: string;
    design: Partial<AtmosphereDesign>;
}

export const ATMOSPHERE_PRESETS: AtmospherePreset[] = TEXTURE_LIBRARY.map(texture => ({
    id: texture.id,
    name: texture.name,
    design: {
        texture: texture.id
    }
}));
