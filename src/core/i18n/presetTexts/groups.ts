/** Títulos de grupos do painel de personalização. Ordem da tupla: pt, en, es, fr, de, it. */
type SixTuple = readonly [string, string, string, string, string, string];

export const PRESET_GROUP_TITLES: Readonly<Record<string, SixTuple>> = {
    personalities: ['Personalidades', 'Personalities', 'Personalidades', 'Personnalités', 'Persönlichkeiten', 'Personalità'],
    sidebar: ['Barra lateral', 'Sidebar', 'Barra lateral', 'Barre latérale', 'Seitenleiste', 'Barra laterale'],
    topbar: ['Barra de topo', 'Top bar', 'Barra superior', 'Barre du haut', 'Obere Leiste', 'Barra superiore'],
    contentWidth: ['Largura do conteúdo', 'Content width', 'Ancho del contenido', 'Largeur du contenu', 'Inhaltsbreite', 'Larghezza del contenuto'],
    cards: ['Estilo dos cards', 'Card style', 'Estilo de las tarjetas', 'Style des cartes', 'Kartenstil', 'Stile delle schede'],
    cardTextures: ['Textura dos cards', 'Card texture', 'Textura de las tarjetas', 'Texture des cartes', 'Kartentextur', 'Texture delle schede'],
    corners: ['Cantos', 'Corners', 'Esquinas', 'Coins', 'Ecken', 'Angoli'],
    density: ['Densidade', 'Density', 'Densidad', 'Densité', 'Dichte', 'Densità'],
    shadow: ['Sombra', 'Shadow', 'Sombra', 'Ombre', 'Schatten', 'Ombra'],
    shadowDirection: ['Direção da sombra', 'Shadow direction', 'Dirección de la sombra', 'Direction de l\'ombre', 'Schattenrichtung', 'Direzione dell\'ombra'],
    border: ['Moldura', 'Border', 'Marco', 'Bordure', 'Rahmen', 'Cornice'],
    material: ['Material da superfície', 'Surface material', 'Material de la superficie', 'Matière de la surface', 'Oberflächenmaterial', 'Materiale della superficie'],
    glass: ['Vidro', 'Glass', 'Vidrio', 'Verre', 'Glas', 'Vetro'],
    atmosphere: ['Atmosfera', 'Atmosphere', 'Atmósfera', 'Atmosphère', 'Atmosphäre', 'Atmosfera'],
    gradient: ['Degradê do fundo', 'Background gradient', 'Degradado del fondo', 'Dégradé du fond', 'Hintergrundverlauf', 'Sfumatura dello sfondo'],
    textures: ['Texturas de fundo', 'Background textures', 'Texturas de fondo', 'Textures de fond', 'Hintergrundtexturen', 'Texture di sfondo'],
    buttons: ['Botões', 'Buttons', 'Botones', 'Boutons', 'Schaltflächen', 'Pulsanti'],
    buttonStyles: ['Botões por estilo', 'Buttons by style', 'Botones por estilo', 'Boutons par style', 'Schaltflächen nach Stil', 'Pulsanti per stile'],
    inputs: ['Campos', 'Fields', 'Campos', 'Champs', 'Felder', 'Campi'],
    tables: ['Tabelas', 'Tables', 'Tablas', 'Tableaux', 'Tabellen', 'Tabelle'],
    charts: ['Gráficos', 'Charts', 'Gráficos', 'Graphiques', 'Diagramme', 'Grafici'],
    modal: ['Janelas', 'Windows', 'Ventanas', 'Fenêtres', 'Fenster', 'Finestre'],
    notice: ['Dicas e avisos', 'Tips and notices', 'Consejos y avisos', 'Astuces et avis', 'Tipps und Hinweise', 'Suggerimenti e avvisi'],
    switch: ['Interruptores', 'Switches', 'Interruptores', 'Interrupteurs', 'Schalter', 'Interruttori'],
    scroll: ['Barra de rolagem', 'Scroll bar', 'Barra de desplazamiento', 'Barre de défilement', 'Bildlaufleiste', 'Barra di scorrimento'],
    badge: ['Selos e progresso', 'Badges and progress', 'Sellos y progreso', 'Badges et progression', 'Marken und Fortschritt', 'Etichette e avanzamento'],
    emptyState: ['Estados vazios', 'Empty states', 'Estados vacíos', 'États vides', 'Leere Zustände', 'Stati vuoti'],
    motion: ['Movimento', 'Motion', 'Movimiento', 'Mouvement', 'Bewegung', 'Movimento'],
    pageTransition: ['Troca de página', 'Page transition', 'Cambio de página', 'Changement de page', 'Seitenwechsel', 'Cambio di pagina'],
    icons: ['Ícones', 'Icons', 'Iconos', 'Icônes', 'Symbole', 'Icone'],
    fontPairs: ['Pares de fontes', 'Font pairs', 'Pares de fuentes', 'Paires de polices', 'Schriftpaare', 'Coppie di font'],
    typeScale: ['Escala tipográfica', 'Type scale', 'Escala tipográfica', 'Échelle typographique', 'Schriftskala', 'Scala tipografica'],
    fonts: ['Todas as fontes', 'All fonts', 'Todas las fuentes', 'Toutes les polices', 'Alle Schriften', 'Tutti i font'],
};

