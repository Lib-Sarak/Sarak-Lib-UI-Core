import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Companion de `catalog.ts` — ver o cabeçalho de `catalogEntries.part1.ts`. */
export const CATALOG_PART_3 = {
    themeSaveDialogTitle: {
        pt: `Salvar tema`, en: `Save theme`, es: `Guardar tema`, fr: `Enregistrer le thème`, de: `Theme speichern`, it: `Salva tema`,
    },
    themeExportDialogTitle: {
        pt: `Exportar tema (JSON)`, en: `Export theme (JSON)`, es: `Exportar tema (JSON)`, fr: `Exporter le thème (JSON)`, de: `Thema exportieren (JSON)`, it: `Esporta tema (JSON)`,
    },
    themeExportJsonAction: {
        pt: `Exportar JSON`, en: `Export JSON`, es: `Exportar JSON`, fr: `Exporter JSON`, de: `JSON exportieren`, it: `Esporta JSON`,
    },
    themeSaveAction: {
        pt: `Salvar`, en: `Save`, es: `Guardar`, fr: `Enregistrer`, de: `Speichern`, it: `Salva`,
    },
    themeSaveAsNewAction: {
        pt: `Salvar como novo`, en: `Save as new`, es: `Guardar como nuevo`, fr: `Enregistrer comme nouveau`, de: `Als neu speichern`, it: `Salva come nuovo`,
    },
    themeDuplicateAction: {
        pt: `Duplicar`, en: `Duplicate`, es: `Duplicar`, fr: `Dupliquer`, de: `Duplizieren`, it: `Duplica`,
    },
    themeCreateAction: {
        pt: `Novo tema`, en: `New theme`, es: `Nuevo tema`, fr: `Nouveau thème`, de: `Neues Thema`, it: `Nuovo tema`,
    },
    themeDeleteAction: {
        pt: `Apagar tema`, en: `Delete theme`, es: `Eliminar tema`, fr: `Supprimer le thème`, de: `Thema löschen`, it: `Elimina tema`,
    },
    themeNameLabel: {
        pt: `Nome do tema`, en: `Theme name`, es: `Nombre del tema`, fr: `Nom du thème`, de: `Themenname`, it: `Nome del tema`,
    },
    themeSavingState: {
        pt: `Salvando…`, en: `Saving…`, es: `Guardando…`, fr: `Enregistrement…`, de: `Wird gespeichert…`, it: `Salvataggio…`,
    },
    themeExportDescription: {
        pt: `Exporte o tema completo em JSON para incluí-lo no código do importador por meio de customThemes.`,
        en: `Export the complete theme as JSON to include it in the importer code through customThemes.`,
        es: `Exporta el tema completo como JSON para incluirlo en el código del importador mediante customThemes.`,
        fr: `Exportez le thème complet en JSON pour l'inclure dans le code de l'importateur via customThemes.`,
        de: `Exportiere das vollständige Theme als JSON, um es über customThemes in den Importercode aufzunehmen.`,
        it: `Esporta il tema completo in JSON per includerlo nel codice dell'importatore tramite customThemes.`,
    },
    themeRuntimeSaveDescription: {
        pt: `O tema será salvo pelo importador e ficará disponível na coleção devolvida por customThemes.`,
        en: `The importer will save the theme and make it available in the collection returned through customThemes.`,
        es: `El importador guardará el tema y estará disponible en la colección devuelta mediante customThemes.`,
        fr: `L'importateur enregistrera le thème, qui sera disponible dans la collection renvoyée via customThemes.`,
        de: `Der Importer speichert das Theme; es ist in der über customThemes zurückgegebenen Sammlung verfügbar.`,
        it: `L'importatore salverà il tema, disponibile nella raccolta restituita tramite customThemes.`,
    },
    themeSaveActionGroupLabel: {
        pt: `Ação de salvamento`, en: `Save action`, es: `Acción de guardado`, fr: `Action d’enregistrement`, de: `Speicheraktion`, it: `Azione di salvataggio`,
    },
    themeSaveDifferentNameRequired: {
        pt: `Use um nome diferente para salvar como novo tema.`, en: `Choose a different name to save as a new theme.`, es: `Elige un nombre distinto para guardar un tema nuevo.`, fr: `Choisissez un nom différent pour enregistrer un nouveau thème.`, de: `Verwenden Sie einen anderen Namen, um ein neues Theme zu speichern.`, it: `Usa un nome diverso per salvare un nuovo tema.`,
    },
    themeSaveImporterSourceRequired: {
        pt: `Selecione um tema do importador para substituí-lo.`, en: `Select an importer theme to replace.`, es: `Selecciona un tema del importador para reemplazarlo.`, fr: `Sélectionnez un thème de l’importateur à remplacer.`, de: `Wählen Sie ein Importer-Theme zum Ersetzen aus.`, it: `Seleziona un tema dell’importatore da sostituire.`,
    },
    themeSavedActivated: {
        pt: `Tema “{name}” salvo e ativado.`, en: `Theme “{name}” saved and activated.`, es: `Tema “{name}” guardado y activado.`, fr: `Thème « {name} » enregistré et activé.`, de: `Theme „{name}“ gespeichert und aktiviert.`, it: `Tema “{name}” salvato e attivato.`,
    },
    themeIdAdjusted: {
        pt: `O id já estava em uso; foi ajustado para “{id}”.`, en: `The id was already in use, so it was changed to “{id}”.`, es: `El id ya estaba en uso; se cambió a “{id}”.`, fr: `L’identifiant était déjà utilisé ; il a été remplacé par « {id} ».`, de: `Die ID war bereits vergeben und wurde zu „{id}“ geändert.`, it: `L’id era già in uso ed è stato modificato in “{id}”.`,
    },
    themeDeleteConfirmTitle: {
        pt: `Apagar tema?`, en: `Delete theme?`, es: `¿Eliminar tema?`, fr: `Supprimer le thème ?`, de: `Theme löschen?`, it: `Eliminare il tema?`,
    },
    themeDeleteConfirmMessage: {
        pt: `Apagar o tema “{name}”?`, en: `Delete the theme “{name}”?`, es: `¿Eliminar el tema “{name}”?`, fr: `Supprimer le thème « {name} » ?`, de: `Das Theme „{name}“ löschen?`, it: `Eliminare il tema “{name}”?`,
    },
    themeDeleted: {
        pt: `Tema apagado.`, en: `Theme deleted.`, es: `Tema eliminado.`, fr: `Thème supprimé.`, de: `Theme gelöscht.`, it: `Tema eliminato.`,
    },
    themeDeletedAndDefaultActivated: {
        pt: `Tema apagado. O tema padrão foi ativado.`, en: `Theme deleted. The default theme is now active.`, es: `Tema eliminado. El tema predeterminado está activo.`, fr: `Thème supprimé. Le thème par défaut est maintenant actif.`, de: `Theme gelöscht. Das Standard-Theme ist jetzt aktiv.`, it: `Tema eliminato. Il tema predefinito è ora attivo.`,
    },
    themeDeleteFailed: {
        pt: `Não foi possível apagar o tema. Ele continua disponível na coleção.`, en: `The theme could not be deleted. It remains available in the collection.`, es: `No se pudo eliminar el tema. Sigue disponible en la colección.`, fr: `Le thème n’a pas pu être supprimé. Il reste disponible dans la collection.`, de: `Das Theme konnte nicht gelöscht werden. Es bleibt in der Sammlung verfügbar.`, it: `Impossibile eliminare il tema. Resta disponibile nella raccolta.`,
    },
    themeSaveFailed: {
        pt: `Não foi possível salvar o tema. Ele continua disponível nesta sessão.`, en: `The theme could not be saved. It remains available in this session.`, es: `No se pudo guardar el tema. Sigue disponible en esta sesión.`, fr: `Le thème n’a pas pu être enregistré. Il reste disponible dans cette session.`, de: `Das Theme konnte nicht gespeichert werden. Es bleibt in dieser Sitzung verfügbar.`, it: `Impossibile salvare il tema. Resta disponibile in questa sessione.`,
    },
    themeReferenceLoadFailed: {
        pt: `Não foi possível carregar o tema de referência.`, en: `The reference theme could not be loaded.`, es: `No se pudo cargar el tema de referencia.`, fr: `Impossible de charger le thème de référence.`, de: `Das Referenz-Theme konnte nicht geladen werden.`, it: `Impossibile caricare il tema di riferimento.`,
    },
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
    chromeUserUnavailableLabel: {
        pt: `Usuário indisponível`,
        en: `User unavailable`,
        es: `Usuario no disponible`,
        fr: `Utilisateur indisponible`,
        de: `Benutzer nicht verfügbar`,
        it: `Utente non disponibile`,
    },
    chromeNotificationsUnavailableLabel: {
        pt: `Notificações indisponíveis`,
        en: `Notifications unavailable`,
        es: `Notificaciones no disponibles`,
        fr: `Notifications indisponibles`,
        de: `Benachrichtigungen nicht verfügbar`,
        it: `Notifiche non disponibili`,
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
    chartDataEmptyMessage: {
        pt: `Nenhum dado disponível para este gráfico.`,
        en: `No data is available for this chart.`,
        es: `No hay datos disponibles para este gráfico.`,
        fr: `Aucune donnée n’est disponible pour ce graphique.`,
        de: `Für dieses Diagramm sind keine Daten verfügbar.`,
        it: `Nessun dato disponibile per questo grafico.`,
    },
    chartAriaLabel: {
        pt: `Gráfico de dados`,
        en: `Data chart`,
        es: `Gráfico de datos`,
        fr: `Graphique de données`,
        de: `Datendiagramm`,
        it: `Grafico dei dati`,
    },
} satisfies Record<string, LibraryTextEntry>;
