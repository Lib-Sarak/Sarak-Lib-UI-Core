import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Rótulos genéricos de autenticação, login social e ações de itens. */
export const CATALOG_PART_5 = {
    authTitleLogin: {
        pt: 'Entrar', en: 'Sign in', es: 'Iniciar sesión',
        fr: 'Se connecter', de: 'Anmelden', it: 'Accedi',
    },
    authTitleRegister: {
        pt: 'Criar conta', en: 'Create account', es: 'Crear cuenta',
        fr: 'Créer un compte', de: 'Konto erstellen', it: 'Crea un account',
    },
    authTitleMfa: {
        pt: 'Verificar código', en: 'Verify code', es: 'Verificar código',
        fr: 'Vérifier le code', de: 'Code überprüfen', it: 'Verifica il codice',
    },
    authDescriptionLogin: {
        pt: 'Informe suas credenciais para continuar.', en: 'Enter your credentials to continue.', es: 'Introduce tus credenciales para continuar.',
        fr: 'Saisissez vos identifiants pour continuer.', de: 'Gib deine Anmeldedaten ein, um fortzufahren.', it: 'Inserisci le credenziali per continuare.',
    },
    authDescriptionRegister: {
        pt: 'Informe seu e-mail e escolha uma senha.', en: 'Enter your email and choose a password.', es: 'Introduce tu correo y elige una contraseña.',
        fr: 'Saisissez votre e-mail et choisissez un mot de passe.', de: 'Gib deine E-Mail-Adresse ein und wähle ein Passwort.', it: 'Inserisci l’e-mail e scegli una password.',
    },
    authDescriptionMfa: {
        pt: 'Informe o código de verificação.', en: 'Enter the verification code.', es: 'Introduce el código de verificación.',
        fr: 'Saisissez le code de vérification.', de: 'Gib den Bestätigungscode ein.', it: 'Inserisci il codice di verifica.',
    },
    authEmailLabel: {
        pt: 'E-mail', en: 'Email', es: 'Correo electrónico',
        fr: 'E-mail', de: 'E-Mail', it: 'E-mail',
    },
    authEmailPlaceholder: {
        pt: 'nome@exemplo.com', en: 'name@example.com', es: 'nombre@ejemplo.com',
        fr: 'nom@exemple.com', de: 'name@beispiel.de', it: 'nome@esempio.it',
    },
    authPasswordLabel: {
        pt: 'Senha', en: 'Password', es: 'Contraseña',
        fr: 'Mot de passe', de: 'Passwort', it: 'Password',
    },
    authMfaLabel: {
        pt: 'Código de verificação', en: 'Verification code', es: 'Código de verificación',
        fr: 'Code de vérification', de: 'Bestätigungscode', it: 'Codice di verifica',
    },
    authForgotPassword: {
        pt: 'Esqueceu a senha?', en: 'Forgot password?', es: '¿Olvidaste la contraseña?',
        fr: 'Mot de passe oublié ?', de: 'Passwort vergessen?', it: 'Password dimenticata?',
    },
    authBackToPassword: {
        pt: 'Voltar', en: 'Back', es: 'Volver',
        fr: 'Retour', de: 'Zurück', it: 'Indietro',
    },
    authSubmitLogin: {
        pt: 'Entrar', en: 'Sign in', es: 'Iniciar sesión',
        fr: 'Se connecter', de: 'Anmelden', it: 'Accedi',
    },
    authSubmitRegister: {
        pt: 'Criar conta', en: 'Create account', es: 'Crear cuenta',
        fr: 'Créer un compte', de: 'Konto erstellen', it: 'Crea un account',
    },
    authSubmitMfa: {
        pt: 'Confirmar', en: 'Confirm', es: 'Confirmar',
        fr: 'Confirmer', de: 'Bestätigen', it: 'Conferma',
    },
    authHasAccount: {
        pt: 'Já tem uma conta?', en: 'Already have an account?', es: '¿Ya tienes una cuenta?',
        fr: 'Vous avez déjà un compte ?', de: 'Hast du bereits ein Konto?', it: 'Hai già un account?',
    },
    authNoAccount: {
        pt: 'Ainda não tem uma conta?', en: 'Don’t have an account yet?', es: '¿Aún no tienes una cuenta?',
        fr: 'Vous n’avez pas encore de compte ?', de: 'Noch kein Konto?', it: 'Non hai ancora un account?',
    },
    authToggleLogin: {
        pt: 'Entrar', en: 'Sign in', es: 'Iniciar sesión',
        fr: 'Se connecter', de: 'Anmelden', it: 'Accedi',
    },
    authToggleRegister: {
        pt: 'Criar conta', en: 'Create account', es: 'Crear cuenta',
        fr: 'Créer un compte', de: 'Konto erstellen', it: 'Crea un account',
    },
    authSocialDivider: {
        pt: 'Ou continue com', en: 'Or continue with', es: 'O continúa con',
        fr: 'Ou continuer avec', de: 'Oder weiter mit', it: 'Oppure continua con',
    },
    socialContinueWithProvider: {
        pt: 'Continuar com {provider}', en: 'Continue with {provider}', es: 'Continuar con {provider}',
        fr: 'Continuer avec {provider}', de: 'Weiter mit {provider}', it: 'Continua con {provider}',
    },
    managementToggleItem: {
        pt: 'Alterar estado do item', en: 'Toggle item state', es: 'Cambiar estado del elemento',
        fr: 'Modifier l’état de l’élément', de: 'Elementstatus ändern', it: 'Cambia lo stato dell’elemento',
    },
    managementDeleteItem: {
        pt: 'Excluir item', en: 'Delete item', es: 'Eliminar elemento',
        fr: 'Supprimer l’élément', de: 'Element löschen', it: 'Elimina elemento',
    },
    rangeMinAriaLabel: {
        pt: '{label} mínimo', en: '{label} minimum', es: '{label} mínimo',
        fr: '{label} minimum', de: '{label} Minimum', it: '{label} minimo',
    },
    rangeMaxAriaLabel: {
        pt: '{label} máximo', en: '{label} maximum', es: '{label} máximo',
        fr: '{label} maximum', de: '{label} Maximum', it: '{label} massimo',
    },
    timeGroupAriaLabel: {
        pt: 'Horário', en: 'Time', es: 'Hora',
        fr: 'Heure', de: 'Uhrzeit', it: 'Orario',
    },
    fieldSearchPlaceholder: {
        pt: 'Buscar...', en: 'Search...', es: 'Buscar...',
        fr: 'Rechercher...', de: 'Suchen...', it: 'Cerca...',
    },
    multiSelectRemoveAriaLabel: {
        pt: 'Remover {label}', en: 'Remove {label}', es: 'Eliminar {label}',
        fr: 'Supprimer {label}', de: '{label} entfernen', it: 'Rimuovi {label}',
    },
    timeHourAriaLabel: {
        pt: 'Hora', en: 'Hour', es: 'Hora',
        fr: 'Heure', de: 'Stunde', it: 'Ora',
    },
    timeMinuteAriaLabel: {
        pt: 'Minuto', en: 'Minute', es: 'Minuto',
        fr: 'Minute', de: 'Minute', it: 'Minuto',
    },
    rangeDefaultLabel: {
        pt: 'Intervalo', en: 'Range', es: 'Intervalo',
        fr: 'Plage', de: 'Bereich', it: 'Intervallo',
    },
    richTextToolbarAriaLabel: {
        pt: 'Formatação', en: 'Formatting', es: 'Formato',
        fr: 'Mise en forme', de: 'Formatierung', it: 'Formattazione',
    },
    richTextBoldAction: {
        pt: 'Negrito', en: 'Bold', es: 'Negrita',
        fr: 'Gras', de: 'Fett', it: 'Grassetto',
    },
    richTextItalicAction: {
        pt: 'Itálico', en: 'Italic', es: 'Cursiva',
        fr: 'Italique', de: 'Kursiv', it: 'Corsivo',
    },
    richTextUnorderedListAction: {
        pt: 'Lista', en: 'Bulleted list', es: 'Lista con viñetas',
        fr: 'Liste à puces', de: 'Aufzählungsliste', it: 'Elenco puntato',
    },
    richTextOrderedListAction: {
        pt: 'Lista numerada', en: 'Numbered list', es: 'Lista numerada',
        fr: 'Liste numérotée', de: 'Nummerierte Liste', it: 'Elenco numerato',
    },
    richTextInsertLinkAction: {
        pt: 'Inserir link', en: 'Insert link', es: 'Insertar enlace',
        fr: 'Insérer un lien', de: 'Link einfügen', it: 'Inserisci link',
    },
    richTextLinkUrlPrompt: {
        pt: 'URL do link:', en: 'Link URL:', es: 'URL del enlace:',
        fr: 'URL du lien :', de: 'Link-URL:', it: 'URL del link:',
    },
    pdfViewerLoadError: {
        pt: 'Falha ao carregar PDF', en: 'Failed to load PDF', es: 'Error al cargar el PDF',
        fr: 'Échec du chargement du PDF', de: 'PDF konnte nicht geladen werden',
        it: 'Errore durante il caricamento del PDF',
    },
    pdfViewerWorkerSrcRequired: {
        pt: 'Configure a prop workerSrc com a URL do worker de PDF.js.',
        en: 'Set the workerSrc prop to the PDF.js worker URL.',
        es: 'Configure la prop workerSrc con la URL del worker de PDF.js.',
        fr: 'Configurez la prop workerSrc avec l’URL du worker PDF.js.',
        de: 'Setzen Sie die Prop workerSrc auf die URL des PDF.js-Workers.',
        it: 'Imposta la prop workerSrc con l’URL del worker PDF.js.',
    },
} satisfies Record<string, LibraryTextEntry>;