export const PRESET_FAMILY_TITLES: Readonly<Record<string, SixTuple>> = {
    technical: ['Técnicas', 'Technical', 'Técnicas', 'Techniques', 'Technisch', 'Tecniche'],
    organic: ['Orgânicas', 'Organic', 'Orgánicas', 'Organiques', 'Organisch', 'Organiche'],
    geometric: ['Geométricas', 'Geometric', 'Geométricas', 'Géométriques', 'Geometrisch', 'Geometriche'],
    materials: ['Materiais', 'Materials', 'Materiales', 'Matières', 'Materialien', 'Materiali'],
};

export const PRESET_FONT_CATEGORY_TITLES: Readonly<Record<string, SixTuple>> = {
    'Sans-Serif': ['Sem serifa', 'Sans-serif', 'Sin serifa', 'Sans empattement', 'Serifenlos', 'Senza grazie'],
    Serif: ['Com serifa', 'Serif', 'Con serifa', 'Avec empattement', 'Mit Serifen', 'Con grazie'],
    Display: ['De destaque', 'Display', 'De titulares', 'D\'affichage', 'Auszeichnung', 'Da titolo'],
    Monospace: ['Espaçamento fixo', 'Monospace', 'Ancho fijo', 'Chasse fixe', 'Festbreite', 'Spaziatura fissa'],
    Handwriting: ['Manuscritas', 'Handwriting', 'Manuscritas', 'Manuscrites', 'Handschrift', 'Calligrafiche'],
};

type PresetUiTextKey = 'seeAll' | 'seeFewer' | 'seeAllCount' | 'searchOptionsPresets' | 'newBadge' | 'personalityHint' | 'personalityKeepTitle' | 'personalityKeepMessageOne'
    | 'personalityKeepMessageMany' | 'personalityKeepDiscard' | 'personalityKeepConfirm' | 'brandPersonality' | 'brandPersonalityNone';

