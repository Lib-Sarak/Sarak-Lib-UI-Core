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
