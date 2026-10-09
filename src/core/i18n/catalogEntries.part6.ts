import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Blocos de detalhe do cartão: checklist, comentários, histórico e seletor de responsável. */
export const CATALOG_PART_6 = {
    checklistLabel: {
        pt: 'Lista de verificação', en: 'Checklist', es: 'Lista de verificación',
        fr: 'Liste de contrôle', de: 'Checkliste', it: 'Lista di controllo',
    },
    checklistProgress: {
        pt: '{done} de {total}', en: '{done} of {total}', es: '{done} de {total}',
        fr: '{done} sur {total}', de: '{done} von {total}', it: '{done} di {total}',
    },
    checklistEmpty: {
        pt: 'Nenhum item', en: 'No items', es: 'Sin elementos',
        fr: 'Aucun élément', de: 'Keine Einträge', it: 'Nessun elemento',
    },
    checklistAddPlaceholder: {
        pt: 'Novo item', en: 'New item', es: 'Nuevo elemento',
        fr: 'Nouvel élément', de: 'Neuer Eintrag', it: 'Nuovo elemento',
    },
    checklistAddSubmit: {
        pt: 'Adicionar item', en: 'Add item', es: 'Añadir elemento',
        fr: 'Ajouter l’élément', de: 'Eintrag hinzufügen', it: 'Aggiungi elemento',
    },
    checklistRemove: {
        pt: 'Remover item {item}', en: 'Remove item {item}', es: 'Quitar elemento {item}',
        fr: 'Supprimer l’élément {item}', de: 'Eintrag {item} entfernen', it: 'Rimuovi elemento {item}',
    },
    commentThreadLabel: {
        pt: 'Comentários', en: 'Comments', es: 'Comentarios',
        fr: 'Commentaires', de: 'Kommentare', it: 'Commenti',
    },
    commentEmpty: {
        pt: 'Nenhum comentário ainda', en: 'No comments yet', es: 'Aún no hay comentarios',
        fr: 'Aucun commentaire pour l’instant', de: 'Noch keine Kommentare', it: 'Ancora nessun commento',
    },
    commentPlaceholder: {
        pt: 'Escreva um comentário', en: 'Write a comment', es: 'Escribe un comentario',
        fr: 'Écrivez un commentaire', de: 'Kommentar schreiben', it: 'Scrivi un commento',
    },
    commentSubmit: {
        pt: 'Comentar', en: 'Comment', es: 'Comentar',
        fr: 'Commenter', de: 'Kommentieren', it: 'Commenta',
    },
    commentDelete: {
        pt: 'Excluir comentário de {author}', en: 'Delete comment by {author}', es: 'Eliminar comentario de {author}',
        fr: 'Supprimer le commentaire de {author}', de: 'Kommentar von {author} löschen', it: 'Elimina il commento di {author}',
    },
    activityFeedLabel: {
        pt: 'Histórico', en: 'History', es: 'Historial',
        fr: 'Historique', de: 'Verlauf', it: 'Cronologia',
    },
    activityEmpty: {
        pt: 'Nenhuma atividade', en: 'No activity', es: 'Sin actividad',
        fr: 'Aucune activité', de: 'Keine Aktivität', it: 'Nessuna attività',
    },
    assigneeLabel: {
        pt: 'Responsável', en: 'Assignee', es: 'Responsable',
        fr: 'Responsable', de: 'Zuständig', it: 'Responsabile',
    },
    assigneeSearch: {
        pt: 'Buscar pessoa', en: 'Search people', es: 'Buscar persona',
        fr: 'Rechercher une personne', de: 'Person suchen', it: 'Cerca persona',
    },
    assigneeEmpty: {
        pt: 'Nenhuma pessoa disponível', en: 'No people available', es: 'Ninguna persona disponible',
        fr: 'Aucune personne disponible', de: 'Keine Personen verfügbar', it: 'Nessuna persona disponibile',
    },
    assigneeClear: {
        pt: 'Remover responsável {name}', en: 'Remove assignee {name}', es: 'Quitar responsable {name}',
        fr: 'Retirer le responsable {name}', de: 'Zuständigkeit von {name} entfernen', it: 'Rimuovi il responsabile {name}',
    },
} satisfies Record<string, LibraryTextEntry>;
