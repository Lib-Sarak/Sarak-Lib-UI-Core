import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Textos da lib para tabela; cada plan da rc.4 acrescenta aqui os seus. */
export const CATALOG_TABLE = {
    tableSelectionColumn: {
        pt: 'Seleção', en: 'Selection', es: 'Selección',
        fr: 'Sélection', de: 'Auswahl', it: 'Selezione',
    },
    tableResizeColumn: {
        pt: 'Redimensionar coluna {column}', en: 'Resize column {column}', es: 'Redimensionar columna {column}',
        fr: 'Redimensionner la colonne {column}', de: 'Spalte {column} anpassen', it: 'Ridimensiona colonna {column}',
    },
    tableSortBy: {
        pt: 'Ordenar por {column}', en: 'Sort by {column}', es: 'Ordenar por {column}',
        fr: 'Trier par {column}', de: 'Nach {column} sortieren', it: 'Ordina per {column}',
    },
    tableSelectAllTotal: {
        pt: 'Selecionar todos os {total}', en: 'Select all {total}', es: 'Seleccionar los {total}',
        fr: 'Sélectionner les {total}', de: 'Alle {total} auswählen', it: 'Seleziona tutti i {total}',
    },
    tableAllSelected: {
        pt: 'Todos os {total} itens estão selecionados.', en: 'All {total} items are selected.', es: 'Los {total} elementos están seleccionados.',
        fr: 'Les {total} éléments sont sélectionnés.', de: 'Alle {total} Einträge sind ausgewählt.', it: 'Tutti i {total} elementi sono selezionati.',
    },
    tableClearSelection: {
        pt: 'Limpar seleção', en: 'Clear selection', es: 'Borrar selección',
        fr: 'Effacer la sélection', de: 'Auswahl aufheben', it: 'Cancella selezione',
    },
    tableExpandRow: {
        pt: 'Expandir linha', en: 'Expand row', es: 'Expandir fila',
        fr: 'Développer la ligne', de: 'Zeile aufklappen', it: 'Espandi riga',
    },
    tableCollapseRow: {
        pt: 'Recolher linha', en: 'Collapse row', es: 'Contraer fila',
        fr: 'Réduire la ligne', de: 'Zeile zuklappen', it: 'Comprimi riga',
    },
    tableExpandGroup: {
        pt: 'Expandir grupo {group}', en: 'Expand group {group}', es: 'Expandir grupo {group}',
        fr: 'Développer le groupe {group}', de: 'Gruppe {group} aufklappen', it: 'Espandi gruppo {group}',
    },
    tableCollapseGroup: {
        pt: 'Recolher grupo {group}', en: 'Collapse group {group}', es: 'Contraer grupo {group}',
        fr: 'Réduire le groupe {group}', de: 'Gruppe {group} zuklappen', it: 'Comprimi gruppo {group}',
    },
    tableFooterLabel: {
        pt: 'Totais', en: 'Totals', es: 'Totales',
        fr: 'Totaux', de: 'Summen', it: 'Totali',
    },
    tableSubtotal: {
        pt: 'Subtotal', en: 'Subtotal', es: 'Subtotal',
        fr: 'Sous-total', de: 'Zwischensumme', it: 'Subtotale',
    },
    tableExportCsv: {
        pt: 'Exportar CSV', en: 'Export CSV', es: 'Exportar CSV',
        fr: 'Exporter en CSV', de: 'Als CSV exportieren', it: 'Esporta CSV',
    },
    tableBulkActions: {
        pt: 'Ações em lote', en: 'Bulk actions', es: 'Acciones en lote',
        fr: 'Actions groupées', de: 'Sammelaktionen', it: 'Azioni di gruppo',
    },
    tableBulkCount: {
        pt: '{count} selecionados', en: '{count} selected', es: '{count} seleccionados',
        fr: '{count} sélectionnés', de: '{count} ausgewählt', it: '{count} selezionati',
    },
    tableBulkConfirm: {
        pt: 'Esta ação vale para {count} itens.', en: 'This action applies to {count} items.', es: 'Esta acción se aplica a {count} elementos.',
        fr: 'Cette action concerne {count} éléments.', de: 'Diese Aktion gilt für {count} Einträge.', it: 'Questa azione riguarda {count} elementi.',
    },
    tableColumns: {
        pt: 'Colunas', en: 'Columns', es: 'Columnas',
        fr: 'Colonnes', de: 'Spalten', it: 'Colonne',
    },
    tableColumnShow: {
        pt: 'Exibir coluna {column}', en: 'Show column {column}', es: 'Mostrar columna {column}',
        fr: 'Afficher la colonne {column}', de: 'Spalte {column} anzeigen', it: 'Mostra colonna {column}',
    },
    tableColumnMoveUp: {
        pt: 'Mover {column} para antes', en: 'Move {column} earlier', es: 'Mover {column} antes',
        fr: 'Déplacer {column} avant', de: '{column} nach vorn', it: 'Sposta {column} prima',
    },
    tableColumnMoveDown: {
        pt: 'Mover {column} para depois', en: 'Move {column} later', es: 'Mover {column} después',
        fr: 'Déplacer {column} après', de: '{column} nach hinten', it: 'Sposta {column} dopo',
    },
    tableViewsGroup: {
        pt: 'Visões da tabela', en: 'Table views', es: 'Vistas de la tabla',
        fr: 'Vues du tableau', de: 'Tabellenansichten', it: 'Viste della tabella',
    },
    tableViewLabel: {
        pt: 'Visão', en: 'View', es: 'Vista',
        fr: 'Vue', de: 'Ansicht', it: 'Vista',
    },
    tableViewDefault: {
        pt: 'Padrão', en: 'Default', es: 'Predeterminada',
        fr: 'Par défaut', de: 'Standard', it: 'Predefinita',
    },
    tableViewSaveAs: {
        pt: 'Salvar como', en: 'Save as', es: 'Guardar como',
        fr: 'Enregistrer sous', de: 'Speichern als', it: 'Salva come',
    },
    tableViewName: {
        pt: 'Nome da visão', en: 'View name', es: 'Nombre de la vista',
        fr: 'Nom de la vue', de: 'Name der Ansicht', it: 'Nome della vista',
    },
    tableViewSave: {
        pt: 'Salvar visão', en: 'Save view', es: 'Guardar vista',
        fr: 'Enregistrer la vue', de: 'Ansicht speichern', it: 'Salva vista',
    },
    tableViewReset: {
        pt: 'Voltar ao padrão', en: 'Back to default', es: 'Volver a la predeterminada',
        fr: 'Revenir au défaut', de: 'Zurück zum Standard', it: 'Torna alla predefinita',
    },
    tableEditCell: {
        pt: 'Editar {column}: {value}', en: 'Edit {column}: {value}', es: 'Editar {column}: {value}',
        fr: 'Modifier {column} : {value}', de: '{column} bearbeiten: {value}', it: 'Modifica {column}: {value}',
    },
    tableEditError: {
        pt: 'Não foi possível salvar.', en: 'Could not save.', es: 'No se pudo guardar.',
        fr: "Impossible d'enregistrer.", de: 'Speichern fehlgeschlagen.', it: 'Impossibile salvare.',
    },
    tableEditSaving: {
        pt: 'Salvando', en: 'Saving', es: 'Guardando',
        fr: 'Enregistrement', de: 'Wird gespeichert', it: 'Salvataggio',
    },
    tableToneSuccess: {
        pt: 'Dentro do esperado', en: 'On target', es: 'Dentro de lo esperado',
        fr: 'Conforme', de: 'Im Soll', it: 'Nella norma',
    },
    tableToneWarning: {
        pt: 'Atenção', en: 'Warning', es: 'Atención',
        fr: 'Attention', de: 'Achtung', it: 'Attenzione',
    },
    tableToneDanger: {
        pt: 'Crítico', en: 'Critical', es: 'Crítico',
        fr: 'Critique', de: 'Kritisch', it: 'Critico',
    },
    tableToneInfo: {
        pt: 'Informação', en: 'Information', es: 'Información',
        fr: 'Information', de: 'Information', it: 'Informazione',
    },
} satisfies Record<string, LibraryTextEntry>;
