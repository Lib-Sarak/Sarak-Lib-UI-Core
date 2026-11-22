import { TokenCatalog } from '../Design/catalog';
import { MASTER_DESIGN_MAP } from '../Design/master-map';
import type { SarakLibraryLanguage } from './catalog.types';
import { DECISION_TOKEN_DESCRIPTIONS } from './catalogEntries.decisionTokenDescriptions';

type Entry = Record<SarakLibraryLanguage, string>;

/** Rótulos das decisões principais. O pt de nome e descrição preserva o catálogo atual; os outros idiomas são textos próprios do painel. */
const LABELS: Record<string, Omit<Entry, 'pt'>> = {
    textColorMaster: { en: 'Main text', es: 'Texto principal', fr: 'Texte principal', de: 'Haupttext', it: 'Testo principale' },
    subtitleColor: { en: 'Subtitle color', es: 'Color del subtítulo', fr: 'Couleur du sous-titre', de: 'Untertitelfarbe', it: 'Colore del sottotitolo' },
    emphasisColor: { en: 'Emphasis color', es: 'Color de énfasis', fr: 'Couleur d’accentuation', de: 'Akzentfarbe', it: 'Colore di enfasi' },
    primaryColor: { en: 'Primary color', es: 'Color primario', fr: 'Couleur principale', de: 'Primärfarbe', it: 'Colore primario' },
    secondaryColor: { en: 'Secondary color', es: 'Color secundario', fr: 'Couleur secondaire', de: 'Sekundärfarbe', it: 'Colore secondario' },
    colorPalette: { en: 'Color palette', es: 'Paleta de colores', fr: 'Palette de couleurs', de: 'Farbpalette', it: 'Palette di colori' },
    keepPalette: { en: 'Keep my palette', es: 'Conservar mi paleta', fr: 'Conserver ma palette', de: 'Meine Palette beibehalten', it: 'Mantieni la mia palette' },
    bgBaseColor: { en: 'Base background color', es: 'Color de fondo base', fr: 'Couleur de fond de base', de: 'Grundhintergrundfarbe', it: 'Colore di sfondo base' },
    surfaceMaterial: { en: 'Surface material', es: 'Material de superficie', fr: 'Matériau de surface', de: 'Oberflächenmaterial', it: 'Materiale della superficie' },
    borderType: { en: 'Border style', es: 'Estilo del borde', fr: 'Style de bordure', de: 'Rahmenstil', it: 'Stile del bordo' },
    systemTone: { en: 'System tone', es: 'Tono del sistema', fr: 'Ton du système', de: 'Systemton', it: 'Tono del sistema' },
    texture: { en: 'Global texture', es: 'Textura global', fr: 'Texture globale', de: 'Globale Textur', it: 'Trama globale' },
    cardBackgroundColor: { en: 'Card background', es: 'Fondo de las tarjetas', fr: 'Fond des cartes', de: 'Kartenhintergrund', it: 'Sfondo delle schede' },
    shadowIntensity: { en: 'Shadow intensity', es: 'Intensidad de sombra', fr: 'Intensité de l’ombre', de: 'Schattenintensität', it: 'Intensità dell’ombra' },
    mode: { en: 'System theme', es: 'Tema del sistema', fr: 'Thème du système', de: 'Systemthema', it: 'Tema del sistema' },
    bodySize: { en: 'Global font size (Body)', es: 'Tamaño global de las fuentes (Body)', fr: 'Taille globale des polices (Body)', de: 'Globale Schriftgröße (Body)', it: 'Dimensione globale dei font (Body)' },
    savedPalettes: { en: 'Saved palettes', es: 'Paletas guardadas', fr: 'Palettes enregistrées', de: 'Gespeicherte Paletten', it: 'Palette salvate' },
    h1Size: { en: 'H1 size', es: 'Tamaño H1', fr: 'Taille H1', de: 'H1-Größe', it: 'Dimensione H1' },
    headingFont: { en: 'Heading font', es: 'Fuente de títulos', fr: 'Police des titres', de: 'Überschriften-Schrift', it: 'Font dei titoli' },
    bodyFont: { en: 'Body font', es: 'Fuente de texto', fr: 'Police du corps', de: 'Fließtext-Schrift', it: 'Font del testo' },
    cardTextureType: { en: 'Card surface texture', es: 'Textura de las tarjetas', fr: 'Texture de surface des cartes', de: 'Kartenoberflächentextur', it: 'Trama della superficie delle schede' },
    cardBorderRadius: { en: 'Card corner radius', es: 'Radio de borde de las tarjetas', fr: 'Rayon des coins des cartes', de: 'Eckenradius der Karten', it: 'Raggio degli angoli delle schede' },
    btnBorderRadius: { en: 'Button corner radius', es: 'Radio de borde de los botones', fr: 'Rayon des coins des boutons', de: 'Eckenradius der Schaltflächen', it: 'Raggio degli angoli dei pulsanti' },
    btnStyleType: { en: 'Button style', es: 'Estilo de botón', fr: 'Style de bouton', de: 'Schaltflächenstil', it: 'Stile del pulsante' },
    navigationStyle: { en: 'Navigation layout', es: 'Estructura de navegación', fr: 'Structure de navigation', de: 'Navigationsaufbau', it: 'Struttura di navigazione' },
    mobileNavigationStyle: { en: 'Mobile navigation', es: 'Navegación móvil', fr: 'Navigation mobile', de: 'Navigation auf dem Smartphone', it: 'Navigazione mobile' },
    sidebarPosition: { en: 'Sidebar position', es: 'Posición de la Sidebar', fr: 'Position de la Sidebar', de: 'Position der Sidebar', it: 'Posizione della Sidebar' },
    sidebarWidth: { en: 'Sidebar width', es: 'Ancho de la Sidebar', fr: 'Largeur de la Sidebar', de: 'Breite der Sidebar', it: 'Larghezza della Sidebar' },
    navbarLayout: { en: 'Topbar behavior', es: 'Comportamiento de la Topbar', fr: 'Comportement de Topbar', de: 'Verhalten der Topbar', it: 'Comportamento della Topbar' },
    sidebarTone: { en: 'Sidebar color role', es: 'Rol de color de la Sidebar', fr: 'Rôle de couleur de Sidebar', de: 'Farbrolle der Sidebar', it: 'Ruolo colore della Sidebar' },
    topbarTone: { en: 'Topbar color role', es: 'Rol de color de la Topbar', fr: 'Rôle de couleur de Topbar', de: 'Farbrolle der Topbar', it: 'Ruolo colore della Topbar' },
    sidebarActiveItemStyle: { en: 'Active Sidebar item style', es: 'Estilo del elemento activo en Sidebar', fr: 'Style de l’élément actif dans Sidebar', de: 'Stil des aktiven Eintrags in der Sidebar', it: 'Stile dell’elemento attivo in Sidebar' },
    sidebarActiveGlass: { en: 'Active item glass effect', es: 'Efecto de vidrio del elemento activo', fr: 'Effet de verre de l’élément actif', de: 'Glaseffekt des aktiven Eintrags', it: 'Effetto vetro dell’elemento attivo' },
    topbarActiveItemStyle: { en: 'Active Topbar item style', es: 'Estilo del elemento activo en Topbar', fr: 'Style de l’élément actif dans Topbar', de: 'Stil des aktiven Eintrags in der Topbar', it: 'Stile dell’elemento attivo in Topbar' },
    sidebarBorderSide: { en: 'Sidebar border sides', es: 'Lados del borde de Sidebar', fr: 'Côtés de la bordure de Sidebar', de: 'Rahmenseiten der Sidebar', it: 'Lati del bordo di Sidebar' },
    sidebarBorderStyle: { en: 'Sidebar border style', es: 'Estilo del borde de Sidebar', fr: 'Style de bordure de Sidebar', de: 'Rahmenstil der Sidebar', it: 'Stile del bordo di Sidebar' },
    sidebarBackgroundStyle: { en: 'Sidebar background style', es: 'Estilo del fondo de Sidebar', fr: 'Style du fond de Sidebar', de: 'Hintergrundstil der Sidebar', it: 'Stile dello sfondo di Sidebar' },
    topbarBackgroundStyle: { en: 'Topbar background style', es: 'Estilo del fondo de Topbar', fr: 'Style du fond de Topbar', de: 'Hintergrundstil der Topbar', it: 'Stile dello sfondo di Topbar' },
    sidebarItemDensity: { en: 'Sidebar item spacing', es: 'Espaciado de elementos de Sidebar', fr: 'Espacement des éléments de Sidebar', de: 'Abstand der Sidebar-Einträge', it: 'Spaziatura degli elementi di Sidebar' },
    topbarItemDensity: { en: 'Topbar item spacing', es: 'Espaciado de elementos de Topbar', fr: 'Espacement des éléments de Topbar', de: 'Abstand der Topbar-Einträge', it: 'Spaziatura degli elementi di Topbar' },
    chromeSearchPosition: { en: 'Search placement', es: 'Ubicación de la búsqueda', fr: 'Position de la recherche', de: 'Position der Suche', it: 'Posizione della ricerca' },
    chromeUserPosition: { en: 'User placement', es: 'Ubicación del usuario', fr: 'Position de l’utilisateur', de: 'Position des Benutzerbereichs', it: 'Posizione dell’utente' },
    chromeNotificationsPosition: { en: 'Notifications placement', es: 'Ubicación de las notificaciones', fr: 'Position des notifications', de: 'Position der Benachrichtigungen', it: 'Posizione delle notifiche' },
    userAvatarStyle: { en: 'User avatar style', es: 'Estilo del avatar de usuario', fr: 'Style de l’avatar utilisateur', de: 'Stil des Benutzer-Avatars', it: 'Stile dell’avatar utente' },
    preferenceModePosition: { en: 'Color mode preference placement', es: 'Ubicación de la preferencia de modo', fr: 'Position du choix du mode de couleur', de: 'Position der Farbmodus-Einstellung', it: 'Posizione della preferenza modalità colore' },
    preferenceFontSizePosition: { en: 'Font size preference placement', es: 'Ubicación del tamaño de fuente', fr: 'Position du choix de taille de police', de: 'Position der Schriftgrößen-Einstellung', it: 'Posizione della preferenza dimensione font' },
    preferenceNavigationStylePosition: { en: 'Navigation preference placement', es: 'Ubicación de la preferencia de navegación', fr: 'Position du choix de navigation', de: 'Position der Navigationseinstellung', it: 'Posizione della preferenza di navigazione' },
    preferenceNavCollapsePosition: { en: 'Navigation collapse control placement', es: 'Ubicación del control para contraer navegación', fr: 'Position du contrôle de réduction de navigation', de: 'Position des Einklapp-Steuerelements', it: 'Posizione del controllo di riduzione navigazione' },
    preferenceNavCollapsePositionTopbar: { en: 'Topbar menu control placement', es: 'Ubicación del control de menú superior', fr: 'Position du contrôle de menu supérieur', de: 'Position der Menüsteuerung oben', it: 'Posizione del controllo menu superiore' },
    preferenceLanguagePosition: { en: 'Language preference placement', es: 'Ubicación de la preferencia de idioma', fr: 'Position du choix de langue', de: 'Position der Spracheinstellung', it: 'Posizione della preferenza lingua' },
    preferenceFontSizeReduction: { en: 'Small font size step', es: 'Reducción del tamaño pequeño', fr: 'Réduction de la petite taille', de: 'Verkleinerung der Schriftgröße', it: 'Riduzione della dimensione piccola' },
    preferenceFontSizeIncrease: { en: 'Large font size step', es: 'Aumento del tamaño grande', fr: 'Augmentation de la grande taille', de: 'Vergrößerung der Schriftgröße', it: 'Aumento della dimensione grande' },
    sidebarLogoPlacement: { en: 'Sidebar brand placement', es: 'Ubicación de la marca en la Sidebar', fr: 'Position de la marque Sidebar', de: 'Position der Marke in der Sidebar', it: 'Posizione del marchio Sidebar' },
    brandDisplay: { en: 'Brand display', es: 'Visualización de marca', fr: 'Affichage de la marque', de: 'Markendarstellung', it: 'Visualizzazione del marchio' },
    shellBrandLogoSize: { en: 'Brand logo height', es: 'Altura del logotipo de marca', fr: 'Hauteur du logo de marque', de: 'Höhe des Markenlogos', it: 'Altezza del logo del marchio' },
    brandLogoSizeCollapsed: { en: 'Collapsed brand logo height', es: 'Altura del logotipo contraído', fr: 'Hauteur du logo en mode réduit', de: 'Höhe des eingeklappten Markenlogos', it: 'Altezza del logo con navigazione ridotta' },
    sidebarLabelMaxWidth: { en: 'Maximum Sidebar label width', es: 'Ancho máximo de la etiqueta de la Sidebar', fr: 'Largeur maximale du libellé Sidebar', de: 'Maximale Breite der Sidebar-Beschriftung', it: 'Larghezza massima dell’etichetta Sidebar' },
    isNavHidden: { en: 'Collapsed navigation', es: 'Navegación contraída', fr: 'Navigation réduite', de: 'Eingeklappte Navigation', it: 'Navigazione ridotta' },
    sidebarResizable: { en: 'Resizable sidebar', es: 'Sidebar redimensionable', fr: 'Sidebar redimensionnable', de: 'Größenveränderbare Sidebar', it: 'Sidebar ridimensionabile' },
    isAutoHideEnabled: { en: 'Auto-hide navigation', es: 'Ocultar navegación automáticamente', fr: 'Masquer automatiquement la navigation', de: 'Navigation automatisch ausblenden', it: 'Nascondi automaticamente la navigazione' },
};

const TOKENS = new Map(TokenCatalog.map((entry) => [entry.tokenId, entry]));
const SCHEMA_TOKENS = new Map(MASTER_DESIGN_MAP.components.flatMap((component) => component.tokens.map((token) => [token.id, token] as const)));
const catalogEntries = Object.fromEntries(Object.entries(LABELS).flatMap(([tokenId, translated]) => {
    const source = TOKENS.get(tokenId);
    const schema = SCHEMA_TOKENS.get(tokenId);
    const names: Entry = { pt: source?.name ?? schema?.label ?? tokenId, ...translated };
    const translatedDescriptions = DECISION_TOKEN_DESCRIPTIONS[tokenId];
    const descriptions: Entry = { pt: source?.description ?? schema?.description ?? '', ...translatedDescriptions };
    return [
        [`decisionToken_${tokenId}_name`, names],
        [`decisionToken_${tokenId}_description`, descriptions],
    ];
})) as Record<string, Entry>;

export const CATALOG_DECISION_TOKENS = catalogEntries satisfies Record<string, Entry>;
export const decisionTokenTextKey = (tokenId: string, field: 'name' | 'description'): string => `decisionToken_${tokenId}_${field}`;
export const DECISION_TOKEN_IDS = Object.keys(LABELS);

