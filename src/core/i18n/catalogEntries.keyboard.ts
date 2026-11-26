import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Nomes acessíveis do teclado e do leitor de tela no cromo e no painel: o botão de ajuda de um controle e a gaveta móvel. */
export const CATALOG_KEYBOARD = {
    helpTooltipLabel: {
        pt: 'Ajuda: {label}', en: 'Help: {label}', es: 'Ayuda: {label}',
        fr: 'Aide : {label}', de: 'Hilfe: {label}', it: 'Aiuto: {label}',
    },
    chromeDrawerLabel: {
        pt: 'Menu de navegação', en: 'Navigation menu', es: 'Menú de navegación',
        fr: 'Menu de navigation', de: 'Navigationsmenü', it: 'Menu di navigazione',
    },
    actionCardToggleDetails: {
        pt: 'Mostrar ou ocultar detalhes', en: 'Show or hide details', es: 'Mostrar u ocultar detalles',
        fr: 'Afficher ou masquer les détails', de: 'Details ein- oder ausblenden', it: 'Mostra o nascondi i dettagli',
    },
} satisfies Record<string, LibraryTextEntry>;
