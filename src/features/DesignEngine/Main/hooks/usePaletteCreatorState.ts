import { useMemo, useState } from 'react';
import { toValidPaletteInput } from '../utils/paletteDraft';
import type { SarakPaletteInput, SarakPaletteType } from '../../../../core/Design/palette/types';

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

interface CreatorSeeds {
    base: string;
    type: SarakPaletteType;
    secondary?: string;
    accent?: string;
}

/** O estado do criador de paleta: as sementes que o usuário escolhe e a entrada válida que elas formam (ou `null`). */
export const usePaletteCreatorState = (initialBase: string) => {
    const [seeds, setSeeds] = useState<CreatorSeeds>({ base: initialBase, type: 'analogous' });
    const input = useMemo(() => {
        const candidate: SarakPaletteInput = {
            type: seeds.type,
            base: seeds.base,
            ...(seeds.secondary ? { secondary: seeds.secondary } : {}),
            ...(seeds.accent ? { accent: seeds.accent } : {}),
        };
        return toValidPaletteInput(candidate);
    }, [seeds]);
    // O motor só entende hex: cor em outro formato (alfa, `rgba()`) é ignorada e a semente fica como estava.
    const setColor = (key: 'base' | 'secondary' | 'accent') => (value: string | undefined) => {
        if (value !== undefined && !HEX_COLOR.test(value)) return;
        setSeeds((current) => ({ ...current, [key]: value }));
    };
    return {
        base: seeds.base, setBase: setColor('base') as (value: string) => void,
        type: seeds.type, setType: (type: SarakPaletteType) => setSeeds((current) => ({ ...current, type })),
        secondary: seeds.secondary, setSecondary: setColor('secondary'),
        accent: seeds.accent, setAccent: setColor('accent'),
        input,
    };
};
