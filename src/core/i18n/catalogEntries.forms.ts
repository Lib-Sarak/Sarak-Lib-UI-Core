import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Textos da lib para formulário; cada plan da rc.4 acrescenta aqui os seus. */
export const CATALOG_FORMS = {
    invalidCpfMessage: {
        pt: 'CPF inválido', en: 'Invalid CPF', es: 'CPF no válido',
        fr: 'CPF invalide', de: 'Ungültige CPF', it: 'Codice fiscale non valido',
    },
    invalidCnpjMessage: {
        pt: 'CNPJ inválido', en: 'Invalid CNPJ', es: 'CNPJ no válido',
        fr: 'CNPJ invalide', de: 'Ungültige CNPJ', it: 'CNPJ non valido',
    },
    selectAriaLabel: {
        pt: 'Selecionar opção', en: 'Select option', es: 'Seleccionar opción',
        fr: 'Sélectionner une option', de: 'Option auswählen', it: 'Seleziona opzione',
    },
    autocompleteCreateLabel: {
        pt: 'Criar “{query}”', en: 'Create “{query}”', es: 'Crear “{query}”',
        fr: 'Créer « {query} »', de: '„{query}“ erstellen', it: 'Crea “{query}”',
    },
    datePickerInvalidMessage: {
        pt: 'Data inválida ou fora dos limites', en: 'Invalid date or outside the allowed range',
        es: 'Fecha no válida o fuera de los límites', fr: 'Date invalide ou hors limites',
        de: 'Ungültiges Datum oder außerhalb des zulässigen Bereichs', it: 'Data non valida o fuori dai limiti',
    },
    datePickerClear: {
        pt: 'Limpar data', en: 'Clear date', es: 'Borrar fecha',
        fr: 'Effacer la date', de: 'Datum löschen', it: 'Cancella data',
    },
    datePresetToday: {
        pt: 'Hoje', en: 'Today', es: 'Hoy', fr: 'Aujourd’hui', de: 'Heute', it: 'Oggi',
    },
    datePresetYesterday: {
        pt: 'Ontem', en: 'Yesterday', es: 'Ayer', fr: 'Hier', de: 'Gestern', it: 'Ieri',
    },
    datePresetLast7Days: {
        pt: 'Últimos 7 dias', en: 'Last 7 days', es: 'Últimos 7 días',
        fr: '7 derniers jours', de: 'Letzte 7 Tage', it: 'Ultimi 7 giorni',
    },
    datePresetLast30Days: {
        pt: 'Últimos 30 dias', en: 'Last 30 days', es: 'Últimos 30 días',
        fr: '30 derniers jours', de: 'Letzte 30 Tage', it: 'Ultimi 30 giorni',
    },
    datePresetThisMonth: {
        pt: 'Este mês', en: 'This month', es: 'Este mes', fr: 'Ce mois-ci', de: 'Dieser Monat', it: 'Questo mese',
    },
    datePresetLastMonth: {
        pt: 'Mês passado', en: 'Last month', es: 'El mes pasado', fr: 'Le mois dernier', de: 'Letzter Monat', it: 'Il mese scorso',
    },
    datePresetThisQuarter: {
        pt: 'Este trimestre', en: 'This quarter', es: 'Este trimestre', fr: 'Ce trimestre', de: 'Dieses Quartal', it: 'Questo trimestre',
    },
    datePresetThisYear: {
        pt: 'Este ano', en: 'This year', es: 'Este año', fr: 'Cette année', de: 'Dieses Jahr', it: 'Quest’anno',
    },
} satisfies Record<string, LibraryTextEntry>;
