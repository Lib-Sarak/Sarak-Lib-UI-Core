import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Blocos de detalhe do cartão (checklist, comentários, histórico, responsável), o calendário mensal e o Gantt. */
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
    calendarLabel: {
        pt: 'Calendário de {month}', en: 'Calendar for {month}', es: 'Calendario de {month}',
        fr: 'Calendrier de {month}', de: 'Kalender für {month}', it: 'Calendario di {month}',
    },
    calendarPrevious: {
        pt: 'Mês anterior', en: 'Previous month', es: 'Mes anterior',
        fr: 'Mois précédent', de: 'Vorheriger Monat', it: 'Mese precedente',
    },
    calendarNext: {
        pt: 'Próximo mês', en: 'Next month', es: 'Mes siguiente',
        fr: 'Mois suivant', de: 'Nächster Monat', it: 'Mese successivo',
    },
    calendarToday: {
        pt: 'Hoje', en: 'Today', es: 'Hoy',
        fr: 'Aujourd’hui', de: 'Heute', it: 'Oggi',
    },
    calendarDayNoEvents: {
        pt: '{date}, sem eventos', en: '{date}, no events', es: '{date}, sin eventos',
        fr: '{date}, aucun événement', de: '{date}, keine Termine', it: '{date}, nessun evento',
    },
    calendarDayOneEvent: {
        pt: '{date}, 1 evento', en: '{date}, 1 event', es: '{date}, 1 evento',
        fr: '{date}, 1 événement', de: '{date}, 1 Termin', it: '{date}, 1 evento',
    },
    calendarDayEvents: {
        pt: '{date}, {count} eventos', en: '{date}, {count} events', es: '{date}, {count} eventos',
        fr: '{date}, {count} événements', de: '{date}, {count} Termine', it: '{date}, {count} eventi',
    },
    calendarMore: {
        pt: '+{count}', en: '+{count}', es: '+{count}',
        fr: '+{count}', de: '+{count}', it: '+{count}',
    },
    calendarMoreLabel: {
        pt: 'Ver todos os eventos de {date}', en: 'See all events on {date}', es: 'Ver todos los eventos del {date}',
        fr: 'Voir tous les événements du {date}', de: 'Alle Termine am {date} anzeigen', it: 'Vedi tutti gli eventi del {date}',
    },
    ganttLabel: {
        pt: 'Cronograma', en: 'Schedule', es: 'Cronograma',
        fr: 'Planning', de: 'Zeitplan', it: 'Cronoprogramma',
    },
    ganttTaskListLabel: {
        pt: 'Tarefas', en: 'Tasks', es: 'Tareas',
        fr: 'Tâches', de: 'Aufgaben', it: 'Attività',
    },
    ganttTimelineLabel: {
        pt: 'Linha do tempo de {start} a {end}', en: 'Timeline from {start} to {end}', es: 'Línea de tiempo del {start} al {end}',
        fr: 'Chronologie du {start} au {end}', de: 'Zeitleiste vom {start} bis {end}', it: 'Sequenza temporale dal {start} al {end}',
    },
    ganttTaskRange: {
        pt: 'de {start} a {end}', en: 'from {start} to {end}', es: 'del {start} al {end}',
        fr: 'du {start} au {end}', de: 'vom {start} bis {end}', it: 'dal {start} al {end}',
    },
    ganttTaskBar: {
        pt: '{title}, de {start} a {end}', en: '{title}, from {start} to {end}', es: '{title}, del {start} al {end}',
        fr: '{title}, du {start} au {end}', de: '{title}, vom {start} bis {end}', it: '{title}, dal {start} al {end}',
    },
    ganttTaskBarProgress: {
        pt: '{title}, de {start} a {end}, {progress}% concluído', en: '{title}, from {start} to {end}, {progress}% complete',
        es: '{title}, del {start} al {end}, {progress}% completado', fr: '{title}, du {start} au {end}, {progress} % terminé',
        de: '{title}, vom {start} bis {end}, {progress} % erledigt', it: '{title}, dal {start} al {end}, {progress}% completato',
    },
    ganttEmpty: {
        pt: 'Nenhuma tarefa', en: 'No tasks', es: 'Sin tareas',
        fr: 'Aucune tâche', de: 'Keine Aufgaben', it: 'Nessuna attività',
    },
} satisfies Record<string, LibraryTextEntry>;
