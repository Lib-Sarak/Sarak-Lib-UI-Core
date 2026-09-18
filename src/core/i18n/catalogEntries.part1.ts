import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/**
 * Companion de `catalog.ts` (00-mapa-do-modulo §5.2) — um dicionário de dados
 * gigantesco fica ilegível num arquivo só, e o teto de 250 linhas do Clean Code
 * (R9) não isenta `core/i18n/` (só `/presets/themes/`, `/Design/schema/` e
 * `/Design/master-map`). O corte é puramente mecânico, por posição — não é uma
 * fronteira de domínio, é só onde a fita métrica bateu. `catalog.ts` funde as
 * três partes.
 */
export const CATALOG_PART_1 = {
    genericSystemLabel: {
        pt: `Sistema`, en: `System`, es: `Sistema`, fr: `Système`, de: `System`, it: `Sistema`,
    },
    genericModuleLabel: {
        pt: `Módulo`, en: `Module`, es: `Módulo`, fr: `Module`, de: `Modul`, it: `Modulo`,
    },
    genericSearchLabel: {
        pt: `Buscar…`, en: `Search…`, es: `Buscar…`, fr: `Rechercher…`, de: `Suchen…`, it: `Cerca…`,
    },
    genericUserLabel: {
        pt: `Usuário`, en: `User`, es: `Usuario`, fr: `Utilisateur`, de: `Benutzer`, it: `Utente`,
    },
    shellErrorHeading: {
        pt: `Este módulo não pôde ser exibido`,
        en: `This module could not be displayed`,
        es: `Este módulo no pudo mostrarse`,
        fr: `Ce module n'a pas pu être affiché`,
        de: `Dieses Modul konnte nicht angezeigt werden`,
        it: `Questo modulo non può essere visualizzato`,
    },
    shellErrorHint: {
        pt: `Tente recarregar a página.`,
        en: `Try reloading the page.`,
        es: `Intenta recargar la página.`,
        fr: `Essayez de recharger la page.`,
        de: `Versuchen Sie, die Seite neu zu laden.`,
        it: `Prova a ricaricare la pagina.`,
    },
    shellLoading: {
        pt: `Carregando…`, en: `Loading…`, es: `Cargando…`, fr: `Chargement…`, de: `Wird geladen…`, it: `Caricamento…`,
    },
    sidebarOfflineBadge: {
        pt: `Módulo offline`,
        en: `Module offline`,
        es: `Módulo sin conexión`,
        fr: `Module hors ligne`,
        de: `Modul offline`,
        it: `Modulo offline`,
    },
    sidebarOfflineDefaultError: {
        pt: `Erro de conexão`,
        en: `Connection error`,
        es: `Error de conexión`,
        fr: `Erreur de connexion`,
        de: `Verbindungsfehler`,
        it: `Errore di connessione`,
    },
    sidebarOfflineModuleTitle: {
        pt: `Módulo offline: {error}`,
        en: `Offline module: {error}`,
        es: `Módulo sin conexión: {error}`,
        fr: `Module hors ligne : {error}`,
        de: `Modul offline: {error}`,
        it: `Modulo offline: {error}`,
    },
    sidebarResizeHint: {
        pt: `Arraste para redimensionar`,
        en: `Drag to resize`,
        es: `Arrastra para redimensionar`,
        fr: `Faites glisser pour redimensionner`,
        de: `Ziehen zum Anpassen der Größe`,
        it: `Trascina per ridimensionare`,
    },
    topbarResizeHint: {
        pt: `Arraste para ajustar a altura`,
        en: `Drag to adjust the height`,
        es: `Arrastra para ajustar la altura`,
        fr: `Faites glisser pour ajuster la hauteur`,
        de: `Ziehen, um die Höhe anzupassen`,
        it: `Trascina per regolare l'altezza`,
    },
    sidebarNotificationsLabel: {
        pt: `Notificações`, en: `Notifications`, es: `Notificaciones`, fr: `Notifications`, de: `Benachrichtigungen`, it: `Notifiche`,
    },
    shellDefaultModuleCategory: {
        pt: `Módulos do Sistema`,
        en: `System Modules`,
        es: `Módulos del Sistema`,
        fr: `Modules du Système`,
        de: `Systemmodule`,
        it: `Moduli di Sistema`,
    },
    shellContentApiModeMessage: {
        pt: `Módulo em modo API (sem interface local)`,
        en: `Module in API mode (no local interface)`,
        es: `Módulo en modo API (sin interfaz local)`,
        fr: `Module en mode API (sans interface locale)`,
        de: `Modul im API-Modus (keine lokale Oberfläche)`,
        it: `Modulo in modalità API (nessuna interfaccia locale)`,
    },
    shellContentSelectSecondaryModule: {
        pt: `Selecione um módulo secundário`,
        en: `Select a secondary module`,
        es: `Selecciona un módulo secundario`,
        fr: `Sélectionnez un module secondaire`,
        de: `Wählen Sie ein sekundäres Modul aus`,
        it: `Seleziona un modulo secondario`,
    },
    searchPlaceholder: {
        pt: `Buscar ferramenta, registro ou configuração…`,
        en: `Search tool, record or configuration…`,
        es: `Buscar herramienta, registro o configuración…`,
        fr: `Rechercher un outil, un enregistrement ou une configuration…`,
        de: `Werkzeug, Datensatz oder Konfiguration suchen…`,
        it: `Cerca strumento, record o configurazione…`,
    },
    searchAvailableToolsHeading: {
        pt: `Ferramentas disponíveis`,
        en: `Available tools`,
        es: `Herramientas disponibles`,
        fr: `Outils disponibles`,
        de: `Verfügbare Werkzeuge`,
        it: `Strumenti disponibili`,
    },
    searchNoResultsFor: {
        pt: `Nenhum resultado para "{query}"`,
        en: `No results for "{query}"`,
        es: `Sin resultados para "{query}"`,
        fr: `Aucun résultat pour « {query} »`,
        de: `Keine Ergebnisse für „{query}"`,
        it: `Nessun risultato per "{query}"`,
    },
    searchCloseHint: {
        pt: `Fechar`, en: `Close`, es: `Cerrar`, fr: `Fermer`, de: `Schließen`, it: `Chiudi`,
    },
    searchNavigateHint: {
        pt: `Navegar`, en: `Navigate`, es: `Navegar`, fr: `Parcourir`, de: `Navigieren`, it: `Naviga`,
    },
    searchEngineLabel: {
        pt: `Motor de Busca`,
        en: `Search Engine`,
        es: `Motor de Búsqueda`,
        fr: `Moteur de recherche`,
        de: `Suchmaschine`,
        it: `Motore di ricerca`,
    },
    searchEngineBrandedLabel: {
        pt: `{systemName} Motor de Busca`,
        en: `{systemName} Search Engine`,
        es: `{systemName} Motor de Búsqueda`,
        fr: `{systemName} Moteur de recherche`,
        de: `{systemName} Suchmaschine`,
        it: `{systemName} Motore di ricerca`,
    },
    shellSearchWidgetTitle: {
        pt: `Buscar (Ctrl + K)`,
        en: `Search (Ctrl + K)`,
        es: `Buscar (Ctrl + K)`,
        fr: `Rechercher (Ctrl + K)`,
        de: `Suchen (Strg + K)`,
        it: `Cerca (Ctrl + K)`,
    },
    shellSearchWidgetPlaceholder: {
        pt: `Busca inteligente…`,
        en: `Smart search…`,
        es: `Búsqueda inteligente…`,
        fr: `Recherche intelligente…`,
        de: `Intelligente Suche…`,
        it: `Ricerca intelligente…`,
    },
} satisfies Record<string, LibraryTextEntry>;
