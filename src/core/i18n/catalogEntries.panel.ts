import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Textos do painel de customização: amostra de fonte, filtros de paleta e menu de ações do tema. */
export const CATALOG_PANEL = {
    fontSampleTitle: {
        pt: 'Relatório mensal', en: 'Monthly report', es: 'Informe mensual',
        fr: 'Rapport mensuel', de: 'Monatsbericht', it: 'Rapporto mensile',
    },
    fontSamplePhrase: {
        pt: 'A atenção aos detalhes faz a diferença.', en: 'Attention to detail makes the difference.',
        es: 'La atención al detalle marca la diferencia.', fr: 'L’attention aux détails fait la différence.',
        de: 'Die Liebe zum Detail macht den Unterschied.', it: 'L’attenzione ai dettagli fa la differenza.',
    },
    fontSampleNumber: {
        pt: 'R$ 12.480,00', en: '$12,480.00', es: '12.480,00 €',
        fr: '12 480,00 €', de: '12.480,00 €', it: '€ 12.480,00',
    },
    peekNotice: {
        pt: 'Prévia: nada foi gravado', en: 'Preview only: nothing saved', es: 'Vista previa: nada se guardó',
        fr: 'Aperçu : rien n’est enregistré', de: 'Nur Vorschau: nichts gespeichert', it: 'Anteprima: nulla salvato',
    },
    sampleCardTitle: {
        pt: 'Receita do mês', en: 'Monthly revenue', es: 'Ingresos del mes',
        fr: 'Revenu du mois', de: 'Monatsumsatz', it: 'Ricavi del mese',
    },
    sampleCardAction: {
        pt: 'Ver detalhes', en: 'View details', es: 'Ver detalles',
        fr: 'Voir les détails', de: 'Details ansehen', it: 'Vedi dettagli',
    },
    sampleButtonRest: { pt: 'Repouso', en: 'Rest', es: 'Reposo', fr: 'Repos', de: 'Ruhe', it: 'Riposo' },
    sampleButtonHover: { pt: 'Mouse em cima', en: 'Hover', es: 'Cursor encima', fr: 'Survol', de: 'Hover', it: 'Hover' },
    sampleButtonFocus: { pt: 'Foco', en: 'Focus', es: 'Foco', fr: 'Focus', de: 'Fokus', it: 'Focus' },
    sampleButtonDisabled: { pt: 'Inativo', en: 'Disabled', es: 'Inactivo', fr: 'Inactif', de: 'Inaktiv', it: 'Inattivo' },
    sampleInputLabel: { pt: 'Nome do cliente', en: 'Customer name', es: 'Nombre del cliente', fr: 'Nom du client', de: 'Kundenname', it: 'Nome del cliente' },
    sampleInputValue: { pt: 'Maria Souza', en: 'Maria Souza', es: 'María Souza', fr: 'Marie Souza', de: 'Maria Souza', it: 'Maria Souza' },
    paletteFilterLabel: {
        pt: 'Filtrar paletas por tipo', en: 'Filter palettes by type', es: 'Filtrar paletas por tipo',
        fr: 'Filtrer les palettes par type', de: 'Paletten nach Typ filtern', it: 'Filtra le tavolozze per tipo',
    },
    paletteFilterAll: {
        pt: 'Todas', en: 'All', es: 'Todas', fr: 'Toutes', de: 'Alle', it: 'Tutte',
    },
    themeMoreActions: {
        pt: 'Mais ações', en: 'More actions', es: 'Más acciones',
        fr: 'Plus d’actions', de: 'Weitere Aktionen', it: 'Altre azioni',
    },
    themeUndoLastApplyAction: {
        pt: 'Desfazer última aplicação', en: 'Undo last apply', es: 'Deshacer la última aplicación',
        fr: 'Annuler la dernière application', de: 'Letzte Anwendung rückgängig machen', it: 'Annulla l’ultima applicazione',
    },
    themeChangesListLabel: {
        pt: 'Alterações pendentes', en: 'Pending changes', es: 'Cambios pendientes',
        fr: 'Modifications en attente', de: 'Ausstehende Änderungen', it: 'Modifiche in sospeso',
    },
    themeChangeApplied: {
        pt: 'aplicado', en: 'applied', es: 'aplicado', fr: 'appliqué', de: 'angewendet', it: 'applicato',
    },
    themeChangeDraft: {
        pt: 'rascunho', en: 'draft', es: 'borrador', fr: 'brouillon', de: 'Entwurf', it: 'bozza',
    },
} satisfies Record<string, LibraryTextEntry>;
