import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Textos da coluna de decisões do painel: as seis decisões, o ajuste fino, o atalho de marca e a barra da prévia. */
export const CATALOG_PANEL_COLUMN = {
    decisionTheme: { pt: 'Tema', en: 'Theme', es: 'Tema', fr: 'Thème', de: 'Thema', it: 'Tema' },
    decisionColors: { pt: 'Cores', en: 'Colors', es: 'Colores', fr: 'Couleurs', de: 'Farben', it: 'Colori' },
    decisionFonts: { pt: 'Fontes', en: 'Fonts', es: 'Fuentes', fr: 'Polices', de: 'Schriften', it: 'Font' },
    decisionShape: { pt: 'Forma', en: 'Shape', es: 'Forma', fr: 'Forme', de: 'Form', it: 'Forma' },
    decisionComponents: { pt: 'Componentes', en: 'Components', es: 'Componentes', fr: 'Composants', de: 'Komponenten', it: 'Componenti' },
    decisionLayout: { pt: 'Layout', en: 'Layout', es: 'Diseño', fr: 'Mise en page', de: 'Layout', it: 'Layout' },
    decisionAdvanced: { pt: 'Outros ajustes', en: 'Other settings', es: 'Otros ajustes', fr: 'Autres réglages', de: 'Weitere Einstellungen', it: 'Altre impostazioni' },
    decisionChanged: { pt: 'Alterada', en: 'Changed', es: 'Modificada', fr: 'Modifiée', de: 'Geändert', it: 'Modificata' },
    decisionCustomTheme: { pt: 'Personalizado', en: 'Custom', es: 'Personalizado', fr: 'Personnalisé', de: 'Benutzerdefiniert', it: 'Personalizzato' },
    decisionListLabel: { pt: 'Decisões do tema', en: 'Theme decisions', es: 'Decisiones del tema', fr: 'Décisions du thème', de: 'Entscheidungen zum Thema', it: 'Decisioni del tema' },
    optionGroupThemes: { pt: 'Temas prontos', en: 'Ready themes', es: 'Temas listos', fr: 'Thèmes prêts', de: 'Fertige Themen', it: 'Temi pronti' },
    optionGroupFonts: { pt: 'Pares de fontes', en: 'Font pairs', es: 'Pares de fuentes', fr: 'Paires de polices', de: 'Schriftpaare', it: 'Coppie di font' },
    optionGroupCards: { pt: 'Estilo dos cards', en: 'Card style', es: 'Estilo de las tarjetas', fr: 'Style des cartes', de: 'Kartenstil', it: 'Stile delle schede' },
    optionGroupAtmosphere: { pt: 'Atmosfera e textura', en: 'Atmosphere and texture', es: 'Atmósfera y textura', fr: 'Atmosphère et texture', de: 'Atmosphäre und Textur', it: 'Atmosfera e texture' },
    optionGroupButtons: { pt: 'Botões', en: 'Buttons', es: 'Botones', fr: 'Boutons', de: 'Schaltflächen', it: 'Pulsanti' },
    optionGroupInputs: { pt: 'Campos', en: 'Fields', es: 'Campos', fr: 'Champs', de: 'Felder', it: 'Campi' },
    optionGroupGlobal: { pt: 'Preferências e identidade', en: 'Preferences and identity', es: 'Preferencias e identidad', fr: 'Préférences et identité', de: 'Einstellungen und Identität', it: 'Preferenze e identità' },
    decisionDiscard: { pt: 'Descartar alterações desta decisão', en: 'Discard changes in this decision', es: 'Descartar los cambios de esta decisión', fr: 'Annuler les modifications de cette décision', de: 'Änderungen dieser Entscheidung verwerfen', it: 'Scarta le modifiche di questa decisione' },
    panelBack: { pt: 'Voltar', en: 'Back', es: 'Volver', fr: 'Retour', de: 'Zurück', it: 'Indietro' },
    panelBackLabel: {
        pt: 'Voltar para a lista de decisões', en: 'Back to the list of decisions', es: 'Volver a la lista de decisiones',
        fr: 'Retour à la liste des décisions', de: 'Zurück zur Liste der Entscheidungen', it: 'Torna all’elenco delle decisioni',
    },
    optionsMainTitle: { pt: 'Ajustes principais', en: 'Main settings', es: 'Ajustes principales', fr: 'Réglages principaux', de: 'Wichtigste Einstellungen', it: 'Impostazioni principali' },
    fineTuningTitle: { pt: 'Ajuste fino', en: 'Fine tuning', es: 'Ajuste fino', fr: 'Réglage fin', de: 'Feinabstimmung', it: 'Regolazione fine' },
    fineTuningCount: { pt: '{count} ajustes', en: '{count} settings', es: '{count} ajustes', fr: '{count} réglages', de: '{count} Einstellungen', it: '{count} impostazioni' },
    fineTuningShowAll: {
        pt: 'Mostrar todos os {count} ajustes', en: 'Show all {count} settings', es: 'Mostrar los {count} ajustes',
        fr: 'Afficher les {count} réglages', de: 'Alle {count} Einstellungen zeigen', it: 'Mostra tutte le {count} impostazioni',
    },
    fineTuningShowLess: {
        pt: 'Mostrar só os principais', en: 'Show only the main ones', es: 'Mostrar solo los principales',
        fr: 'Afficher seulement les principaux', de: 'Nur die wichtigsten zeigen', it: 'Mostra solo le principali',
    },
    fineTuningEmpty: {
        pt: 'Esta decisão não tem ajuste fino.', en: 'This decision has no fine tuning.', es: 'Esta decisión no tiene ajuste fino.',
        fr: 'Cette décision n’a pas de réglage fin.', de: 'Diese Entscheidung hat keine Feinabstimmung.', it: 'Questa decisione non ha regolazione fine.',
    },
    searchResultsTitle: {
        pt: 'Resultados da busca ({count})', en: 'Search results ({count})', es: 'Resultados de la búsqueda ({count})',
        fr: 'Résultats de la recherche ({count})', de: 'Suchergebnisse ({count})', it: 'Risultati della ricerca ({count})',
    },
    searchNoResults: {
        pt: 'Nenhum controle encontrado para “{query}”.', en: 'No control found for “{query}”.', es: 'Ningún control encontrado para “{query}”.',
        fr: 'Aucun contrôle trouvé pour « {query} ».', de: 'Kein Steuerelement für „{query}“ gefunden.', it: 'Nessun controllo trovato per “{query}”.',
    },
    searchResultOpen: {
        pt: 'Abrir {name} em {place}', en: 'Open {name} in {place}', es: 'Abrir {name} en {place}',
        fr: 'Ouvrir {name} dans {place}', de: '{name} in {place} öffnen', it: 'Apri {name} in {place}',
    },
    searchGroupTitle: { pt: '{name} ({count})', en: '{name} ({count})', es: '{name} ({count})', fr: '{name} ({count})', de: '{name} ({count})', it: '{name} ({count})' },
    searchShowAll: {
        pt: 'Ver todos ({count})', en: 'See all ({count})', es: 'Ver todos ({count})',
        fr: 'Tout voir ({count})', de: 'Alle anzeigen ({count})', it: 'Vedi tutti ({count})',
    },
    searchShowFewer: { pt: 'Ver menos', en: 'See fewer', es: 'Ver menos', fr: 'Voir moins', de: 'Weniger anzeigen', it: 'Vedi meno' },
    searchPickArea: {
        pt: 'Muitos resultados. Escolha uma área:', en: 'Many results. Pick an area:', es: 'Muchos resultados. Elige un área:',
        fr: 'Beaucoup de résultats. Choisissez un domaine :', de: 'Viele Ergebnisse. Wähle einen Bereich:', it: 'Molti risultati. Scegli un’area:',
    },
    searchAllAreas: { pt: 'Todas as áreas', en: 'All areas', es: 'Todas las áreas', fr: 'Tous les domaines', de: 'Alle Bereiche', it: 'Tutte le aree' },
    searchOptionsTitle: { pt: 'Opções', en: 'Options', es: 'Opciones', fr: 'Options', de: 'Optionen', it: 'Opzioni' },
    searchOptionOpen: {
        pt: 'Abrir {place}', en: 'Open {place}', es: 'Abrir {place}',
        fr: 'Ouvrir {place}', de: '{place} öffnen', it: 'Apri {place}',
    },
    searchDidYouMean: {
        pt: 'Você quis dizer “{term}”?', en: 'Did you mean “{term}”?', es: '¿Quisiste decir “{term}”?',
        fr: 'Vouliez-vous dire « {term} » ?', de: 'Meintest du „{term}“?', it: 'Intendevi “{term}”?',
    },
    searchTryDecisions: {
        pt: 'Ou comece por uma decisão:', en: 'Or start from a decision:', es: 'O empieza por una decisión:',
        fr: 'Ou commencez par une décision :', de: 'Oder beginne mit einer Entscheidung:', it: 'Oppure parti da una decisione:',
    },
    brandShortcutTitle: { pt: 'Usar minha marca', en: 'Use my brand', es: 'Usar mi marca', fr: 'Utiliser ma marque', de: 'Meine Marke verwenden', it: 'Usa il mio marchio' },
    brandShortcutHint: {
        pt: 'Logo, cor e fonte: tema pronto em um passo', en: 'Logo, color and font: a ready theme in one step', es: 'Logo, color y fuente: tema listo en un paso',
        fr: 'Logo, couleur et police : un thème prêt en une étape', de: 'Logo, Farbe und Schrift: ein fertiges Thema in einem Schritt', it: 'Logo, colore e font: un tema pronto in un passo',
    },
    brandDirtyLabel: { pt: 'Identidade da empresa', en: 'Company identity', es: 'Identidad de la empresa', fr: 'Identité de l’entreprise', de: 'Firmenidentität', it: 'Identità aziendale' },
    brandName: { pt: 'Nome da empresa', en: 'Company name', es: 'Nombre de la empresa', fr: 'Nom de l’entreprise', de: 'Firmenname', it: 'Nome dell’azienda' },
    brandLogo: { pt: 'Logo', en: 'Logo', es: 'Logo', fr: 'Logo', de: 'Logo', it: 'Logo' },
    brandColor: { pt: 'Cor principal da marca', en: 'Main brand color', es: 'Color principal de la marca', fr: 'Couleur principale de la marque', de: 'Hauptfarbe der Marke', it: 'Colore principale del marchio' },
    brandColorCode: { pt: 'Código da cor', en: 'Color code', es: 'Código del color', fr: 'Code couleur', de: 'Farbcode', it: 'Codice colore' },
    brandFontStyle: { pt: 'Estilo das fontes', en: 'Font style', es: 'Estilo de las fuentes', fr: 'Style des polices', de: 'Schriftstil', it: 'Stile dei font' },
    brandGenerate: { pt: 'Gerar meu tema', en: 'Generate my theme', es: 'Generar mi tema', fr: 'Générer mon thème', de: 'Mein Thema erzeugen', it: 'Genera il mio tema' },
    brandNote: {
        pt: 'A paleta nasce da cor e o resto vem do tema atual. Nada é gravado até “Aplicar”.',
        en: 'The palette comes from the color and the rest from the current theme. Nothing is saved until “Apply”.',
        es: 'La paleta nace del color y el resto viene del tema actual. Nada se guarda hasta “Aplicar”.',
        fr: 'La palette naît de la couleur et le reste vient du thème actuel. Rien n’est enregistré avant « Appliquer ».',
        de: 'Die Palette entsteht aus der Farbe, der Rest kommt vom aktuellen Thema. Nichts wird gespeichert, bis du „Anwenden“ wählst.',
        it: 'La tavolozza nasce dal colore e il resto viene dal tema attuale. Nulla viene salvato finché non scegli “Applica”.',
    },
    brandGenerated: {
        pt: 'Tema gerado no rascunho. Ajuste o que quiser.', en: 'Theme generated in the draft. Adjust whatever you like.', es: 'Tema generado en el borrador. Ajusta lo que quieras.',
        fr: 'Thème généré dans le brouillon. Ajustez ce que vous voulez.', de: 'Thema im Entwurf erzeugt. Passe an, was du möchtest.', it: 'Tema generato nella bozza. Regola ciò che vuoi.',
    },
    previewModeGroup: { pt: 'Modo de cor da prévia', en: 'Preview color mode', es: 'Modo de color de la vista previa', fr: 'Mode de couleur de l’aperçu', de: 'Farbmodus der Vorschau', it: 'Modalità colore dell’anteprima' },
    previewModeLight: { pt: 'Claro', en: 'Light', es: 'Claro', fr: 'Clair', de: 'Hell', it: 'Chiaro' },
    previewModeDark: { pt: 'Escuro', en: 'Dark', es: 'Oscuro', fr: 'Sombre', de: 'Dunkel', it: 'Scuro' },
    previewScreenLabel: { pt: 'Tela de amostra', en: 'Sample screen', es: 'Pantalla de muestra', fr: 'Écran d’exemple', de: 'Beispielbildschirm', it: 'Schermata di esempio' },
    previewInspect: { pt: 'Inspecionar', en: 'Inspect', es: 'Inspeccionar', fr: 'Inspecter', de: 'Untersuchen', it: 'Ispeziona' },
    previewHint: {
        pt: 'Passe o mouse numa opção: a prévia mostra o efeito sem gravar.', en: 'Hover an option: the preview shows the effect without saving.',
        es: 'Pasa el cursor por una opción: la vista previa muestra el efecto sin guardar.', fr: 'Survolez une option : l’aperçu montre l’effet sans enregistrer.',
        de: 'Fahre über eine Option: Die Vorschau zeigt die Wirkung, ohne zu speichern.', it: 'Passa sopra un’opzione: l’anteprima mostra l’effetto senza salvare.',
    },
} satisfies Record<string, LibraryTextEntry>;
