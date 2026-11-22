import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Textos do campo de busca, do bloco global da decisão Layout (preferências, barra de preferências, identidade) e da nota mestre × canto dos raios. */
export const CATALOG_PANEL_LITERALS = {
    themeSearchPlaceholder: { pt: 'Buscar token...', en: 'Search setting...', es: 'Buscar ajuste...', fr: 'Rechercher un réglage...', de: 'Einstellung suchen...', it: 'Cerca impostazione...' },
    globalSettingsPreferences: { pt: 'Preferências Globais', en: 'Global preferences', es: 'Preferencias globales', fr: 'Préférences globales', de: 'Globale Einstellungen', it: 'Preferenze globali' },
    globalSettingsUserBar: { pt: 'Barra de Preferências do Usuário', en: 'User preferences bar', es: 'Barra de preferencias del usuario', fr: 'Barre de préférences de l’utilisateur', de: 'Einstellungsleiste des Benutzers', it: 'Barra delle preferenze dell’utente' },
    globalSettingsBrandTitle: { pt: 'Identidade da Empresa', en: 'Company identity', es: 'Identidad de la empresa', fr: 'Identité de l’entreprise', de: 'Firmenidentität', it: 'Identità aziendale' },
    globalSettingsCompanyName: { pt: 'Nome da Empresa (Topo/Sidebar)', en: 'Company name (Topbar/Sidebar)', es: 'Nombre de la empresa (Topbar/Sidebar)', fr: 'Nom de l’entreprise (Topbar/Sidebar)', de: 'Firmenname (Topbar/Sidebar)', it: 'Nome dell’azienda (Topbar/Sidebar)' },
    globalSettingsLoginName: { pt: 'Nome no Login', en: 'Name on the login screen', es: 'Nombre en el inicio de sesión', fr: 'Nom sur l’écran de connexion', de: 'Name auf der Anmeldeseite', it: 'Nome nella schermata di accesso' },
    globalSettingsTabName: { pt: 'Aba do Navegador', en: 'Browser tab', es: 'Pestaña del navegador', fr: 'Onglet du navigateur', de: 'Browser-Tab', it: 'Scheda del browser' },
    globalSettingsLogo: { pt: 'Logotipo (Mídia Híbrida)', en: 'Logo (hybrid media)', es: 'Logotipo (medio híbrido)', fr: 'Logo (média hybride)', de: 'Logo (Hybridmedium)', it: 'Logo (media ibrido)' },
    exceptionFollowsMaster: { pt: 'Segue o mestre: {master}.', en: 'Follows the master: {master}.', es: 'Sigue al maestro: {master}.', fr: 'Suit le maître : {master}.', de: 'Folgt dem Hauptwert: {master}.', it: 'Segue il principale: {master}.' },
    exceptionOwnValue: { pt: 'Valor próprio: ignora o mestre ({master}).', en: 'Own value: ignores the master ({master}).', es: 'Valor propio: ignora al maestro ({master}).', fr: 'Valeur propre : ignore le maître ({master}).', de: 'Eigener Wert: ignoriert den Hauptwert ({master}).', it: 'Valore proprio: ignora il principale ({master}).' },
    exceptionBackToMaster: { pt: 'Voltar ao mestre', en: 'Back to master', es: 'Volver al maestro', fr: 'Revenir au maître', de: 'Zurück zum Hauptwert', it: 'Torna al principale' },
    exceptionGoverns: { pt: 'Governa {total} cantos; nenhum tem valor próprio.', en: 'Controls {total} corners; none has its own value.', es: 'Gobierna {total} esquinas; ninguna tiene valor propio.', fr: 'Régit {total} coins ; aucun n’a de valeur propre.', de: 'Steuert {total} Ecken; keine hat einen eigenen Wert.', it: 'Governa {total} angoli; nessuno ha un valore proprio.' },
    exceptionDeclaredCount: { pt: '{declared} de {total} cantos têm valor próprio e não seguem este controle.', en: '{declared} of {total} corners have their own value and do not follow this control.', es: '{declared} de {total} esquinas tienen valor propio y no siguen este control.', fr: '{declared} coins sur {total} ont une valeur propre et ne suivent pas ce contrôle.', de: '{declared} von {total} Ecken haben einen eigenen Wert und folgen diesem Regler nicht.', it: '{declared} angoli su {total} hanno un valore proprio e non seguono questo controllo.' },
    exceptionAllBackToMaster: { pt: 'Voltar todos ao mestre', en: 'Send all back to master', es: 'Devolver todos al maestro', fr: 'Tout renvoyer au maître', de: 'Alle zum Hauptwert zurück', it: 'Riporta tutti al principale' },
} satisfies Record<string, LibraryTextEntry>;
