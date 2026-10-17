import React, { useContext, useMemo } from 'react';
import { UIContext } from '../../../../core/Provider/SarakUIProvider';
import { getHostFontRegistry } from '../../../../core/Provider/utils/hostFonts';
import { composeFontOptions } from '../../utils/composeFontOptions';
import { SelectControl, type SelectOption } from '../DesignControls';

interface FontSelectControlProps {
    label: string;
    description?: string;
    options: (string | SelectOption)[];
    value: string | undefined | null;
    onChange: (value: string) => void;
}

/** O seletor de um token de fonte: as opções do schema mais as famílias que o host registrou no Provider. */
export const FontSelectControl: React.FC<FontSelectControlProps> = ({ options, ...props }) => {
    const hostFonts = getHostFontRegistry(useContext(UIContext)?.options?.fonts);
    const composed = useMemo(() => composeFontOptions(options, hostFonts), [options, hostFonts]);
    return <SelectControl {...props} options={composed} isFont />;
};
