import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Nomes dos tipos de harmonia oferecidos pelo motor de paletas. */
export const CATALOG_PALETTE = {
    paletteTypeMonochromatic: {
        pt: 'Monocromática', en: 'Monochromatic', es: 'Monocromática',
        fr: 'Monochromatique', de: 'Monochromatisch', it: 'Monocromatica',
    },
    paletteTypeAnalogous: {
        pt: 'Análoga', en: 'Analogous', es: 'Análoga',
        fr: 'Analogue', de: 'Benachbart', it: 'Analoga',
    },
    paletteTypeComplementary: {
        pt: 'Complementar', en: 'Complementary', es: 'Complementaria',
        fr: 'Complémentaire', de: 'Komplementär', it: 'Complementare',
    },
    paletteTypeSplitComplementary: {
        pt: 'Complementar dividida', en: 'Split complementary', es: 'Complementaria dividida',
        fr: 'Complémentaire divisée', de: 'Geteilt komplementär', it: 'Complementare divisa',
    },
    paletteTypeTriadic: {
        pt: 'Triádica', en: 'Triadic', es: 'Triádica',
        fr: 'Triadique', de: 'Triadisch', it: 'Triadica',
    },
    paletteSectionTitle: {
        pt: 'Paleta de cores', en: 'Color palette', es: 'Paleta de colores',
        fr: 'Palette de couleurs', de: 'Farbpalette', it: 'Tavolozza di colori',
    },
    paletteSectionHint: {
        pt: 'Escolha uma paleta pronta ou crie uma a partir de uma cor. Vale no rascunho até você aplicar.',
        en: 'Pick a ready-made palette or create one from a color. It stays a draft until you apply.',
        es: 'Elija una paleta lista o cree una a partir de un color. Sigue como borrador hasta que aplique.',
        fr: 'Choisissez une palette prête ou créez-en une à partir d’une couleur. Elle reste un brouillon jusqu’à l’application.',
        de: 'Wählen Sie eine fertige Palette oder erstellen Sie eine aus einer Farbe. Sie bleibt ein Entwurf, bis Sie anwenden.',
        it: 'Scegli una tavolozza pronta o creane una da un colore. Resta una bozza finché non applichi.',
    },
    paletteGalleryLabel: {
        pt: 'Paletas prontas', en: 'Ready-made palettes', es: 'Paletas listas',
        fr: 'Palettes prêtes', de: 'Fertige Paletten', it: 'Tavolozze pronte',
    },
    paletteOptionLabel: {
        pt: '{name} — {type}', en: '{name} — {type}', es: '{name} — {type}',
        fr: '{name} — {type}', de: '{name} — {type}', it: '{name} — {type}',
    },
    paletteModeLight: {
        pt: 'Claro', en: 'Light', es: 'Claro', fr: 'Clair', de: 'Hell', it: 'Chiaro',
    },
    paletteModeDark: {
        pt: 'Escuro', en: 'Dark', es: 'Oscuro', fr: 'Sombre', de: 'Dunkel', it: 'Scuro',
    },
    paletteCreateOpen: {
        pt: 'Criar paleta a partir de uma cor', en: 'Create a palette from a color',
        es: 'Crear paleta a partir de un color', fr: 'Créer une palette à partir d’une couleur',
        de: 'Palette aus einer Farbe erstellen', it: 'Crea una tavolozza da un colore',
    },
    paletteCreateTitle: {
        pt: 'Criar paleta', en: 'Create palette', es: 'Crear paleta',
        fr: 'Créer une palette', de: 'Palette erstellen', it: 'Crea tavolozza',
    },
    paletteBaseColor: {
        pt: 'Cor-base', en: 'Base color', es: 'Color base', fr: 'Couleur de base', de: 'Basisfarbe', it: 'Colore base',
    },
    paletteTypeLabel: {
        pt: 'Tipo de paleta', en: 'Palette type', es: 'Tipo de paleta',
        fr: 'Type de palette', de: 'Palettentyp', it: 'Tipo di tavolozza',
    },
    paletteSecondaryUse: {
        pt: 'Definir a cor secundária', en: 'Set the secondary color', es: 'Definir el color secundario',
        fr: 'Définir la couleur secondaire', de: 'Sekundärfarbe festlegen', it: 'Imposta il colore secondario',
    },
    paletteSecondaryColor: {
        pt: 'Cor secundária', en: 'Secondary color', es: 'Color secundario',
        fr: 'Couleur secondaire', de: 'Sekundärfarbe', it: 'Colore secondario',
    },
    paletteAccentUse: {
        pt: 'Definir o acento', en: 'Set the accent', es: 'Definir el acento',
        fr: 'Définir l’accent', de: 'Akzent festlegen', it: 'Imposta l’accento',
    },
    paletteAccentColor: {
        pt: 'Cor de acento', en: 'Accent color', es: 'Color de acento',
        fr: 'Couleur d’accent', de: 'Akzentfarbe', it: 'Colore di accento',
    },
    palettePreviewLabel: {
        pt: 'Prévia da paleta: {name}', en: 'Palette preview: {name}', es: 'Vista previa de la paleta: {name}',
        fr: 'Aperçu de la palette : {name}', de: 'Palettenvorschau: {name}', it: 'Anteprima della tavolozza: {name}',
    },
    paletteCustomName: {
        pt: 'Paleta criada', en: 'Created palette', es: 'Paleta creada',
        fr: 'Palette créée', de: 'Erstellte Palette', it: 'Tavolozza creata',
    },
    paletteCreateConfirm: {
        pt: 'Usar esta paleta', en: 'Use this palette', es: 'Usar esta paleta',
        fr: 'Utiliser cette palette', de: 'Diese Palette verwenden', it: 'Usa questa tavolozza',
    },
    paletteCreateCancel: {
        pt: 'Fechar', en: 'Close', es: 'Cerrar', fr: 'Fermer', de: 'Schließen', it: 'Chiudi',
    },
    paletteKeepTitle: {
        pt: 'Trocar de paleta?', en: 'Switch palette?', es: '¿Cambiar de paleta?',
        fr: 'Changer de palette ?', de: 'Palette wechseln?', it: 'Cambiare tavolozza?',
    },
    paletteKeepMessage: {
        pt: 'Você ajustou {count} cor(es) à mão. Manter esses ajustes sobre a nova paleta ou descartá-los?',
        en: 'You adjusted {count} color(s) by hand. Keep those adjustments over the new palette or discard them?',
        es: 'Ajustó {count} color(es) a mano. ¿Mantener esos ajustes sobre la nueva paleta o descartarlos?',
        fr: 'Vous avez ajusté {count} couleur(s) à la main. Garder ces ajustements sur la nouvelle palette ou les abandonner ?',
        de: 'Sie haben {count} Farbe(n) von Hand angepasst. Diese Anpassungen auf der neuen Palette behalten oder verwerfen?',
        it: 'Hai modificato {count} colore/i a mano. Mantenere queste modifiche sulla nuova tavolozza o scartarle?',
    },
    paletteKeepConfirm: {
        pt: 'Manter meus ajustes', en: 'Keep my adjustments', es: 'Mantener mis ajustes',
        fr: 'Garder mes ajustements', de: 'Meine Anpassungen behalten', it: 'Mantieni le mie modifiche',
    },
    paletteKeepDiscard: {
        pt: 'Descartar ajustes', en: 'Discard adjustments', es: 'Descartar ajustes',
        fr: 'Abandonner les ajustements', de: 'Anpassungen verwerfen', it: 'Scarta le modifiche',
    },
    palettePresetOceano: {
        pt: 'Oceano', en: 'Ocean', es: 'Océano',
        fr: 'Océan', de: 'Ozean', it: 'Oceano',
    },
    palettePresetCianoVioleta: {
        pt: 'Ciano e violeta', en: 'Cyan and violet', es: 'Cian y violeta',
        fr: 'Cyan et violet', de: 'Cyan und Violett', it: 'Ciano e viola',
    },
    palettePresetVerdeNeon: {
        pt: 'Verde néon', en: 'Neon green', es: 'Verde neón',
        fr: 'Vert néon', de: 'Neongrün', it: 'Verde neon',
    },
    palettePresetCobaltoVivo: {
        pt: 'Cobalto vivo', en: 'Vivid cobalt', es: 'Cobalto vivo',
        fr: 'Cobalt vif', de: 'Leuchtendes Kobalt', it: 'Cobalto vivo',
    },
    palettePresetTerraArgila: {
        pt: 'Terra e argila', en: 'Earth and clay', es: 'Tierra y arcilla',
        fr: 'Terre et argile', de: 'Erde und Ton', it: 'Terra e argilla',
    },
    palettePresetAmareloContraste: {
        pt: 'Amarelo contraste', en: 'High-contrast yellow', es: 'Amarillo contraste',
        fr: 'Jaune contraste', de: 'Kontrastgelb', it: 'Giallo a contrasto',
    },
    palettePresetAmbarIndustrial: {
        pt: 'Âmbar industrial', en: 'Industrial amber', es: 'Ámbar industrial',
        fr: 'Ambre industriel', de: 'Industrie-Bernstein', it: 'Ambra industriale',
    },
    palettePresetRosaSynthwave: {
        pt: 'Rosa synthwave', en: 'Synthwave pink', es: 'Rosa synthwave',
        fr: 'Rose synthwave', de: 'Synthwave-Pink', it: 'Rosa synthwave',
    },
    palettePresetCoralCinetico: {
        pt: 'Coral cinético', en: 'Kinetic coral', es: 'Coral cinético',
        fr: 'Corail cinétique', de: 'Kinetisches Korallenrot', it: 'Corallo cinetico',
    },
    palettePresetVerdeTecnico: {
        pt: 'Verde técnico', en: 'Technical green', es: 'Verde técnico',
        fr: 'Vert technique', de: 'Technisches Grün', it: 'Verde tecnico',
    },
    palettePresetAmetistaPetroleo: {
        pt: 'Ametista e petróleo', en: 'Amethyst and petrol', es: 'Amatista y petróleo',
        fr: 'Améthyste et pétrole', de: 'Amethyst und Petrol', it: 'Ametista e petrolio',
    },
    palettePresetRosaPastel: {
        pt: 'Rosa pastel', en: 'Pastel rose', es: 'Rosa pastel',
        fr: 'Rose pastel', de: 'Pastellrosa', it: 'Rosa pastello',
    },
    palettePresetAzulProjeto: {
        pt: 'Azul de projeto', en: 'Blueprint blue', es: 'Azul de proyecto',
        fr: 'Bleu de plan', de: 'Konstruktionsblau', it: 'Blu di progetto',
    },
    palettePresetGrafiteRosa: {
        pt: 'Grafite e rosa', en: 'Graphite and rose', es: 'Grafito y rosa',
        fr: 'Graphite et rose', de: 'Graphit und Rosé', it: 'Grafite e rosa',
    },
    palettePresetTintaVinho: {
        pt: 'Tinta e vinho', en: 'Ink and wine', es: 'Tinta y vino',
        fr: 'Encre et vin', de: 'Tinte und Wein', it: 'Inchiostro e vino',
    },
} satisfies Record<string, LibraryTextEntry>;
