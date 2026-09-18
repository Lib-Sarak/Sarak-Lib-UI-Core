import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Companion de `catalog.ts` — ver o cabeçalho de `catalogEntries.part1.ts`. */
export const CATALOG_PART_3 = {
    themeToggleLabelLight: {
        pt: `Modo Claro`, en: `Light Mode`, es: `Modo Claro`, fr: `Mode Clair`, de: `Heller Modus`, it: `Modalità Chiara`,
    },
    themeToggleLabelDark: {
        pt: `Modo Escuro`, en: `Dark Mode`, es: `Modo Oscuro`, fr: `Mode Sombre`, de: `Dunkler Modus`, it: `Modalità Scura`,
    },
    fontSizeGroupAriaLabel: {
        pt: `Tamanho da fonte`,
        en: `Font size`,
        es: `Tamaño de fuente`,
        fr: `Taille de police`,
        de: `Schriftgröße`,
        it: `Dimensione del carattere`,
    },
    fontSizeSmallAbbrev: {
        pt: `P`, en: `S`, es: `P`, fr: `P`, de: `K`, it: `P`,
    },
    fontSizeSmallFull: {
        pt: `Pequena`, en: `Small`, es: `Pequeña`, fr: `Petite`, de: `Klein`, it: `Piccola`,
    },
    fontSizeMediumAbbrev: {
        pt: `M`, en: `M`, es: `M`, fr: `M`, de: `M`, it: `M`,
    },
    fontSizeMediumFull: {
        pt: `Média`, en: `Medium`, es: `Mediana`, fr: `Moyenne`, de: `Mittel`, it: `Media`,
    },
    fontSizeLargeAbbrev: {
        pt: `G`, en: `L`, es: `G`, fr: `G`, de: `G`, it: `G`,
    },
    fontSizeLargeFull: {
        pt: `Grande`, en: `Large`, es: `Grande`, fr: `Grande`, de: `Groß`, it: `Grande`,
    },
    navigationStyleGroupAriaLabel: {
        pt: `Estilo de navegação`,
        en: `Navigation style`,
        es: `Estilo de navegación`,
        fr: `Style de navigation`,
        de: `Navigationsstil`,
        it: `Stile di navigazione`,
    },
    navigationStyleSidebarLabel: {
        pt: `Lateral`, en: `Sidebar`, es: `Lateral`, fr: `Latérale`, de: `Seitenleiste`, it: `Laterale`,
    },
    navigationStyleTopbarLabel: {
        pt: `Topo`, en: `Top`, es: `Superior`, fr: `Haut`, de: `Oben`, it: `Alto`,
    },
    preferenceNavigationStyleRowLabel: {
        pt: `Navegação`, en: `Navigation`, es: `Navegación`, fr: `Navigation`, de: `Navigation`, it: `Navigazione`,
    },
    preferencesLabel: {
        pt: `Preferências`, en: `Preferences`, es: `Preferencias`, fr: `Préférences`, de: `Einstellungen`, it: `Preferenze`,
    },
    preferencesCloseAriaLabel: {
        pt: `Fechar preferências`,
        en: `Close preferences`,
        es: `Cerrar preferencias`,
        fr: `Fermer les préférences`,
        de: `Einstellungen schließen`,
        it: `Chiudi preferenze`,
    },
    userLogoutTitle: {
        pt: `Sair`, en: `Logout`, es: `Cerrar sesión`, fr: `Déconnexion`, de: `Abmelden`, it: `Esci`,
    },
    userRoleMaster: {
        pt: `Master`, en: `Master`, es: `Master`, fr: `Master`, de: `Master`, it: `Master`,
    },
    userRoleAdmin: {
        pt: `Administrador`, en: `Admin`, es: `Administrador`, fr: `Administrateur`, de: `Administrator`, it: `Amministratore`,
    },
    languageSelectorLabel: {
        pt: `Idioma`, en: `Language`, es: `Idioma`, fr: `Langue`, de: `Sprache`, it: `Lingua`,
    },
    emptyStateMinimalCaption: {
        pt: `Aguardando interação do sistema…`,
        en: `Waiting for system interaction…`,
        es: `Esperando interacción del sistema…`,
        fr: `En attente d'interaction avec le système…`,
        de: `Warten auf Systeminteraktion…`,
        it: `In attesa di interazione con il sistema…`,
    },
    emptyStateGeometricTitle: {
        pt: `VAZIO`, en: `VOID`, es: `VACÍO`, fr: `VIDE`, de: `LEER`, it: `VUOTO`,
    },
    emptyStateGeometricCaption: {
        pt: `Inicie um módulo na barra de ferramentas`,
        en: `Start a module in the toolbar`,
        es: `Inicia un módulo en la barra de herramientas`,
        fr: `Démarrez un module dans la barre d'outils`,
        de: `Starten Sie ein Modul in der Werkzeugleiste`,
        it: `Avvia un modulo nella barra degli strumenti`,
    },
    emptyStateAbstractCaptionLine1: {
        pt: `O ecossistema está em equilíbrio.`,
        en: `The ecosystem is in harmony.`,
        es: `El ecosistema está en equilibrio.`,
        fr: `L'écosystème est en harmonie.`,
        de: `Das Ökosystem ist im Gleichgewicht.`,
        it: `L'ecosistema è in equilibrio.`,
    },
    emptyStateAbstractCaptionLine2: {
        pt: `Nenhum sinal detectado na janela principal.`,
        en: `No signal detected in the main viewport.`,
        es: `No se detectó señal en la ventana principal.`,
        fr: `Aucun signal détecté dans la fenêtre principale.`,
        de: `Kein Signal im Hauptfenster erkannt.`,
        it: `Nessun segnale rilevato nella finestra principale.`,
    },
} satisfies Record<string, LibraryTextEntry>;
