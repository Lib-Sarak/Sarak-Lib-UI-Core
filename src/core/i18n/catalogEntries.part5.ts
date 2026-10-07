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
} satisfies Record<string, LibraryTextEntry>;
