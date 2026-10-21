import type { HostFontRegistry } from '../../../core/Provider/utils/hostFonts';
import type { SelectOption } from '../components/controls/BasicControls';

type FontOption = string | SelectOption;

const labelOf = (option: FontOption): string => (typeof option === 'object' ? option.label ?? '' : option);

/**
 * As opções do seletor de fonte compostas em runtime: as da lib (o schema, intocado) mais as famílias que o host
 * registrou em `options.fonts.custom`, cada uma logo depois da última opção da mesma categoria (o rótulo termina em
 * `[Categoria]`, como o `FONT_OPTIONS` da lib); categoria sem par vai para o fim. Sem fonte registrada, a lista volta igual.
 */
export function composeFontOptions(base: FontOption[], hostFonts?: HostFontRegistry): FontOption[] {
    if (!hostFonts || hostFonts.fonts.length === 0) return base;
    const options = [...base];
    for (const font of hostFonts.fonts) {
        const suffix = `[${font.category}]`;
        let at = options.length;
        for (let index = options.length - 1; index >= 0; index -= 1) {
            if (labelOf(options[index]).endsWith(suffix)) {
                at = index + 1;
                break;
            }
        }
        options.splice(at, 0, { id: font.value, label: `${font.family} ${suffix}` });
    }
    return options;
}
