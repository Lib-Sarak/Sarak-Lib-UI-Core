import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Os textos das paletas salvas com nome: salvar no criador, o grupo "Minhas paletas", apagar e o atalho de marca. */
export const CATALOG_PALETTE_SAVED = {
    paletteMineTitle: {
        pt: 'Minhas paletas', en: 'My palettes', es: 'Mis paletas',
        fr: 'Mes palettes', de: 'Meine Paletten', it: 'Le mie tavolozze',
    },
    paletteSaveNameLabel: {
        pt: 'Nome da paleta', en: 'Palette name', es: 'Nombre de la paleta',
        fr: 'Nom de la palette', de: 'Name der Palette', it: 'Nome della tavolozza',
    },
    paletteSaveAction: {
        pt: 'Salvar paleta', en: 'Save palette', es: 'Guardar paleta',
        fr: 'Enregistrer la palette', de: 'Palette speichern', it: 'Salva tavolozza',
    },
    paletteSaveNameRequired: {
        pt: 'Dê um nome à paleta para salvar.', en: 'Give the palette a name to save it.', es: 'Dé un nombre a la paleta para guardarla.',
        fr: 'Donnez un nom à la palette pour l’enregistrer.', de: 'Geben Sie der Palette einen Namen, um sie zu speichern.', it: 'Dai un nome alla tavolozza per salvarla.',
    },
    paletteSaveFull: {
        pt: 'O limite de {max} paletas salvas foi atingido. Apague uma para salvar outra.',
        en: 'The limit of {max} saved palettes was reached. Delete one to save another.',
        es: 'Se alcanzó el límite de {max} paletas guardadas. Borre una para guardar otra.',
        fr: 'La limite de {max} palettes enregistrées est atteinte. Supprimez-en une pour en enregistrer une autre.',
        de: 'Das Limit von {max} gespeicherten Paletten ist erreicht. Löschen Sie eine, um eine weitere zu speichern.',
        it: 'Il limite di {max} tavolozze salvate è stato raggiunto. Eliminane una per salvarne un’altra.',
    },
    paletteSavedStatus: {
        pt: 'Paleta “{name}” salva. Ela é gravada quando você aplicar.',
        en: 'Palette “{name}” saved. It is stored when you apply.',
        es: 'Paleta “{name}” guardada. Se graba cuando aplique.',
        fr: 'Palette « {name} » enregistrée. Elle est stockée à l’application.',
        de: 'Palette „{name}“ gespeichert. Sie wird beim Anwenden abgelegt.',
        it: 'Tavolozza “{name}” salvata. Viene memorizzata quando applichi.',
    },
    paletteSaveReplaceTitle: {
        pt: 'Substituir a paleta?', en: 'Replace the palette?', es: '¿Reemplazar la paleta?',
        fr: 'Remplacer la palette ?', de: 'Palette ersetzen?', it: 'Sostituire la tavolozza?',
    },
    paletteSaveReplaceMessage: {
        pt: 'Já existe uma paleta chamada “{name}”. Substituir pelas cores novas?',
        en: 'A palette named “{name}” already exists. Replace it with the new colors?',
        es: 'Ya existe una paleta llamada “{name}”. ¿Reemplazarla por los colores nuevos?',
        fr: 'Une palette nommée « {name} » existe déjà. La remplacer par les nouvelles couleurs ?',
        de: 'Eine Palette namens „{name}“ gibt es schon. Durch die neuen Farben ersetzen?',
        it: 'Esiste già una tavolozza chiamata “{name}”. Sostituirla con i colori nuovi?',
    },
    paletteSaveReplaceConfirm: {
        pt: 'Substituir', en: 'Replace', es: 'Reemplazar', fr: 'Remplacer', de: 'Ersetzen', it: 'Sostituisci',
    },
    paletteSaveReplaceCancel: {
        pt: 'Manter a atual', en: 'Keep the current one', es: 'Mantener la actual',
        fr: 'Garder l’actuelle', de: 'Aktuelle behalten', it: 'Mantieni quella attuale',
    },
    paletteDeleteLabel: {
        pt: 'Apagar a paleta {name}', en: 'Delete palette {name}', es: 'Borrar la paleta {name}',
        fr: 'Supprimer la palette {name}', de: 'Palette {name} löschen', it: 'Elimina la tavolozza {name}',
    },
    paletteDeleteTitle: {
        pt: 'Apagar a paleta?', en: 'Delete the palette?', es: '¿Borrar la paleta?',
        fr: 'Supprimer la palette ?', de: 'Palette löschen?', it: 'Eliminare la tavolozza?',
    },
    paletteDeleteMessage: {
        pt: 'A paleta “{name}” sai da lista quando você aplicar. As cores que já estão na tela não mudam.',
        en: 'The palette “{name}” leaves the list when you apply. The colors already on screen do not change.',
        es: 'La paleta “{name}” sale de la lista cuando aplique. Los colores que ya están en pantalla no cambian.',
        fr: 'La palette « {name} » quitte la liste à l’application. Les couleurs déjà à l’écran ne changent pas.',
        de: 'Die Palette „{name}“ verschwindet beim Anwenden aus der Liste. Die Farben auf dem Bildschirm ändern sich nicht.',
        it: 'La tavolozza “{name}” esce dall’elenco quando applichi. I colori già sullo schermo non cambiano.',
    },
    paletteDeleteConfirm: {
        pt: 'Apagar', en: 'Delete', es: 'Borrar', fr: 'Supprimer', de: 'Löschen', it: 'Elimina',
    },
    paletteDeleteCancel: {
        pt: 'Cancelar', en: 'Cancel', es: 'Cancelar', fr: 'Annuler', de: 'Abbrechen', it: 'Annulla',
    },
    brandPaletteLabel: {
        pt: 'Paleta da marca', en: 'Brand palette', es: 'Paleta de la marca',
        fr: 'Palette de la marque', de: 'Markenpalette', it: 'Tavolozza del marchio',
    },
    brandPaletteFromColor: {
        pt: 'Gerar da cor acima', en: 'Generate from the color above', es: 'Generar desde el color de arriba',
        fr: 'Générer depuis la couleur ci-dessus', de: 'Aus der Farbe oben erzeugen', it: 'Genera dal colore sopra',
    },
} satisfies Record<string, LibraryTextEntry>;
