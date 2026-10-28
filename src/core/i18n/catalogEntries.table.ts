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
} satisfies Record<string, LibraryTextEntry>;
