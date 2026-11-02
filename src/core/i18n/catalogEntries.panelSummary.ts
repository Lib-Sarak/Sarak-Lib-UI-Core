import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** A linha de valor de cada decisão na coluna do painel: o nome legível do que vale agora, nunca o id do token. */
export const CATALOG_PANEL_SUMMARY = {
    summaryLayout: {
        pt: 'Navegação: {style}', en: 'Navigation: {style}', es: 'Navegación: {style}',
        fr: 'Navigation : {style}', de: 'Navigation: {style}', it: 'Navigazione: {style}',
    },
    summaryComponents: {
        pt: 'Botão {button} · Campo {field}', en: 'Button {button} · Field {field}', es: 'Botón {button} · Campo {field}',
        fr: 'Bouton {button} · Champ {field}', de: 'Schaltfläche {button} · Feld {field}', it: 'Pulsante {button} · Campo {field}',
    },
    summaryNavSidebar: { pt: 'lateral', en: 'side', es: 'lateral', fr: 'latérale', de: 'seitlich', it: 'laterale' },
    summaryNavTopbar: { pt: 'no topo', en: 'top', es: 'superior', fr: 'en haut', de: 'oben', it: 'in alto' },
    summaryDensityCompact: { pt: 'Compacta', en: 'Compact', es: 'Compacta', fr: 'Compacte', de: 'Kompakt', it: 'Compatta' },
    summaryDensityComfortable: { pt: 'Confortável', en: 'Comfortable', es: 'Cómoda', fr: 'Confortable', de: 'Komfortabel', it: 'Confortevole' },
    summaryDensitySpacious: { pt: 'Espaçosa', en: 'Spacious', es: 'Espaciosa', fr: 'Spacieuse', de: 'Großzügig', it: 'Spaziosa' },
    summaryMaterialFrosted: { pt: 'Vidro fosco', en: 'Frosted glass', es: 'Vidrio esmerilado', fr: 'Verre dépoli', de: 'Milchglas', it: 'Vetro satinato' },
    summaryMaterialSleek: { pt: 'Polido', en: 'Polished', es: 'Pulido', fr: 'Poli', de: 'Poliert', it: 'Lucido' },
    summaryMaterialIndustrial: { pt: 'Chapa industrial', en: 'Industrial plate', es: 'Chapa industrial', fr: 'Tôle industrielle', de: 'Industrieblech', it: 'Lamiera industriale' },
    summaryMaterialOrganic: { pt: 'Orgânico fosco', en: 'Matte organic', es: 'Orgánico mate', fr: 'Organique mat', de: 'Organisch matt', it: 'Organico opaco' },
    summaryButtonMatte: { pt: 'fosco', en: 'matte', es: 'mate', fr: 'mat', de: 'matt', it: 'opaco' },
    summaryButtonNeon: { pt: 'neon', en: 'neon', es: 'neón', fr: 'néon', de: 'Neon', it: 'neon' },
    summaryButtonFrosted: { pt: 'de vidro', en: 'glass', es: 'de vidrio', fr: 'verre', de: 'Glas', it: 'in vetro' },
    summaryButtonBorderline: { pt: 'de contorno', en: 'outline', es: 'de contorno', fr: 'contour', de: 'Kontur', it: 'a contorno' },
    summaryButtonCyberpunk: { pt: 'aramado', en: 'wireframe', es: 'de alambre', fr: 'filaire', de: 'Drahtgitter', it: 'wireframe' },
    summaryButtonNeumorphism: { pt: 'suave', en: 'soft', es: 'suave', fr: 'doux', de: 'weich', it: 'morbido' },
    summaryFieldSolid: { pt: 'contornado', en: 'outlined', es: 'con contorno', fr: 'avec contour', de: 'umrandet', it: 'con contorno' },
    summaryFieldDashed: { pt: 'tracejado', en: 'dashed', es: 'punteado', fr: 'en pointillés', de: 'gestrichelt', it: 'tratteggiato' },
    summaryFieldNone: { pt: 'sem borda', en: 'borderless', es: 'sin borde', fr: 'sans bordure', de: 'randlos', it: 'senza bordo' },
    summaryFieldUnderline: { pt: 'sublinhado', en: 'underlined', es: 'subrayado', fr: 'souligné', de: 'unterstrichen', it: 'sottolineato' },
} satisfies Record<string, LibraryTextEntry>;
