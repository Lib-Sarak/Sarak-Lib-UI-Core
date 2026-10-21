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
    kanbanLoading: {
        pt: 'Carregando quadro', en: 'Loading board', es: 'Cargando tablero',
        fr: 'Chargement du tableau', de: 'Board wird geladen', it: 'Caricamento lavagna',
    },
    kanbanInstructions: {
        pt: 'Para pegar um cartão, pressione Espaço. Use as setas para mover e Espaço para soltar. Esc cancela.',
        en: 'To pick up a card, press Space. Use the arrow keys to move it and Space to drop it. Esc cancels.',
        es: 'Para tomar una tarjeta, pulse Espacio. Use las flechas para moverla y Espacio para soltarla. Esc cancela.',
        fr: 'Pour saisir une carte, appuyez sur Espace. Déplacez-la avec les flèches et déposez-la avec Espace. Échap annule.',
        de: 'Zum Aufnehmen einer Karte die Leertaste drücken. Mit den Pfeiltasten bewegen, mit der Leertaste ablegen. Esc bricht ab.',
        it: 'Per prendere una scheda premi Spazio. Usa le frecce per spostarla e Spazio per rilasciarla. Esc annulla.',
    },
    kanbanAnnounceLift: {
        pt: 'Cartão {card} levantado, posição {position} de {total} em {column}.',
        en: 'Card {card} picked up, position {position} of {total} in {column}.',
        es: 'Tarjeta {card} tomada, posición {position} de {total} en {column}.',
        fr: 'Carte {card} saisie, position {position} sur {total} dans {column}.',
        de: 'Karte {card} aufgenommen, Position {position} von {total} in {column}.',
        it: 'Scheda {card} presa, posizione {position} di {total} in {column}.',
    },
    kanbanAnnounceOver: {
        pt: 'Cartão {card} na posição {position} de {total} em {column}.',
        en: 'Card {card} at position {position} of {total} in {column}.',
        es: 'Tarjeta {card} en la posición {position} de {total} en {column}.',
        fr: 'Carte {card} à la position {position} sur {total} dans {column}.',
        de: 'Karte {card} an Position {position} von {total} in {column}.',
        it: 'Scheda {card} alla posizione {position} di {total} in {column}.',
    },
    kanbanAnnounceDrop: {
        pt: 'Cartão {card} solto na posição {position} de {total} em {column}.',
        en: 'Card {card} dropped at position {position} of {total} in {column}.',
        es: 'Tarjeta {card} soltada en la posición {position} de {total} en {column}.',
        fr: 'Carte {card} déposée à la position {position} sur {total} dans {column}.',
        de: 'Karte {card} an Position {position} von {total} in {column} abgelegt.',
        it: 'Scheda {card} rilasciata alla posizione {position} di {total} in {column}.',
    },
    kanbanAnnounceCancel: {
        pt: 'Movimento cancelado. Cartão {card} voltou à posição original.',
        en: 'Move cancelled. Card {card} returned to its original position.',
        es: 'Movimiento cancelado. La tarjeta {card} volvió a su posición original.',
        fr: 'Déplacement annulé. La carte {card} est revenue à sa position d’origine.',
        de: 'Verschieben abgebrochen. Karte {card} ist an ihrer ursprünglichen Position.',
        it: 'Spostamento annullato. La scheda {card} è tornata alla posizione originale.',
    },
    kanbanPriorityLow: {
        pt: 'Baixa', en: 'Low', es: 'Baja',
        fr: 'Basse', de: 'Niedrig', it: 'Bassa',
    },
    kanbanPriorityHigh: {
        pt: 'Alta', en: 'High', es: 'Alta',
        fr: 'Haute', de: 'Hoch', it: 'Alta',
    },
    kanbanPriorityUrgent: {
        pt: 'Urgente', en: 'Urgent', es: 'Urgente',
        fr: 'Urgente', de: 'Dringend', it: 'Urgente',
    },
    kanbanDue: {
        pt: 'Prazo {date}', en: 'Due {date}', es: 'Vence {date}',
        fr: 'Échéance {date}', de: 'Fällig {date}', it: 'Scadenza {date}',
    },
    kanbanDueOverdue: {
        pt: 'Atrasado: {date}', en: 'Overdue: {date}', es: 'Vencido: {date}',
        fr: 'En retard : {date}', de: 'Überfällig: {date}', it: 'In ritardo: {date}',
    },
    kanbanSubtasks: {
        pt: '{done} de {total} subtarefas', en: '{done} of {total} subtasks', es: '{done} de {total} subtareas',
        fr: '{done} sur {total} sous-tâches', de: '{done} von {total} Unteraufgaben', it: '{done} di {total} sottoattività',
    },
    kanbanCardAddPlaceholder: {
        pt: 'Novo cartão', en: 'New card', es: 'Nueva tarjeta',
        fr: 'Nouvelle carte', de: 'Neue Karte', it: 'Nuova scheda',
    },
    kanbanCardAddSubmit: {
        pt: 'Adicionar cartão', en: 'Add card', es: 'Añadir tarjeta',
        fr: 'Ajouter la carte', de: 'Karte hinzufügen', it: 'Aggiungi scheda',
    },
    kanbanColumnAddPlaceholder: {
        pt: 'Nova coluna', en: 'New column', es: 'Nueva columna',
        fr: 'Nouvelle colonne', de: 'Neue Spalte', it: 'Nuova colonna',
    },
    kanbanColumnAddSubmit: {
        pt: 'Adicionar coluna', en: 'Add column', es: 'Añadir columna',
        fr: 'Ajouter la colonne', de: 'Spalte hinzufügen', it: 'Aggiungi colonna',
    },
    kanbanColumnMenu: {
        pt: 'Opções da coluna {column}', en: 'Options for column {column}', es: 'Opciones de la columna {column}',
        fr: 'Options de la colonne {column}', de: 'Optionen für Spalte {column}', it: 'Opzioni della colonna {column}',
    },
    kanbanColumnRename: {
        pt: 'Renomear coluna', en: 'Rename column', es: 'Renombrar columna',
        fr: 'Renommer la colonne', de: 'Spalte umbenennen', it: 'Rinomina colonna',
    },
    kanbanColumnDelete: {
        pt: 'Excluir coluna', en: 'Delete column', es: 'Eliminar columna',
        fr: 'Supprimer la colonne', de: 'Spalte löschen', it: 'Elimina colonna',
    },
    kanbanEmptyColumn: {
        pt: 'Nenhum cartão', en: 'No cards', es: 'Sin tarjetas',
        fr: 'Aucune carte', de: 'Keine Karten', it: 'Nessuna scheda',
    },
} satisfies Record<string, LibraryTextEntry>;
