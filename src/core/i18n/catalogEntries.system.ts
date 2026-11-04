import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Textos das telas de sistema: configurações, auditoria, versões e aprovação. */
export const CATALOG_SYSTEM = {
    settingsSections: {
        pt: 'Seções', en: 'Sections', es: 'Secciones',
        fr: 'Sections', de: 'Abschnitte', it: 'Sezioni',
    },
    settingsActions: {
        pt: 'Ações das configurações', en: 'Settings actions', es: 'Acciones de la configuración',
        fr: 'Actions des paramètres', de: 'Aktionen der Einstellungen', it: 'Azioni delle impostazioni',
    },
    settingsUnsaved: {
        pt: 'Alterações não salvas', en: 'Unsaved changes', es: 'Cambios sin guardar',
        fr: 'Modifications non enregistrées', de: 'Ungespeicherte Änderungen', it: 'Modifiche non salvate',
    },
    settingsUpToDate: {
        pt: 'Tudo salvo', en: 'All saved', es: 'Todo guardado',
        fr: 'Tout est enregistré', de: 'Alles gespeichert', it: 'Tutto salvato',
    },
    settingsSave: {
        pt: 'Salvar', en: 'Save', es: 'Guardar',
        fr: 'Enregistrer', de: 'Speichern', it: 'Salva',
    },
    settingsSaving: {
        pt: 'Salvando…', en: 'Saving…', es: 'Guardando…',
        fr: 'Enregistrement…', de: 'Speichern…', it: 'Salvataggio…',
    },
    settingsSaveFailed: {
        pt: 'Não foi possível salvar', en: 'Could not save', es: 'No se pudo guardar',
        fr: 'Échec de l’enregistrement', de: 'Speichern fehlgeschlagen', it: 'Salvataggio non riuscito',
    },
    settingsDiscard: {
        pt: 'Descartar', en: 'Discard', es: 'Descartar',
        fr: 'Annuler les modifications', de: 'Verwerfen', it: 'Scarta',
    },
    settingsSectionDirty: {
        pt: 'com alterações', en: 'has changes', es: 'con cambios',
        fr: 'avec modifications', de: 'mit Änderungen', it: 'con modifiche',
    },
    auditActor: {
        pt: 'Quem', en: 'Who', es: 'Quién',
        fr: 'Qui', de: 'Wer', it: 'Chi',
    },
    auditAction: {
        pt: 'Ação', en: 'Action', es: 'Acción',
        fr: 'Action', de: 'Aktion', it: 'Azione',
    },
    auditTarget: {
        pt: 'Alvo', en: 'Target', es: 'Objetivo',
        fr: 'Cible', de: 'Ziel', it: 'Destinazione',
    },
    auditDate: {
        pt: 'Quando', en: 'When', es: 'Cuándo',
        fr: 'Quand', de: 'Wann', it: 'Quando',
    },
    auditSearch: {
        pt: 'Buscar na auditoria', en: 'Search the audit log', es: 'Buscar en la auditoría',
        fr: 'Rechercher dans l’audit', de: 'Im Audit suchen', it: 'Cerca nell’audit',
    },
    auditFilterActor: {
        pt: 'Filtrar por ator', en: 'Filter by actor', es: 'Filtrar por actor',
        fr: 'Filtrer par acteur', de: 'Nach Akteur filtern', it: 'Filtra per attore',
    },
    auditFilterAction: {
        pt: 'Filtrar por ação', en: 'Filter by action', es: 'Filtrar por acción',
        fr: 'Filtrer par action', de: 'Nach Aktion filtern', it: 'Filtra per azione',
    },
    auditEmpty: {
        pt: 'Nenhum registro de auditoria.', en: 'No audit records.', es: 'Ningún registro de auditoría.',
        fr: 'Aucun enregistrement d’audit.', de: 'Keine Audit-Einträge.', it: 'Nessun record di audit.',
    },
    auditDetails: {
        pt: 'Detalhes', en: 'Details', es: 'Detalles',
        fr: 'Détails', de: 'Details', it: 'Dettagli',
    },
    diffBefore: {
        pt: 'Antes', en: 'Before', es: 'Antes',
        fr: 'Avant', de: 'Vorher', it: 'Prima',
    },
    diffAfter: {
        pt: 'Depois', en: 'After', es: 'Después',
        fr: 'Après', de: 'Nachher', it: 'Dopo',
    },
    diffAdded: {
        pt: 'Adicionado', en: 'Added', es: 'Añadido',
        fr: 'Ajouté', de: 'Hinzugefügt', it: 'Aggiunto',
    },
    diffRemoved: {
        pt: 'Removido', en: 'Removed', es: 'Eliminado',
        fr: 'Supprimé', de: 'Entfernt', it: 'Rimosso',
    },
    diffChanged: {
        pt: 'Alterado', en: 'Changed', es: 'Modificado',
        fr: 'Modifié', de: 'Geändert', it: 'Modificato',
    },
    diffUnchanged: {
        pt: 'Sem alteração', en: 'Unchanged', es: 'Sin cambios',
        fr: 'Inchangé', de: 'Unverändert', it: 'Invariato',
    },
    diffEmpty: {
        pt: 'Sem diferenças.', en: 'No differences.', es: 'Sin diferencias.',
        fr: 'Aucune différence.', de: 'Keine Unterschiede.', it: 'Nessuna differenza.',
    },
    diffEmptyValue: {
        pt: '(vazio)', en: '(empty)', es: '(vacío)',
        fr: '(vide)', de: '(leer)', it: '(vuoto)',
    },
    versionCurrent: {
        pt: 'Atual', en: 'Current', es: 'Actual',
        fr: 'Actuelle', de: 'Aktuell', it: 'Attuale',
    },
    versionRestore: {
        pt: 'Restaurar {version}', en: 'Restore {version}', es: 'Restaurar {version}',
        fr: 'Restaurer {version}', de: '{version} wiederherstellen', it: 'Ripristina {version}',
    },
    versionCompare: {
        pt: 'Comparar com a anterior', en: 'Compare with previous', es: 'Comparar con la anterior',
        fr: 'Comparer avec la précédente', de: 'Mit vorheriger vergleichen', it: 'Confronta con la precedente',
    },
    versionHideCompare: {
        pt: 'Ocultar comparação', en: 'Hide comparison', es: 'Ocultar comparación',
        fr: 'Masquer la comparaison', de: 'Vergleich ausblenden', it: 'Nascondi il confronto',
    },
    versionBy: {
        pt: 'por {author}', en: 'by {author}', es: 'por {author}',
        fr: 'par {author}', de: 'von {author}', it: 'di {author}',
    },
    versionEmpty: {
        pt: 'Nenhuma versão registrada.', en: 'No versions recorded.', es: 'Ninguna versión registrada.',
        fr: 'Aucune version enregistrée.', de: 'Keine Versionen vorhanden.', it: 'Nessuna versione registrata.',
    },
    approvalApprove: {
        pt: 'Aprovar', en: 'Approve', es: 'Aprobar',
        fr: 'Approuver', de: 'Genehmigen', it: 'Approva',
    },
    approvalReject: {
        pt: 'Rejeitar', en: 'Reject', es: 'Rechazar',
        fr: 'Rejeter', de: 'Ablehnen', it: 'Rifiuta',
    },
    approvalApproveSelected: {
        pt: 'Aprovar {count} selecionados', en: 'Approve {count} selected', es: 'Aprobar {count} seleccionados',
        fr: 'Approuver {count} sélectionnés', de: '{count} Ausgewählte genehmigen', it: 'Approva {count} selezionati',
    },
    approvalRejectSelected: {
        pt: 'Rejeitar {count} selecionados', en: 'Reject {count} selected', es: 'Rechazar {count} seleccionados',
        fr: 'Rejeter {count} sélectionnés', de: '{count} Ausgewählte ablehnen', it: 'Rifiuta {count} selezionati',
    },
    approvalSelectItem: {
        pt: 'Selecionar {title}', en: 'Select {title}', es: 'Seleccionar {title}',
        fr: 'Sélectionner {title}', de: '{title} auswählen', it: 'Seleziona {title}',
    },
    approvalSelectAll: {
        pt: 'Selecionar todos os itens', en: 'Select all items', es: 'Seleccionar todos los elementos',
        fr: 'Sélectionner tous les éléments', de: 'Alle Einträge auswählen', it: 'Seleziona tutti gli elementi',
    },
    approvalReason: {
        pt: 'Motivo da rejeição', en: 'Rejection reason', es: 'Motivo del rechazo',
        fr: 'Motif du rejet', de: 'Ablehnungsgrund', it: 'Motivo del rifiuto',
    },
    approvalReasonRequired: {
        pt: 'Informe o motivo.', en: 'Enter the reason.', es: 'Indique el motivo.',
        fr: 'Indiquez le motif.', de: 'Grund angeben.', it: 'Indica il motivo.',
    },
    approvalConfirmReject: {
        pt: 'Confirmar rejeição', en: 'Confirm rejection', es: 'Confirmar rechazo',
        fr: 'Confirmer le rejet', de: 'Ablehnung bestätigen', it: 'Conferma il rifiuto',
    },
    approvalCancel: {
        pt: 'Cancelar', en: 'Cancel', es: 'Cancelar',
        fr: 'Annuler', de: 'Abbrechen', it: 'Annulla',
    },
    approvalEmpty: {
        pt: 'Nenhum item aguardando aprovação.', en: 'No items awaiting approval.', es: 'Ningún elemento pendiente de aprobación.',
        fr: 'Aucun élément en attente d’approbation.', de: 'Keine Einträge zur Genehmigung.', it: 'Nessun elemento in attesa di approvazione.',
    },
    approvalRequestedBy: {
        pt: 'Pedido por {actor}', en: 'Requested by {actor}', es: 'Solicitado por {actor}',
        fr: 'Demandé par {actor}', de: 'Angefragt von {actor}', it: 'Richiesto da {actor}',
    },
} satisfies Record<string, LibraryTextEntry>;
