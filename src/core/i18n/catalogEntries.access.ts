import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Textos das telas de sistema: execução, conexão, uso, permissões, membros e sessões. */
export const CATALOG_ACCESS = {
    runPhases: {
        pt: 'Fases da execução', en: 'Run phases', es: 'Fases de la ejecución',
        fr: 'Phases de l’exécution', de: 'Phasen der Ausführung', it: 'Fasi dell’esecuzione',
    },
    runOverall: {
        pt: 'Progresso geral', en: 'Overall progress', es: 'Progreso general',
        fr: 'Progression globale', de: 'Gesamtfortschritt', it: 'Avanzamento complessivo',
    },
    runPending: {
        pt: 'Pendente', en: 'Pending', es: 'Pendiente',
        fr: 'En attente', de: 'Ausstehend', it: 'In attesa',
    },
    runRunning: {
        pt: 'Em andamento', en: 'In progress', es: 'En curso',
        fr: 'En cours', de: 'Läuft', it: 'In corso',
    },
    runDone: {
        pt: 'Concluída', en: 'Done', es: 'Completada',
        fr: 'Terminée', de: 'Abgeschlossen', it: 'Completata',
    },
    runFailed: {
        pt: 'Falhou', en: 'Failed', es: 'Falló',
        fr: 'Échec', de: 'Fehlgeschlagen', it: 'Non riuscita',
    },
    runDuration: {
        pt: 'Duração: {time}', en: 'Duration: {time}', es: 'Duración: {time}',
        fr: 'Durée : {time}', de: 'Dauer: {time}', it: 'Durata: {time}',
    },
    runCancel: {
        pt: 'Cancelar execução', en: 'Cancel run', es: 'Cancelar ejecución',
        fr: 'Annuler l’exécution', de: 'Ausführung abbrechen', it: 'Annulla esecuzione',
    },
    runCancelling: {
        pt: 'Cancelando…', en: 'Cancelling…', es: 'Cancelando…',
        fr: 'Annulation…', de: 'Wird abgebrochen…', it: 'Annullamento…',
    },
    runLastError: {
        pt: 'Último erro', en: 'Last error', es: 'Último error',
        fr: 'Dernière erreur', de: 'Letzter Fehler', it: 'Ultimo errore',
    },
    liveConnected: {
        pt: 'Conectado', en: 'Connected', es: 'Conectado',
        fr: 'Connecté', de: 'Verbunden', it: 'Connesso',
    },
    liveReconnecting: {
        pt: 'Reconectando…', en: 'Reconnecting…', es: 'Reconectando…',
        fr: 'Reconnexion…', de: 'Verbindung wird wiederhergestellt…', it: 'Riconnessione…',
    },
    liveOffline: {
        pt: 'Sem conexão', en: 'Offline', es: 'Sin conexión',
        fr: 'Hors ligne', de: 'Offline', it: 'Offline',
    },
    liveLastData: {
        pt: 'Último dado: {time}', en: 'Last data: {time}', es: 'Último dato: {time}',
        fr: 'Dernière donnée : {time}', de: 'Letzte Daten: {time}', it: 'Ultimo dato: {time}',
    },
    liveNoData: {
        pt: 'Nenhum dado recebido', en: 'No data received', es: 'Ningún dato recibido',
        fr: 'Aucune donnée reçue', de: 'Keine Daten empfangen', it: 'Nessun dato ricevuto',
    },
    liveRetry: {
        pt: 'Tentar agora', en: 'Retry now', es: 'Reintentar ahora',
        fr: 'Réessayer maintenant', de: 'Jetzt erneut versuchen', it: 'Riprova ora',
    },
    usageOf: {
        pt: '{used} de {limit}', en: '{used} of {limit}', es: '{used} de {limit}',
        fr: '{used} sur {limit}', de: '{used} von {limit}', it: '{used} di {limit}',
    },
    usageOk: {
        pt: 'Dentro do limite', en: 'Within the limit', es: 'Dentro del límite',
        fr: 'Dans la limite', de: 'Innerhalb des Limits', it: 'Entro il limite',
    },
    usageWarning: {
        pt: 'Perto do limite', en: 'Near the limit', es: 'Cerca del límite',
        fr: 'Proche de la limite', de: 'Nahe am Limit', it: 'Vicino al limite',
    },
    usageCritical: {
        pt: 'Limite quase esgotado', en: 'Limit almost used up', es: 'Límite casi agotado',
        fr: 'Limite presque atteinte', de: 'Limit fast ausgeschöpft', it: 'Limite quasi esaurito',
    },
    usageExceeded: {
        pt: 'Limite excedido', en: 'Limit exceeded', es: 'Límite superado',
        fr: 'Limite dépassée', de: 'Limit überschritten', it: 'Limite superato',
    },
    permMatrix: {
        pt: 'Matriz de permissões', en: 'Permission matrix', es: 'Matriz de permisos',
        fr: 'Matrice des permissions', de: 'Berechtigungsmatrix', it: 'Matrice dei permessi',
    },
    permPermission: {
        pt: 'Permissão', en: 'Permission', es: 'Permiso',
        fr: 'Permission', de: 'Berechtigung', it: 'Permesso',
    },
    permDirect: {
        pt: 'Concedida direto', en: 'Granted directly', es: 'Concedido directamente',
        fr: 'Accordée directement', de: 'Direkt erteilt', it: 'Concesso direttamente',
    },
    permInherited: {
        pt: 'Herdada', en: 'Inherited', es: 'Heredado',
        fr: 'Héritée', de: 'Geerbt', it: 'Ereditato',
    },
    permNone: {
        pt: 'Sem acesso', en: 'No access', es: 'Sin acceso',
        fr: 'Aucun accès', de: 'Kein Zugriff', it: 'Nessun accesso',
    },
    memberMembers: {
        pt: 'Membros', en: 'Members', es: 'Miembros',
        fr: 'Membres', de: 'Mitglieder', it: 'Membri',
    },
    memberInvites: {
        pt: 'Convites pendentes', en: 'Pending invitations', es: 'Invitaciones pendientes',
        fr: 'Invitations en attente', de: 'Ausstehende Einladungen', it: 'Inviti in sospeso',
    },
    memberInvitedAt: {
        pt: 'Convidado em {date}', en: 'Invited on {date}', es: 'Invitado el {date}',
        fr: 'Invité le {date}', de: 'Eingeladen am {date}', it: 'Invitato il {date}',
    },
    memberRemove: {
        pt: 'Remover {name}', en: 'Remove {name}', es: 'Eliminar a {name}',
        fr: 'Retirer {name}', de: '{name} entfernen', it: 'Rimuovi {name}',
    },
    memberResend: {
        pt: 'Reenviar convite para {email}', en: 'Resend invitation to {email}', es: 'Reenviar invitación a {email}',
        fr: 'Renvoyer l’invitation à {email}', de: 'Einladung an {email} erneut senden', it: 'Reinvia l’invito a {email}',
    },
    memberRevoke: {
        pt: 'Revogar convite de {email}', en: 'Revoke invitation for {email}', es: 'Revocar invitación de {email}',
        fr: 'Révoquer l’invitation de {email}', de: 'Einladung für {email} widerrufen', it: 'Revoca l’invito di {email}',
    },
    memberEmpty: {
        pt: 'Nenhum membro ainda.', en: 'No members yet.', es: 'Aún no hay miembros.',
        fr: 'Aucun membre pour l’instant.', de: 'Noch keine Mitglieder.', it: 'Ancora nessun membro.',
    },
    sessionCurrent: {
        pt: 'Esta sessão', en: 'This session', es: 'Esta sesión',
        fr: 'Cette session', de: 'Diese Sitzung', it: 'Questa sessione',
    },
    sessionRevoke: {
        pt: 'Encerrar sessão em {device}', en: 'End session on {device}', es: 'Cerrar sesión en {device}',
        fr: 'Terminer la session sur {device}', de: 'Sitzung auf {device} beenden', it: 'Termina la sessione su {device}',
    },
    sessionRevokeOthers: {
        pt: 'Encerrar as outras sessões', en: 'End all other sessions', es: 'Cerrar las demás sesiones',
        fr: 'Terminer les autres sessions', de: 'Alle anderen Sitzungen beenden', it: 'Termina le altre sessioni',
    },
    sessionLastActive: {
        pt: 'Última atividade: {time}', en: 'Last active: {time}', es: 'Última actividad: {time}',
        fr: 'Dernière activité : {time}', de: 'Zuletzt aktiv: {time}', it: 'Ultima attività: {time}',
    },
    sessionEmpty: {
        pt: 'Nenhuma sessão ativa.', en: 'No active sessions.', es: 'Ninguna sesión activa.',
        fr: 'Aucune session active.', de: 'Keine aktiven Sitzungen.', it: 'Nessuna sessione attiva.',
    },
} satisfies Record<string, LibraryTextEntry>;
