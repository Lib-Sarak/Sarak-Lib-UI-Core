import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Textos das entradas e utilitários: cor, conjunto, etiquetas, código, formulário gerado, assistente, popover, copiar, QR e arquivo. */
export const CATALOG_ENTRIES = {
    colorInputSwatch: {
        pt: 'Escolher cor', en: 'Pick a color', es: 'Elegir color',
        fr: 'Choisir une couleur', de: 'Farbe wählen', it: 'Scegli il colore',
    },
    colorInputInvalid: {
        pt: 'Cor inválida', en: 'Invalid color', es: 'Color no válido',
        fr: 'Couleur invalide', de: 'Ungültige Farbe', it: 'Colore non valido',
    },
    colorInputLowContrast: {
        pt: 'Contraste {ratio}:1, abaixo do mínimo de {min}:1', en: 'Contrast {ratio}:1, below the {min}:1 minimum',
        es: 'Contraste {ratio}:1, por debajo del mínimo de {min}:1', fr: 'Contraste {ratio}:1, inférieur au minimum de {min}:1',
        de: 'Kontrast {ratio}:1, unter dem Minimum von {min}:1', it: 'Contrasto {ratio}:1, sotto il minimo di {min}:1',
    },
    setPickerAvailable: {
        pt: 'Disponíveis', en: 'Available', es: 'Disponibles',
        fr: 'Disponibles', de: 'Verfügbar', it: 'Disponibili',
    },
    setPickerChosen: {
        pt: 'Escolhidos', en: 'Chosen', es: 'Elegidos',
        fr: 'Choisis', de: 'Ausgewählt', it: 'Scelti',
    },
    setPickerSearch: {
        pt: 'Buscar', en: 'Search', es: 'Buscar',
        fr: 'Rechercher', de: 'Suchen', it: 'Cerca',
    },
    setPickerFilters: {
        pt: 'Filtros', en: 'Filters', es: 'Filtros',
        fr: 'Filtres', de: 'Filter', it: 'Filtri',
    },
    setPickerAdd: {
        pt: 'Adicionar {item}', en: 'Add {item}', es: 'Añadir {item}',
        fr: 'Ajouter {item}', de: '{item} hinzufügen', it: 'Aggiungi {item}',
    },
    setPickerRemove: {
        pt: 'Remover {item}', en: 'Remove {item}', es: 'Quitar {item}',
        fr: 'Retirer {item}', de: '{item} entfernen', it: 'Rimuovi {item}',
    },
    setPickerAddAll: {
        pt: 'Adicionar todos os exibidos', en: 'Add all shown', es: 'Añadir todos los mostrados',
        fr: 'Ajouter tous les affichés', de: 'Alle angezeigten hinzufügen', it: 'Aggiungi tutti i mostrati',
    },
    setPickerClear: {
        pt: 'Remover todos', en: 'Remove all', es: 'Quitar todos',
        fr: 'Tout retirer', de: 'Alle entfernen', it: 'Rimuovi tutti',
    },
    setPickerEmptyAvailable: {
        pt: 'Nada disponível', en: 'Nothing available', es: 'Nada disponible',
        fr: 'Rien de disponible', de: 'Nichts verfügbar', it: 'Niente di disponibile',
    },
    setPickerEmptyChosen: {
        pt: 'Nada escolhido', en: 'Nothing chosen', es: 'Nada elegido',
        fr: 'Rien de choisi', de: 'Nichts ausgewählt', it: 'Niente di scelto',
    },
    tagInputRemove: {
        pt: 'Remover {tag}', en: 'Remove {tag}', es: 'Quitar {tag}',
        fr: 'Retirer {tag}', de: '{tag} entfernen', it: 'Rimuovi {tag}',
    },
    tagInputDuplicate: {
        pt: 'Esta etiqueta já foi adicionada', en: 'This tag was already added', es: 'Esta etiqueta ya se añadió',
        fr: 'Cette étiquette a déjà été ajoutée', de: 'Dieses Tag wurde bereits hinzugefügt', it: 'Questa etichetta è già stata aggiunta',
    },
    tagInputLimit: {
        pt: 'Limite de {max} etiquetas', en: 'Limit of {max} tags', es: 'Límite de {max} etiquetas',
        fr: 'Limite de {max} étiquettes', de: 'Limit von {max} Tags', it: 'Limite di {max} etichette',
    },
    codeInputGroup: {
        pt: 'Código de verificação', en: 'Verification code', es: 'Código de verificación',
        fr: 'Code de vérification', de: 'Bestätigungscode', it: 'Codice di verifica',
    },
    codeInputCell: {
        pt: 'Caractere {index} de {total}', en: 'Character {index} of {total}', es: 'Carácter {index} de {total}',
        fr: 'Caractère {index} sur {total}', de: 'Zeichen {index} von {total}', it: 'Carattere {index} di {total}',
    },
    fieldRendererSelect: {
        pt: 'Selecione', en: 'Select', es: 'Seleccione',
        fr: 'Sélectionnez', de: 'Auswählen', it: 'Seleziona',
    },
    wizardAriaLabel: {
        pt: 'Assistente', en: 'Wizard', es: 'Asistente',
        fr: 'Assistant', de: 'Assistent', it: 'Procedura guidata',
    },
    wizardBack: {
        pt: 'Voltar', en: 'Back', es: 'Atrás',
        fr: 'Retour', de: 'Zurück', it: 'Indietro',
    },
    wizardNext: {
        pt: 'Avançar', en: 'Next', es: 'Siguiente',
        fr: 'Suivant', de: 'Weiter', it: 'Avanti',
    },
    wizardFinish: {
        pt: 'Concluir', en: 'Finish', es: 'Finalizar',
        fr: 'Terminer', de: 'Abschließen', it: 'Termina',
    },
    wizardCancel: {
        pt: 'Cancelar', en: 'Cancel', es: 'Cancelar',
        fr: 'Annuler', de: 'Abbrechen', it: 'Annulla',
    },
    wizardStepInvalid: {
        pt: 'Revise esta etapa para continuar', en: 'Review this step to continue', es: 'Revise este paso para continuar',
        fr: 'Vérifiez cette étape pour continuer', de: 'Prüfen Sie diesen Schritt, um fortzufahren', it: 'Controlla questo passaggio per continuare',
    },
    popoverClose: {
        pt: 'Fechar', en: 'Close', es: 'Cerrar',
        fr: 'Fermer', de: 'Schließen', it: 'Chiudi',
    },
    copyButtonCopy: {
        pt: 'Copiar', en: 'Copy', es: 'Copiar',
        fr: 'Copier', de: 'Kopieren', it: 'Copia',
    },
    copyButtonCopied: {
        pt: 'Copiado', en: 'Copied', es: 'Copiado',
        fr: 'Copié', de: 'Kopiert', it: 'Copiato',
    },
    copyButtonFailed: {
        pt: 'Não foi possível copiar', en: 'Could not copy', es: 'No se pudo copiar',
        fr: 'Copie impossible', de: 'Kopieren nicht möglich', it: 'Copia non riuscita',
    },
    qrCodeAriaLabel: {
        pt: 'Código QR', en: 'QR code', es: 'Código QR',
        fr: 'Code QR', de: 'QR-Code', it: 'Codice QR',
    },
    fileActionDownload: {
        pt: 'Baixar', en: 'Download', es: 'Descargar',
        fr: 'Télécharger', de: 'Herunterladen', it: 'Scarica',
    },
    fileActionOpen: {
        pt: 'Abrir', en: 'Open', es: 'Abrir',
        fr: 'Ouvrir', de: 'Öffnen', it: 'Apri',
    },
    fileActionError: {
        pt: 'Não foi possível obter o arquivo', en: 'Could not get the file', es: 'No se pudo obtener el archivo',
        fr: 'Impossible d’obtenir le fichier', de: 'Die Datei konnte nicht geladen werden', it: 'Impossibile ottenere il file',
    },
    fileActionRetry: {
        pt: 'Tentar de novo', en: 'Try again', es: 'Intentar de nuevo',
        fr: 'Réessayer', de: 'Erneut versuchen', it: 'Riprova',
    },
} satisfies Record<string, LibraryTextEntry>;
