import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Rótulos genéricos para estados e controles dos templates. */
export const CATALOG_PART_4 = {
    dataEmpty: {
        pt: 'Nenhum dado encontrado.', en: 'No data found.', es: 'No se encontraron datos.',
        fr: 'Aucune donnée trouvée.', de: 'Keine Daten gefunden.', it: 'Nessun dato trovato.',
    },
    dataLoadErrorTitle: {
        pt: 'Não foi possível carregar os dados', en: 'Unable to load data', es: 'No se pudieron cargar los datos',
        fr: 'Impossible de charger les données', de: 'Daten konnten nicht geladen werden', it: 'Impossibile caricare i dati',
    },
    genericLoadError: {
        pt: 'Falha ao carregar.', en: 'Loading failed.', es: 'Error al cargar.',
        fr: 'Échec du chargement.', de: 'Laden fehlgeschlagen.', it: 'Caricamento non riuscito.',
    },
    retry: {
        pt: 'Tentar novamente', en: 'Try again', es: 'Intentar de nuevo',
        fr: 'Réessayer', de: 'Erneut versuchen', it: 'Riprova',
    },
    filterShowAll: {
        pt: 'Todos: {label}', en: 'All: {label}', es: 'Todos: {label}',
        fr: 'Tout : {label}', de: 'Alle: {label}', it: 'Tutti: {label}',
    },
    tableRowsFound: {
        pt: '{count} registros encontrados', en: '{count} records found', es: '{count} registros encontrados',
        fr: '{count} enregistrements trouvés', de: '{count} Einträge gefunden', it: 'Trovati {count} record',
    },
    paginationRangeSummary: {
        pt: '{start}–{end} de {total}', en: '{start}–{end} of {total}', es: '{start}–{end} de {total}',
        fr: '{start}–{end} sur {total}', de: '{start}–{end} von {total}', it: '{start}–{end} di {total}',
    },
    paginationPageSummary: {
        pt: 'Página {current} de {total}', en: 'Page {current} of {total}', es: 'Página {current} de {total}',
        fr: 'Page {current} sur {total}', de: 'Seite {current} von {total}', it: 'Pagina {current} di {total}',
    },
    paginationPageSizeLabel: {
        pt: 'Itens por página', en: 'Items per page', es: 'Elementos por página',
        fr: 'Éléments par page', de: 'Elemente pro Seite', it: 'Elementi per pagina',
    },
    selectAllVisibleRows: {
        pt: 'Selecionar todas as linhas visíveis', en: 'Select all visible rows', es: 'Seleccionar todas las filas visibles',
        fr: 'Sélectionner toutes les lignes visibles', de: 'Alle sichtbaren Zeilen auswählen', it: 'Seleziona tutte le righe visibili',
    },
    tableSelectionGroup: {
        pt: 'Seleção de linhas', en: 'Row selection', es: 'Selección de filas',
        fr: 'Sélection des lignes', de: 'Zeilenauswahl', it: 'Selezione delle righe',
    },
    tableSortGroup: {
        pt: 'Ordenação por coluna', en: 'Sort by column', es: 'Ordenar por columna',
        fr: 'Trier par colonne', de: 'Nach Spalte sortieren', it: 'Ordina per colonna',
    },
    selectRow: {
        pt: 'Selecionar linha {row}', en: 'Select row {row}', es: 'Seleccionar fila {row}',
        fr: 'Sélectionner la ligne {row}', de: 'Zeile {row} auswählen', it: 'Seleziona riga {row}',
    },
    formFieldPlaceholder: {
        pt: 'Digite {field}…', en: 'Enter {field}…', es: 'Escribe {field}…',
        fr: 'Saisissez {field}…', de: '{field} eingeben…', it: 'Inserisci {field}…',
    },
    formSave: {
        pt: 'Salvar alterações', en: 'Save changes', es: 'Guardar cambios',
        fr: 'Enregistrer les modifications', de: 'Änderungen speichern', it: 'Salva le modifiche',
    },
    formSaving: {
        pt: 'Salvando…', en: 'Saving…', es: 'Guardando…',
        fr: 'Enregistrement…', de: 'Speichern…', it: 'Salvataggio…',
    },
    formSaveSuccess: {
        pt: 'Salvo com sucesso.', en: 'Saved successfully.', es: 'Guardado correctamente.',
        fr: 'Enregistré.', de: 'Erfolgreich gespeichert.', it: 'Salvato correttamente.',
    },
    alertClose: {
        pt: 'Fechar aviso', en: 'Close alert', es: 'Cerrar alerta',
        fr: 'Fermer l’alerte', de: 'Hinweis schließen', it: 'Chiudi avviso',
    },
    spinnerLoading: {
        pt: 'Carregando', en: 'Loading', es: 'Cargando',
        fr: 'Chargement', de: 'Wird geladen', it: 'Caricamento',
    },
    toastClose: {
        pt: 'Fechar notificação', en: 'Dismiss notification', es: 'Cerrar notificación',
        fr: 'Fermer la notification', de: 'Benachrichtigung schließen', it: 'Chiudi notifica',
    },
    dialogConfirm: {
        pt: 'Confirmar', en: 'Confirm', es: 'Confirmar',
        fr: 'Confirmer', de: 'Bestätigen', it: 'Conferma',
    },
    dialogDefaultAriaLabel: {
        pt: 'Diálogo', en: 'Dialog', es: 'Diálogo',
        fr: 'Boîte de dialogue', de: 'Dialog', it: 'Finestra di dialogo',
    },
    dialogCancel: {
        pt: 'Cancelar', en: 'Cancel', es: 'Cancelar',
        fr: 'Annuler', de: 'Abbrechen', it: 'Annulla',
    },
    progressDefaultLabel: {
        pt: 'Progresso', en: 'Progress', es: 'Progreso',
        fr: 'Progression', de: 'Fortschritt', it: 'Avanzamento',
    },
} satisfies Record<string, LibraryTextEntry>;