export const PRESET_UI_TEXT: Readonly<Record<PresetUiTextKey, SixTuple>> = {
    seeAll: ['Ver todas', 'See all', 'Ver todas', 'Tout voir', 'Alle anzeigen', 'Vedi tutte'],
    seeFewer: ['Ver menos', 'See fewer', 'Ver menos', 'Voir moins', 'Weniger anzeigen', 'Vedi meno'],
    seeAllCount: ['Ver todas ({count})', 'See all ({count})', 'Ver todas ({count})', 'Tout voir ({count})', 'Alle anzeigen ({count})', 'Vedi tutte ({count})'],
    searchOptionsPresets: ['Opções', 'Options', 'Opciones', 'Options', 'Optionen', 'Opzioni'],
    newBadge: ['Novo', 'New', 'Nuevo', 'Nouveau', 'Neu', 'Nuovo'],
    personalityHint: [
        'Muda a forma, as fontes, a densidade, as barras, a tabela, o movimento e os ícones de uma vez. A cor fica a da paleta escolhida.',
        'Changes the shape, fonts, density, bars, table, motion and icons at once. The color stays the chosen palette.',
        'Cambia la forma, las fuentes, la densidad, las barras, la tabla, el movimiento y los iconos de una vez. El color sigue siendo el de la paleta elegida.',
        'Change la forme, les polices, la densité, les barres, le tableau, le mouvement et les icônes en une fois. La couleur reste celle de la palette choisie.',
        'Ändert Form, Schriften, Dichte, Leisten, Tabelle, Bewegung und Symbole auf einmal. Die Farbe bleibt die der gewählten Palette.',
        'Cambia forma, font, densità, barre, tabella, movimento e icone in una volta. Il colore resta quello della palette scelta.',
    ],
    personalityKeepTitle: [
        'Manter os ajustes de estrutura?', 'Keep your structure adjustments?', '¿Mantener los ajustes de estructura?',
        'Conserver vos réglages de structure ?', 'Strukturanpassungen beibehalten?', 'Mantenere le modifiche alla struttura?',
    ],
    personalityKeepMessageOne: [
        'Você ajustou 1 item de estrutura à mão. A nova personalidade pode mantê-lo ou trocá-lo pelo dela.',
        'You adjusted 1 structure item by hand. The new personality can keep it or replace it with its own.',
        'Ajustaste 1 elemento de estructura a mano. La nueva personalidad puede mantenerlo o reemplazarlo por el suyo.',
        'Vous avez réglé 1 élément de structure à la main. La nouvelle personnalité peut le garder ou le remplacer par le sien.',
        'Sie haben 1 Strukturelement von Hand angepasst. Die neue Persönlichkeit kann es behalten oder durch ihr eigenes ersetzen.',
        'Hai modificato a mano 1 elemento della struttura. La nuova personalità può mantenerlo o sostituirlo con il suo.',
    ],
    personalityKeepMessageMany: [
        'Você ajustou {count} itens de estrutura à mão. A nova personalidade pode mantê-los ou trocá-los pelos dela.',
        'You adjusted {count} structure items by hand. The new personality can keep them or replace them with its own.',
        'Ajustaste {count} elementos de estructura a mano. La nueva personalidad puede mantenerlos o reemplazarlos por los suyos.',
        'Vous avez réglé {count} éléments de structure à la main. La nouvelle personnalité peut les garder ou les remplacer par les siens.',
        'Sie haben {count} Strukturelemente von Hand angepasst. Die neue Persönlichkeit kann sie behalten oder durch ihre eigenen ersetzen.',
        'Hai modificato a mano {count} elementi della struttura. La nuova personalità può mantenerli o sostituirli con i suoi.',
    ],
    personalityKeepDiscard: ['Descartar ajustes', 'Discard adjustments', 'Descartar ajustes', 'Abandonner les réglages', 'Anpassungen verwerfen', 'Scarta le modifiche'],
    personalityKeepConfirm: ['Manter ajustes', 'Keep adjustments', 'Mantener ajustes', 'Garder les réglages', 'Anpassungen behalten', 'Mantieni le modifiche'],
    brandPersonality: ['Personalidade (opcional)', 'Personality (optional)', 'Personalidad (opcional)', 'Personnalité (facultatif)', 'Persönlichkeit (optional)', 'Personalità (facoltativa)'],
    brandPersonalityNone: ['Nenhuma: manter a estrutura atual', 'None: keep the current structure', 'Ninguna: mantener la estructura actual', 'Aucune : garder la structure actuelle', 'Keine: aktuelle Struktur beibehalten', 'Nessuna: mantieni la struttura attuale'],
};
