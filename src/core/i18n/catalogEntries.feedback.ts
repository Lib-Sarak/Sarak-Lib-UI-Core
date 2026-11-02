import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Textos de feedback e de seletores simples de filtro. */
export const CATALOG_FEEDBACK = {
    filterSelectAll: {
        pt: 'Todos', en: 'All', es: 'Todos',
        fr: 'Tous', de: 'Alle', it: 'Tutti',
    },
    errorBoundaryTitle: {
        pt: 'Este bloco não pôde ser exibido', en: 'This block could not be displayed',
        es: 'Este bloque no se pudo mostrar', fr: 'Ce bloc n’a pas pu être affiché',
        de: 'Dieser Bereich konnte nicht angezeigt werden', it: 'Questo blocco non può essere visualizzato',
    },
    errorBoundaryMessage: {
        pt: 'O restante da tela continua funcionando.', en: 'The rest of the screen keeps working.',
        es: 'El resto de la pantalla sigue funcionando.', fr: 'Le reste de l’écran continue de fonctionner.',
        de: 'Der Rest der Ansicht funktioniert weiterhin.', it: 'Il resto della schermata continua a funzionare.',
    },
    errorBoundaryRetry: {
        pt: 'Tentar de novo', en: 'Try again', es: 'Intentar de nuevo',
        fr: 'Réessayer', de: 'Erneut versuchen', it: 'Riprova',
    },
    unsavedChangesTitle: {
        pt: 'Sair sem salvar?', en: 'Leave without saving?', es: '¿Salir sin guardar?',
        fr: 'Quitter sans enregistrer ?', de: 'Ohne Speichern verlassen?', it: 'Uscire senza salvare?',
    },
    unsavedChangesMessage: {
        pt: 'As alterações feitas aqui serão perdidas.', en: 'The changes made here will be lost.',
        es: 'Los cambios realizados aquí se perderán.', fr: 'Les modifications effectuées ici seront perdues.',
        de: 'Die hier vorgenommenen Änderungen gehen verloren.', it: 'Le modifiche apportate qui andranno perse.',
    },
    unsavedChangesLeave: {
        pt: 'Sair sem salvar', en: 'Leave without saving', es: 'Salir sin guardar',
        fr: 'Quitter sans enregistrer', de: 'Ohne Speichern verlassen', it: 'Esci senza salvare',
    },
    unsavedChangesStay: {
        pt: 'Continuar editando', en: 'Keep editing', es: 'Seguir editando',
        fr: 'Continuer la modification', de: 'Weiter bearbeiten', it: 'Continua a modificare',
    },
    errorMessageUnknown: {
        pt: 'Não foi possível concluir a operação. Tente novamente.', en: 'The operation could not be completed. Try again.',
        es: 'No se pudo completar la operación. Inténtelo de nuevo.', fr: 'L’opération n’a pas pu aboutir. Réessayez.',
        de: 'Der Vorgang konnte nicht abgeschlossen werden. Versuchen Sie es erneut.', it: 'Impossibile completare l’operazione. Riprova.',
    },
    errorMessageNetwork: {
        pt: 'Não foi possível conectar ao servidor. Verifique a conexão e tente novamente.', en: 'Could not reach the server. Check the connection and try again.',
        es: 'No se pudo conectar con el servidor. Compruebe la conexión e inténtelo de nuevo.', fr: 'Impossible de joindre le serveur. Vérifiez la connexion et réessayez.',
        de: 'Der Server ist nicht erreichbar. Prüfen Sie die Verbindung und versuchen Sie es erneut.', it: 'Impossibile raggiungere il server. Controlla la connessione e riprova.',
    },
} satisfies Record<string, LibraryTextEntry>;
